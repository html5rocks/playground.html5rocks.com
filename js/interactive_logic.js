// Anonymous function, keep the global namespace squeeky clean..
(function() {
  if (typeof window.console == 'undefined') {
    window.console = {};
    window.console.log = function(message) {};
  }

  // alias
  window.sampleList = window.codeArray;
  
  var fileTypes = {
    'js' : 'javascript',
    'html' : 'html',
    'php' : 'php'
  };

  var matchingScriptTagPriorityList = [
    /<script[^>]*type="javascript\/worker"[^>]*>[\w\W]+?<\/script>/g,
    /<script[^>]*type="text\/plain"[^>]*>[\w\W]+?<\/script>/g,
    /(<script>[\w\W]+?<\/script>)/g
  ];

  function _cel(name) {
    return document.createElement(name);
  }

  function InteractiveSample(){
    this.categories = [];
    this.subCategories = [];
    this.codeTitles = [];
    this.selectCode = null;
    this.codeDiv = null;
    this.codeLIs = [];
    this.currentCode = {};
    this.curI = '';
    this.codeEditorDivs;
    this.currentEditor;
    this.temporaryBoilerplate;
    this.xhrInProgress = false;

    this.uiEffects = {};
    this.runBox = {};

    this.heightOfRunFrame = 0;  //height of #runFrame
    this.autoCompleteData = [];
    this.insertJavascriptRegex;
  };
  
  InteractiveSample.prototype.addDeleteIcon = function(li, id) {
    var deleteCodeImg = _cel('img');
    deleteCodeImg.src = 'images/trash.gif';
    deleteCodeImg.style.cursor = 'pointer';
    deleteCodeImg.style.marginLeft = '6px';
    $(deleteCodeImg).bind('click', this.deleteCustomExample(id));
    li.appendChild(deleteCodeImg);
  };

  InteractiveSample.prototype.addNewSampleMarkers = function(response) {
    var newSamples;
    if (response.responseStatus == 200) {
      newSamples = {};
      entries = response.responseData.feed.entries;
      for (var i = 0; i < entries.length; i++) {
        var sampleAddedRegex = /Add.*\/trunk\/interactive_samples\/.*\.js/g;
        var matches = entries[i].content.match(sampleAddedRegex);
        if (matches) {
          for (var j = 0; j < matches.length; j++) {
            var filename = matches[j].match(/samples\/js.*/g);
            if (filename != null && typeof newSamples[filename[0]] == 'undefined') {
              newSamples[filename] = true;;
            }
          }
        }
      }
    }
    
    for (var i in newSamples) {
      if (newSamples.hasOwnProperty(i)) {
        var sample = this.sampleFileNameToObject(i);
        if (sample) {
          var li = sample.li;
          var newSup = this.createNewSup(' New!');
          li.appendChild(newSup);
          var parentCategory = is.getLiCategoryTitle(li);
          if (parentCategory.innerHTML.toLowerCase().indexOf('<sup') == -1) {
            var newCatSup = this.createNewSup(' New Samples!');
            parentCategory.appendChild(newCatSup);
          }
        }
      }        
    }
  };    

  InteractiveSample.prototype.addShowHideClicks = function() {
    for (var i = 0, len = this.categories.length; i < len; i++) {
      var cat = this.categories[i];
      var catTitle = cat.childNodes[0];
      $(catTitle).bind('click', this.toggleShowHideSubCategories(cat));
    }

    for (var j = 0; j < this.subCategories.length; j++) {
      var subCatTitle = this.subCategories[j].childNodes[0];
      $(subCatTitle).bind('click', this.toggleShowHideLIs(subCatTitle));
    };
  };

  // parse and render code to any of the editors
  InteractiveSample.prototype.changeCodeMirror = function(content, fileType) {
    var me = this;
    var match = null;
    var changeEditor = true;
    // this should be passed only on page load time
    if (fileType == 'html') {
      fileType = 'mixed';
      if (Object.prototype.toString.call(content) === '[object Array]') { // isArray
        console.error('Error: content shouldnt be an array at this point');
        return;
      }
      content = me.normalizeHTML(content);
    }
    fileType = fileType || 'mixed'; // used when toggling from js to html

    // update both js and css editors when coming from html
    if (Object.prototype.toString.call(content) === '[object Array]') { // isArray
      var jsContent = [];
      var cssContent = [];
      for (var i = 0; i < content.length; i++) {
        if (content[i] !== null) {
          if (/<script>/.test(content[i])) {
            match = content[i].match(/<script>\n\s*?([\w\W]+?)\n\s*?<\/script>/);
            if (match !== null) {
              jsContent.push(me.deIndentCode(match[1]));
            }
          } else if (/<style>/.test(content[i])) {
            match = content[i].match(/<style>\n\s*?([\w\W]+?)\n\s*?<\/style>/);
            if (match !== null) {
              cssContent.push(me.deIndentCode(match[1]));
            }
          }
        }
      }
      window['jsEditor'].setCode(decodeSpecialChars(jsContent.join('\n')));
      window['cssEditor'].setCode(decodeSpecialChars(cssContent.join('\n')));
    } else {
      // content will be passed to each editor individually on load time
      window[fileType + 'Editor'].setCode(decodeSpecialChars(content.replace(/\n$$/, '')));
      if (fileType == me.currentEditor.options.eid) {  
        me.runBox.runCode({defaultSample: true});
      }
    }
    if (changeEditor) {
      if (fileType == me.currentEditor.options.eid) {
        me.uiEffects.enableUIButton(fileType);
      }

      me.useEditor(me.currentEditor.options.eid);

      // me.currentEditor.setCode(content);
      $(me.currentEditor.frame.contentWindow.window.document.body).scrollTop(10);
      $(me.currentEditor.frame.contentWindow.window.document.body).scrollTop(0);      
    }
  };

  InteractiveSample.prototype.changeSamplesBoilerplateTo = function(sampleFileName, newBoilerplate) {
    for (var i=0; i < sampleList.length; i++) {
      for (var j=0; j < sampleList[i].samples.length; j++) {
        var sampleObj = sampleList[i].samples[j];
        if (sampleFileName == sampleObj.sampleName) {
          this.temporaryBoilerplate = sampleList[i].samples[j].boilerplateLoc;
          sampleList[i].samples[j].boilerplateLoc = newBoilerplate;
        }
      }
    }
  };

  InteractiveSample.prototype.confirmLogin = function(url, opt_mustLogin) {
    var confirmLeave;
    if (opt_mustLogin) {
      confirmLeave = confirm('You must login to save.  Logging in will lose any edited code.');
    } else {
      confirmLeave = confirm('Logging in will lose any edited code.');
    }
    url += "%23" + window.location.hash.substring(1);
    if (confirmLeave) window.location = url;
  };

  InteractiveSample.prototype.createCategories = function(showSampleFn) {
    // sampleList is from /samples/TOC/*_samples.js
    this.selectCode = $('#selectCode').get(0);
    for (var i=0; i < sampleList.length; i++) {
      var category = sampleList[i].category;
      var container = null;
      var subCategory = null;
      var categoryDiv = null;
      var subCategoryDiv = null;
      var img, link;
      if (category.indexOf('-') != -1) {
        // that means that this category is a subcategorys
        var categorySplit = category.split('-');
        category = categorySplit[0];
        subCategory = categorySplit[1];
      }
      categoryDiv = document.getElementById(category);
      if (categoryDiv == null) {
        categoryDiv = _cel('span');
        categoryDiv.className = 'category categoryClosed';
        categoryDiv.id = category;
        var catName = _cel('span');
        catName.className = 'categoryTitle';
        img = _cel('img');
        img.className = 'expand';
        img.src = 'images/cleardot.png';

        catName.appendChild(img);
        catName.innerHTML += category;
        categoryDiv.appendChild(catName);
        this.selectCode.appendChild(categoryDiv);

        this.categories.push(categoryDiv);
      }

      if (subCategory) {
        subCategoryDiv = document.createElement('div');
        var subCatName = _cel('span');
        subCatName.className = 'subCategoryTitle';

        img = _cel('img');
        img.className = 'collapse';
        img.src = 'images/cleardot.png';

        subCatName.appendChild(img);
        subCatName.innerHTML += subCategory;

        subCategoryDiv.appendChild(subCatName);
        categoryDiv.appendChild(subCategoryDiv);
      }

      container = subCategoryDiv || categoryDiv;

      var ul = _cel('ul');
      ul.className = 'categoryItems';
      container.appendChild(ul);
      for (var j=0; j < sampleList[i].samples.length; j++) {
        var item = sampleList[i].samples[j];
        var li = _cel('li');
        var me = this;
        var textNode = document.createElement('span');
        textNode.innerHTML = item.sampleName;
        textNode.style.cursor = 'pointer';
        $(textNode).bind('click', function() {
          window['jsEditor'].setCode('');
          window['cssEditor'].setCode('');
          // showSampleFn(item.sampleName).call(me)
        }); //!
        $(textNode).bind('click', showSampleFn.call(this, item.sampleName)); //!

        li.appendChild(textNode);
        if (category == 'Saved Code') {
          this.addDeleteIcon(li, sampleList[i].samples[j].id);
        }
        var tags = ' <sup>(' + ((category) || '') + ((subCategory) ? ', ' + subCategory : '');
        tags += (item.tags) ? ', ' + item.tags : '';
        tags += ')<\/sup>';
        this.autoCompleteData.push(item.sampleName + tags);
        sampleList[i].samples[j]['li'] = li;



        if (i == 0 && j == 0 && window.location.hash.length <= 1) {
          showSampleFn.call(this, item.sampleName, true)();
          this.hideAllCategoriesExcept(categoryDiv);          
        }

        if (window.location.hash.length > 0) {
          var hashName = this.nameToHashName(item.sampleName);
          if (window.location.hash.substring(1) == hashName) {
            showSampleFn.call(this, item.sampleName)();
            this.hideAllCategoriesExcept(categoryDiv);
          }
        }

        if (window.expandedCategory && category.replace(' ', '').toLowerCase().indexOf(window.expandedCategory) != -1 && window.location.hash.length <= 1) {
          this.hideAllCategoriesExcept(categoryDiv);
          if (j == 0) {
            showSampleFn.call(this, item.sampleName)();
          }
        }

        this.codeLIs.push(li);
        ul.appendChild(li);
      }

      if (container != categoryDiv) {
        this.subCategories.push(container);
      }
    }
  };

  InteractiveSample.prototype.createNewSup = function(text) {
    var newSup = document.createElement('sup');
    newSup.className = 'new';
    newSup.innerHTML = text;
    return newSup;
  }

  InteractiveSample.prototype.deleteCustomExample = function(id) {
    var me = this;
    return function() {
      var confirmDelete = confirm('Are you sure you want to delete this example?');
      if (confirmDelete) {
        var redirect = 'delete?id=' + id;
        var cookie = me.getCookie('dev_appserver_login');
        cookie = (cookie) ? cookie.replace(/\"/g, '') : me.getCookie('ACSID');
        cookie = (cookie) ? cookie.substring(6, 20) : null;
        redirect += ((curAPITypes) ? '&type=' + curAPITypes : '');
        redirect += (cookie) ? '&sc=' + 'safe' + cookie : '';
        window.location = redirect;
      }
    };
  };

  InteractiveSample.prototype.toggleEditor = function(editorType, callback) {
    var me = this;
    var content;
    var curFilename = me.getCurFilename();
    // avoid action if we push the same button twice
    if (editorType == me.currentEditor.options.eid) {
      return;
    }
    // allow to go back from html to css/js
    // we will pass an array with all the script and css changes
    // so both content get updated in each editor
    if (me.currentEditor == window.mixedEditor) {
      if (confirm("Saving features are not enabled yet. Any changes made to the HTML markup will be lost.")) {
        content = [];

        // try to match script tags according to matchingScriptTagPriorityList
        var len = matchingScriptTagPriorityList.length;
        var matches;
        for (var i = 0; i < len; i++) {
          matches = window['mixedEditor'].getCode().match(
            matchingScriptTagPriorityList[i]
          );
          if (matches) {
           if (i < len - 1) {
            $(matches).each(function(index, matched_item) {
              matches[index] = matched_item.replace(/<script[^>]*>/, '<script>');
            });
           }
           content = content.concat(matches);
           break;
          }
        }

        // try to match "<style>...</style>" for css editor
        content = content.concat(window['mixedEditor'].getCode().match(
          /(<style>[\w\W]+?<\/style>)/g
        ));

        me.currentEditor = window[editorType + 'Editor'];
        me.changeCodeMirror(content, editorType);
        if (curFilename) {
          this.htmlUrl = me.temporaryBoilerplate;
        }
      }
      return;
    }

    // go to html editor from css/js
    if (editorType == 'mixed') {
      this.getCodeAndRun(function(data) {
        me.currentEditor = window['mixedEditor'];
        me.changeCodeMirror(data);
        curFilename = me.getCurFilename();
        this.htmlUrl = '';
        if (callback) {
          callback.call(this);
        }
      });
      return;
    }
    
    // from js to css and viceversa
    me.useEditor(editorType);
    this.uiEffects.enableUIButton(editorType);
  };
  
  /*
   * Called at the very end of load time so the HTML code
   * can be loaded in place after the JS and CSS code have loaded
   */
  InteractiveSample.prototype.loadHTML = function(sampleName) {
    var sampleObj = this.sampleNameToObject(sampleName);
    this.loadCode(sampleObj.boilerplateLoc, true)
  };
  
  
  InteractiveSample.prototype.setDocsUrl = function(url) {
    this.docsUrl = url;
    if (!this.docsUrl) {
      $('#docsButton').hide();
    } else {
      $('#docsButton').show();
    }
    
  };
  
  InteractiveSample.prototype.viewDocs = function() {
    if (this.docsUrl) {
      window.open(this.docsUrl, "_is_docs");
    }
  };

  InteractiveSample.prototype.findNumSpacesToIndentCode = function(data, codeType) {
    var tryString;
    if (codeType == 'js') {
      tryString = this.insertJavascriptRegex.exec(data);
      if (tryString !== null) tryString = tryString[0];
    }
    else if (codeType == 'css') {
      tryString = this.insertCssRegex.exec(data);
      if (tryString !== null) tryString = tryString[0];
    }
    var i = '';
    while (tryString && tryString.indexOf(' ') == 0) {
      i += ' ';
      tryString = tryString.substring(1);
    }
    return i;
  };


  InteractiveSample.prototype.getCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  InteractiveSample.prototype.getCurFilename = function() {
    return this.curI;
  };


  /*
   * This is where the code gets prefetched before running it
   * in the results frame
   */
  InteractiveSample.prototype.getCodeAndRun = function(callbackFunc, code) {
    var me = this;
    var curFilename = me.getCurFilename();
    var htmlUrl = me.htmlUrl;
    var code = code || me.getCode();
    
    // html editor
    if (htmlUrl == '') {
      callbackFunc(code);
      return;
    }

    // js or css editors
    $.get(htmlUrl, function(data, success) {
      if (success) {
        if (me.currentEditor == window.jsEditor) {
          data = me.normalizeHTML(data, code);
        } else {
          data = me.normalizeHTML(data);
        }
        callbackFunc(data);
      }
    });
  };

  /*
   * Replaces JS and CSS placeholders in HTML code
   * it also replaces API key with a placeholder
   * @return data normalized HTML code
   */
  InteractiveSample.prototype.normalizeHTML = function(data, code) {
    var me = this;
    var jsCode = code || me.getCode('js');
    var cssCode = me.getCode('css');
    jsCode = (jsCode.match(/\w/) !== null) ? me.indentCodeWithTheseSpaces(jsCode, me.findNumSpacesToIndentCode(data, 'js')) : '';
    cssCode = (cssCode.match(/\w/) !== null) ? me.indentCodeWithTheseSpaces(cssCode, me.findNumSpacesToIndentCode(data, 'css')) : '';
    data = me.insertJavascript(data, jsCode);
    data = me.insertCss(data, cssCode);
    return data;
  }
  
  InteractiveSample.prototype.getCode = function(codeType) {
    if (typeof codeType === 'undefined') {
      return this.currentEditor.getCode();
    }
    return window[codeType + 'Editor'].getCode();
  }
  
  InteractiveSample.prototype.getLiCategoryTitle = function(li) {
    var parent = $(li.parentNode);
    var i = 0;
    while (!parent.hasClass('category')) {
      parent = parent.parent();
      i++;
      // for precaution, so we don't endless loop if there's an accidental bug
      if (i > 10) break;
    }
    return parent.children()[0];
  }

  InteractiveSample.prototype.getSafetyToken = function() {
    var cookie = this.getCookie('dev_appserver_login');
    cookie = (cookie) ? cookie.replace(/\"/g, '') : this.getCookie('ACSID');
    cookie = (cookie) ? cookie.substring(6, 20) : null;
    return 'safe' + cookie;
  };

  InteractiveSample.prototype.hideAllCategoriesExcept = function(category) {
    for (var i=0; i < this.categories.length; i++) {
      var curCategory = this.categories[i];
      var collapseImg = curCategory.childNodes[0].childNodes[0];
      if (curCategory != category) {
        curCategory.className = 'category categoryClosed';
        collapseImg.className = 'expand';
      } else {
        curCategory.className = 'category categoryOpen';
        collapseImg.className = 'collapse';
      }
    };
  };

  InteractiveSample.prototype.indentCodeWithTheseSpaces = function(code, indentSpaces) {
    code = indentSpaces.concat(code);
    var newLine = code.indexOf('\n');
    while (newLine != -1) {
      var start = code.slice(0, newLine);
      var end = code.slice(newLine+1);
      end = ('\n' + indentSpaces).concat(end);
      code = start.concat(end);
      newLine = code.indexOf('\n', newLine + 1);
    }
    return code;
  };

  InteractiveSample.prototype.deIndentCode = function(code) {
    var firstReturn = code.indexOf('\n');
    var firstLine = code.slice(0, firstReturn);
    var spacesToRemove = firstLine.slice(0, firstLine.indexOf(' '));
    // find first non space on the first line
    while (firstLine.match(/\S/) == null) {
      firstLine = code.slice(firstReturn + 1, code.indexOf('\n'));
    }
    var i = 0;

    // count how many spaces the indentation is
    while(firstLine.indexOf(' ') == 0) {
      i += 1;
      firstLine = firstLine.substring(1);
    }

    // go through each line and remove indentation
    var newLine = code.indexOf('\n');
    var start = code.slice(0, newLine);
    var prev = '';
    var oldstartlen = 0;
    var endbound = '';
    var end = '';
    while (newLine != -1) {
      end = code.slice(newLine + 1);
      start = start.slice(i);
      code = prev + start + '\n' + end;
      newLine = code.indexOf('\n', newLine - i + 1);
      oldstartlen = start.length;
      endbound = (newLine == -1) ? code.length : newLine;
      start = code.slice(start.length + prev.length + 1, endbound);
      prev = code.slice(0, oldstartlen + prev.length + 1);
    }
    // case for last line
    start = start.slice(i);
    code = prev + start;
    
    return code;
  };

  InteractiveSample.prototype.init = function(codeDiv) {
    this.currentEditor = window.jsEditor;
    this.codeEditorFrames = {
      'js':document.getElementById('editJS'),
      'css':document.getElementById('editCSS'),
      'mixed':document.getElementById('editMixed')
    };
    this.htmlUrl = '';
    this.insertJavascriptRegex = /[ ]*INSERT_JAVASCRIPT_HERE/;
    this.insertCssRegex = /[ ]*INSERT_CSS_HERE/;
    this.ie = ($.browser.msie);
    this.ie6 = (this.ie && $.browser.version < 7);
    this.runBox = new RunBox();
    this.runBox.init(this, !$.browser.msie);
    this.codeDiv = codeDiv;
    this.createCategories(this.showSample);
    this.addShowHideClicks();
    this.uiEffects = new UIEffects();
    this.uiEffects.init(this);
    if (window.logoutUrl) {
      this.putSafetyCookieInForms();
    }
    this.loadCodesiteFeed();
  };

  InteractiveSample.prototype.initForFramed = function(codeDiv, height_of_lower) {
    this.currentEditor = window.jsEditor;
    this.codeEditorFrames = {
        'js': document.getElementById('editJS'),
        'css': document.getElementById('editCSS'),
        'mixed': document.getElementById('editMixed')
    };
    this.htmlUrl = '';
    this.insertJavascriptRegex = /[ ]*INSERT_JAVASCRIPT_HERE/;
    this.insertCssRegex = /[ ]*INSERT_CSS_HERE/;
    this.ie = ($.browser.msie);
    this.ie6 = (this.ie && $.browser.version < 7);
    this.runBox = new RunBox();
    this.runBox.init(this, !$.browser.msie);
    this.codeDiv = codeDiv;
    if (height_of_lower) {
      this.heightOfRunFrame = parseInt(height_of_lower);
    }
    if (window.location.hash.length > 0) {
      for (var i = 0; i < sampleList.length; i++) {
        for (var j = 0; j < sampleList[i].samples.length; j++) {
          var item = sampleList[i].samples[j];
          var hashName = this.nameToHashName(item.sampleName);
          if (window.location.hash.substring(1) == hashName) {
            this.showSampleForFramed(item.sampleName);
            break;
          }
        }
      }
    }
    this.uiEffects = new UIEffects();
    this.uiEffects.initForFramed(this);
  };

  InteractiveSample.prototype.showSampleForFramed = function(sampleName, def) {
    var me = this;
    var curFilename = me.getCurFilename() || null;
    var sampleObj = me.sampleNameToObject(sampleName);
    var files = sampleObj.files;
    var thisLI = sampleObj.li;
    var catSplit = sampleObj.category.split('-');
    var categoryName = catSplit[0];

    var setAsJSEditor = true;
    me.temporaryBoilerplate = sampleObj.boilerplateLoc;
    me.htmlUrl = me.temporaryBoilerplate;
    if (sampleObj.boilerplateLoc != '') {
      editorKey = sampleObj.editor || 'js';
    }

    me.currentEditor = window[editorKey + 'Editor'];
    me.runBox.iFrameLoaded = false;

    // For linking purposes
    if (!def) {
      window.location.hash = me.nameToHashName(sampleName);
    }

    me.currentCode = {};

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      me.loadCode(file, true);
    }

    me.curI = sampleObj.sampleName;

    if (editorKey == 'mixed') {
      me.loadHTML(sampleName);
    }
  };

  InteractiveSample.prototype.insertJavascript = function(data, code) {
    data = data.replace(this.insertJavascriptRegex, code);
    return data;
  };

  InteractiveSample.prototype.insertCss = function(data, code) {
    data = data.replace(this.insertCssRegex, code);
    return data;
  };

  InteractiveSample.prototype.linkCode = function() {
    this.getCodeAndRun(this.sendCodeToServer);
  };

  InteractiveSample.prototype.loadCode = function(filename, opt_changeCodeMirror) {
    // If the code is in the currentCode buffer, then grab it there
    // otherwise, load it via XHR
    // If opt_changeCodeMirror is specified, load it into the window
    // Get filetype
    var filenameSplit = filename.split('.');
    var extension = filenameSplit[filenameSplit.length - 1];
    // var fileType = fileTypes[extension.toLowerCase()];
    if (!(/^(js|css|html|mixed)$/.test(extension))) {
      extension = 'js';
    }
    this.loadRemotely(filename, extension.toLowerCase(), opt_changeCodeMirror);
  };

  InteractiveSample.prototype.loadCodesiteFeed = function() {
    var script = document.createElement('script');
    script.src = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=http://code.google.com/feeds/p/google-ajax-examples/svnchanges/basic&num=20&callback=is.addNewSampleMarkers';
    script.type = 'text/javascript';
    document.body.appendChild(script);
  }

  /*
   * Makes the XHR calls to grab the code
   */
  InteractiveSample.prototype.loadRemotely = function(filename, fileType, opt_changeCodeMirror) {
    var me = this;
    if (filename.indexOf('?id=') != -1) {
      filename += '&sc=' + this.getSafetyToken();
    }
    
    // to load the HTML code we need to make sure the JS and CSS code
    // have finished downloading.
    if (me.xhrInProgress && fileType == 'html') {
      setTimeout(function() {
        me.loadRemotely(filename, fileType, opt_changeCodeMirror);
      }, 1000);
      return;
    }
    me.xhrInProgress = true;
    $.get(filename, function(data) {
      me.xhrInProgress = false;
      if (opt_changeCodeMirror) {
        me.changeCodeMirror(data, fileType);
      }
    });
  };

  InteractiveSample.prototype.nameToHashName = function(name) {
    var hashName = name.toLowerCase();
    hashName = hashName.replace(/ /g, '_');
    return hashName;
  };

  InteractiveSample.prototype.putSafetyCookieInForms = function() {
    var safetyToken = this.getSafetyToken();
    if (safetyToken) {
      $('#safetyCookie').attr('value', safetyToken);
    }
  };

  InteractiveSample.prototype.sampleFileNameToObject = function(sampleFileName) {
    for (var i=0; i < sampleList.length; i++) {
      for (var j=0; j < sampleList[i].samples.length; j++) {
        var sampleObj = sampleList[i].samples[j];
        if (sampleFileName == sampleObj.sampleName) {
          sampleObj['category'] = sampleList[i].category;
          sampleObj['categoryDocsUrl'] = sampleList[i].docsUrl || null;
          return sampleObj;
        }
      }
    }
    return null;
  };

  InteractiveSample.prototype.sampleNameToObject = function(sampleName) {
    for (var i=0; i < sampleList.length; i++) {
      for (var j=0; j < sampleList[i].samples.length; j++) {
        var sampleObj = sampleList[i].samples[j];
        if (sampleObj.sampleName == sampleName) {
          sampleObj['category'] = sampleList[i].category;
          sampleObj['categoryDocsUrl'] = sampleList[i].docsUrl || null;
          return sampleObj;
        }
      }
    }
  };

  InteractiveSample.prototype.saveCode = function() {
    var me = this;
    this.toggleEditor('mixed', function() {
      var curFilename = me.getCurFilename();
      var sampleObj = me.sampleFileNameToObject(curFilename);
      me.putSafetyCookieInForms();
      if (sampleObj.category == 'Saved Code') {
        var confirmOverwrite = confirm('Are you sure you want to overwrite this code?');
        if (confirmOverwrite) {
          // (lisbakken) HUGE HACK.  In IE, an input element can't store a newline character,
          // or at least I can't find out how.  So they all get lost during the send
          // so on the server side i will parse out &#x000a; and add in the correct
          // code :)
          var code = me.getCode();
          code = code.replace(/\n/g, '&#x000a;');
          $('#jscodeSaveForm').attr('value', code);
          $('#boilerplateLoc').attr('value', me.htmlUrl);
          $('#idSaveForm').attr('value', sampleObj.id);
          $('#saveForm').submit();
        }
      } else {
        me.uiEffects.showSaveForm();
      }
    });
  };


  InteractiveSample.prototype.sendCodeToServer = function(code) {
    code = code.replace(/\n/g, '&#x000a;');
    $('#codeHolder').attr('value', code);
    $('#linkCodeForm').get(0).submit();
  };

  InteractiveSample.prototype.setDemoTitle = function(sampleObj) {
    var sampleName = sampleObj.sampleName;
    var catSplit = sampleObj.category.split('-');
    var title = $('<div>' + (catSplit[1] ? catSplit[1] : catSplit[0]) + '&nbsp;&nbsp;&raquo;&nbsp;&nbsp;' + sampleName + '</div>');
    if (sampleObj.docsUrl || sampleObj.categoryDocsUrl) {
      this.setDocsUrl(sampleObj.docsUrl || sampleObj.categoryDocsUrl);
    } else {
      this.setDocsUrl(null);
    }

    $('#demoTitle').html(title);
    $('#saveSampleName').attr('value', 'Custom ' + sampleName);
    $('#tagsSaveForm').attr('value', sampleObj.tags);
  };
  
  // this function will attached to each sample link in
  // createCategories function so it runs for a specific sample
  // when on click action (with the fallback of the hash value)
  InteractiveSample.prototype.showSample = function(sampleName, def) {
    var me = this;
    return function() {
      var curFilename = me.getCurFilename() || null;
      var sampleObj = me.sampleNameToObject(sampleName);
      var files = sampleObj.files;
      var thisLI = sampleObj.li;
      var catSplit = sampleObj.category.split('-');
      var categoryName = catSplit[0];

      var codeLIs = me.codeLIs;
      var setAsJSEditor = true;
      me.temporaryBoilerplate = sampleObj.boilerplateLoc;
      me.htmlUrl = me.temporaryBoilerplate
      if (sampleObj.boilerplateLoc != '') {
        editorKey = sampleObj.editor || 'js';
      }
      // me.useEditor(editorKey); // generic editor setter
      me.currentEditor = window[editorKey + 'Editor'];
      me.currentEditor.clearBreakPoints();
      me.runBox.iFrameLoaded = false;
      // me.setDemoTitle(sampleObj);
      for (var i = 0, len = codeLIs.length; i < len; i++) {
        codeLIs[i].className = '';
      }

      // For linking purposes
      if (!def) {
        window.location.hash = me.nameToHashName(sampleName);
      }

      // Make code selected designate this as selected
      thisLI.className = 'selected';
      me.currentCode = {};



      // add file names at top
      // var tab_bar = $('#tab_bar');
      // tab_bar.innerHTML = '';
      for (i = 0; i < files.length; i++) {
        var file = files[i];

        // var tabClass = 'lb';
        me.loadCode(file, true);
      }

    // me.loadCode(files[0], textArea);
      me.hideAllCategoriesExcept(document.getElementById(categoryName));
      me.curI = sampleObj.sampleName;
      
      if (editorKey == 'mixed') {
        me.loadHTML(sampleName);
      }
      
      me.createLinksMenu(sampleObj);
      
      try {
        if (window.pageTracker) {
          window.pageTracker._trackPageview();
        }
      } catch(e) {}
    };
  };

  InteractiveSample.prototype.toggleShowHideLIs = function(category) {
    return function() {
      var ul = category.nextSibling;
      // if the sibling is an anchor, that means it's the docsLink anchor, so grab the one after.
      if (ul.nodeName.toLowerCase() == 'a') ul = ul.nextSibling;
      var el = category.childNodes[0];
      if (el.className == 'expand')
        el.className = 'collapse';
      else
        el.className = 'expand';

      if (ul.style.display == 'none') {
        ul.style.display = 'block';
      } else {
        ul.style.display = 'none';
      }
    };
  };

  InteractiveSample.prototype.toggleShowHideSubCategories = function(category) {
    return function() {
      // Change the collapse img to a + or a -
      var collapseImg = category.childNodes[0].childNodes[0];
      if (collapseImg.className == 'expand') {
        collapseImg.className = 'collapse';
        category.className = 'category categoryOpen';
      } else {
        collapseImg.className = 'expand';
        category.className = 'category categoryClosed';
      }
    };
  };

  InteractiveSample.prototype.useEditor = function(editorKey) {
    for (var key in this.codeEditorFrames) {
      if (key == editorKey) {
        this.codeEditorFrames[editorKey].style.display = 'inline';
      }
      else {
        this.codeEditorFrames[key].style.display = 'none';
      }
    }
    this.currentEditor = window[editorKey + 'Editor'];
  };

  // ideally this should be a method of UIEffects
  InteractiveSample.prototype.createLinksMenu = function(sampleObj) {
    var menu = document.querySelector('#linksMenuDropdown');
    menu.innerHTML = '';
    if (sampleObj.tutorial) {
      var div = document.createElement('div');
      div.textContent = 'Tutorials';
      div.setAttribute('data-reference', sampleObj.tutorial);
      menu.appendChild(div);
    }
    if (sampleObj.spec) {
      var div = document.createElement('div');
      div.textContent = 'Specification';
      div.setAttribute('data-reference', sampleObj.spec);
      menu.appendChild(div);
    }
  }

  /*
   * UIEffects sets up all of the jQuery UI stuff for draggable etc.
  */
  function UIEffects() {
    this.is = new Object();
    this.numHTMLEditors;
    this.uiEls;
    this.dropdownTimer;
    this.fullScreen = false;
  }

  UIEffects.prototype.init = function(is) {
    var me = this;
    this.is = is;
    this.numHTMLEditors = 0;

    if (this.is.ie6) {
      this.fixPNGs();
    }

    this.initAutoComplete();
    this.setMenuButtonClicks($('#codeMenuButton'), $('#codeMenuDropdown'));
    this.setMenuButtonClicks($('#colorMenuButton'), $('#colorMenuDropdown'));
    this.setMenuButtonClicks($('#linksMenuButton'), $('#linksMenuDropdown'));
    this.setMenuScrollHeight();
    this.initDraggables();
    document.querySelector('#linksMenuDropdown').addEventListener('click', function(e) {
      if (e.target.getAttribute('data-reference')) {
        window.open(e.target.getAttribute('data-reference'), "_new");
      }
    }, false);
    document.getElementById('fullMenuButton').addEventListener('click', function() {
      if (me.fullScreen) {
        document.getElementById('selectCodeContainer').style.visibility = 'visible';
        document.getElementById('codeRow').style.paddingLeft = '324px';
        me.initDraggables();
        me.fullScreen = false;
      } else {
        document.getElementById('selectCodeContainer').style.visibility = 'hidden';
        document.getElementById('codeRow').style.paddingLeft = '0';
        me.initDraggables();
        me.fullScreen = true;
      }
    }, true);
  };

/*  ********************* */
  UIEffects.prototype.initForFramed = function(is) {
        var me = this;
        this.is = is;
        this.numHTMLEditors = 0;

        if (this.is.ie6) {
            this.fixPNGs();
        }

        this.initDraggables();
    };
/*  ********************* */

  UIEffects.prototype.fixPNGs = function() {
    $.getScript('js/jquery.pngFix.pack.js', function() {
      $(document).pngFix();
    });
  }
  
  UIEffects.prototype.setMenuButtonClicks = function(button, menu) {
    var me = this;    
    button.bind('mousedown', function() {
      me.toggleDropdown(menu);
      return false;
    });

    button.bind('mouseout', function() {
      me.dropdownTimer = window.setTimeout(function() {
        window.is.uiEffects.toggleDropdown((menu), true);
      }, 100);
    });

    button.bind('mouseover', function() {
      if (me.dropdownTimer) {
        window.clearTimeout(me.dropdownTimer);
      }
    });

    menu.bind('mouseout', function() {
      me.dropdownTimer = window.setTimeout(function() {
        window.is.uiEffects.toggleDropdown((menu), true);
      }, 100);
    });

    menu.bind('mouseover', function() {
      if (me.dropdownTimer) {
        window.clearTimeout(me.dropdownTimer);
      }
    });
  };

  UIEffects.prototype.setMenuScrollHeight = function() {
    var selC = $('#selectCode');
    selC.scrollTop(0);
    var thisLI = $('li.selected');
    var sC = ($(thisLI).position().top - selC.position().top) - (selC.height() / 2);
    if (sC > 0) {
      selC.scrollTop(sC);
    }
  }

  UIEffects.prototype.closeDialog = function(div) {
    $('#grayOverlay').css('display', 'none');
    $('#' + div).css('display', 'none');
  };

  UIEffects.prototype.createAutoComplete = function() {
    $("#search").autocomplete({
      data: is.autoCompleteData,
      matchContains: true,
      width: 'auto',
      scroll: false,
      scrollHeight: '400px',
      formatResult : function(result) {
        result = result[0].split(' <sup')[0];
        return result;
      },
      formatItem : function() {
        return arguments[0][0];
      }
    });
  };

  UIEffects.prototype.setAutoCompleteClicks = function() {
    $("#search").autocomplete('result', function(a, b, sampleName) {
      var sample = sampleName.split(' <sup>')[0];
      // This fixes a CRAZY bug in CodeMirror where in IE, it breaks if you
      // have the focus in another input element
      document.getElementById('edit').focus();
      window.is.showSample(sample)();
      return sample;
    });
  };

  UIEffects.prototype.initAutoComplete = function() {
    this.initSearchBox();
    this.createAutoComplete();
    this.setAutoCompleteClicks();
  };
  
  UIEffects.prototype.initSearchBox = function() {
    var searchBox = $('#search');
    var searchPlaceholder = searchBox.attr('placeholder');

    if (searchBox.val() == '' || searchBox.val() == searchPlaceholder) {
      searchBox.val(searchPlaceholder);
      searchBox.addClass('placeholder');
    }

    searchBox
        .focus(function() {
          if (searchBox.val() == '' || searchBox.val() == searchPlaceholder) {
            searchBox.val('');
            searchBox.removeClass('placeholder');
          }
        })
        .blur(function() {
          if (searchBox.val() == '' || searchBox.val() == searchPlaceholder) {
            searchBox.val(searchPlaceholder);
            searchBox.addClass('placeholder');
          }
        });
  };


  UIEffects.prototype.resizeAndShowDialog = function(divId) {
    var windowWidth = $(document.body).width();
    var windowHeight = $(window).height() + 15;
    var newSaveDivLeft = (windowWidth/2) - 200;
    var newSaveDivTop = (windowHeight/2) - 150;
    $('#grayOverlay')
        .css('width', windowWidth + 'px')
        .css('height', windowHeight + 'px')
        .css('display', 'inline');
    $('#' + divId)
        .css('left', newSaveDivLeft + 'px')
        .css('top', newSaveDivTop + 'px')
        .css('display', 'block');
  }

  UIEffects.prototype.showSaveForm = function() {
    this.resizeAndShowDialog('saveDiv');
    $(window).resize(function() {
      if ($('#saveDiv').css('display') == 'none')
        return;
      window.is.uiEffects.resizeAndShowDialog('saveDiv');
    });
    var curSampleObj = this.is.sampleFileNameToObject(this.is.getCurFilename());
    var boilerplateLoc = curSampleObj.boilerplateLoc;
    $('#boilerplateLoc').attr('value', boilerplateLoc);
    // HUGE HACK.  In IE, an input element can't store a newline character,
    // or at least I can't find out how.  So they all get lost during the send
    // so on the server side i will parse out &#x000a; and add in the correct
    // code :)
    var code = this.is.getCode();
    code = code.replace(/\n/g, '&#x000a;');
    $('#jscodeSaveForm').attr('value', code);
  };

  UIEffects.prototype.toggleDropdown = function(el, opt_close) {
    el = $(el);

    if (opt_close) {
      el.removeClass('expanded');
      return;
    }

    if (el.hasClass('expanded')) {
      el.removeClass('expanded');
    } else {
      $('.dropdown-content').removeClass('expanded');
      el.addClass('expanded');
    }
  };

  UIEffects.prototype.enableUIButton = function(type) {
    var editorButtons = $('.editor-button');
    for (var i = 0; i < editorButtons.length; i++) {
      var button = $(editorButtons[i]);
      if (button.attr('id') == type+'-button') {
        button.addClass('button-on');
      }
      else {
        button.removeClass('button-on');
      }
    }
  };
  
  UIEffects.prototype.switchColors = function(colorset) {
    var colorSet = {
      'black': '',
      'white': '_on_white'
    }
    $('#editJS iframe').contents().find('link').attr('href', 'codemirror/css/jscolors' + colorSet[colorset] + '.css');
    $('#editCSS iframe').contents().find('link').attr('href', 'codemirror/css/csscolors' + colorSet[colorset] + '.css');
    $('#editMixed iframe').contents().find('link')[0].href = 'codemirror/css/xmlcolors' + colorSet[colorset] + '.css';
    $('#editMixed iframe').contents().find('link')[1].href = 'codemirror/css/jscolors' + colorSet[colorset] + '.css';
    $('#editMixed iframe').contents().find('link')[2].href = 'codemirror/css/csscolors' + colorSet[colorset] + '.css';
    
    $('.dropdown-content').removeClass('expanded');
    
    if (colorset == 'white') {
      $('#colorMenuButton').addClass('b-on-w');
      $('#colorMenuButton').removeClass('w-on-b');
    }
    else if (colorset == 'black') {
      $('#colorMenuButton').removeClass('b-on-w');
      $('#colorMenuButton').addClass('w-on-b');
    }
  }
  
  UIEffects.prototype.initDraggables = function() {
    var dragging;
    var dragRowId = null;
    var heightEls = null;

    $('.pane-row-sizer')
      .attr('unselectable', 'on')
      .css('MozUserSelect', 'none')
      .bind('selectstart.ui', function() { return false; })
      .mousedown(function() {
        dragging = true;
        dragRowId = $(this).prev('.pane-row').get(0).id;
        heightEls = $('.pane-row-heighter', $(this).prev('.pane-row'));
      })
      .dblclick(function() {
        dragging = false;
        heightEls.height(200);
      });
    
    $(document)
      .mouseup(function() {
        if (!dragging)
          return;
        dragging = false;
        $('#dragsafe').height('0').css('top', '0');
        if (is.currentEditor == window.jsEditor) {
          var newHeight = $(window.jsEditor.frame).css('height');
          $(window.mixedEditor.frame).height(newHeight);
        } else {
          var newHeight = $(window.mixedEditor.frame).css('height');
          $(window.jsEditor.frame).height(newHeight);
        }
      })
      .mousemove(function(e) {
        if (dragging) {
          var newTop = e.clientY;
          var newLeft = e.clientX;
          var newHeight = (e.clientY - heightEls.offset().top - 16 + $(document).scrollTop()) + 'px';
          $('#dragsafe').css('top', heightEls.offset().top + 'px').height(newHeight);
          if (dragRowId == 'codeRow') {
            $(is.currentEditor.frame).height(newHeight);
          }
          heightEls.height(newHeight);
        }
      });
  };



  function RunBox() {
    this.outputContainer;
    this.runBoxPoppedOut;
    this.popoutWindow;
    this.is;
    this.runBoxDiv;
    this.popoutRunBoxDiv;
    this.resizable;
    this.iFrameLoaded;
  }

  RunBox.prototype.init = function(is, resizable) {
    this.resizable = resizable;
    this.runBoxDiv = document.getElementById('runbox');
    this.runBoxPoppedOut = false;
    this.outputContainer = $("#outputContainer");
    this.is = is;
  };

  RunBox.prototype.insertDebuggingTools = function(code) {
    // The YUI Compressor is going to munge a function named normally, so we
    // have to make an anonymous function that gets called immediately.
    var anony = (function () {
      var debugMenuCSS = document.createElement('link');
      debugMenuCSS.rel = 'stylesheet';
      debugMenuCSS.href = 'http://www.lisbakken.com/debugStyles.css';
      debugMenuCSS.type = 'text/css';
      debugMenuCSS.media = 'screen';
      debugMenuCSS.charset = 'utf-8';
      document.getElementsByTagName('head')[0].appendChild(debugMenuCSS);
      window.doContinue = true;
      window.setContinue = function(doContinue) {
        window.doContinue = doContinue;
        var debugBar = document.getElementById('debugBar');
        var debugText = document.getElementById('debugBarText');
        if (debugBar) {

          if (doContinue) {
            debugBar.className = 'debugBarRunning';
            debugText.innerHTML = 'Complete.';
          } else {
            debugBar.className = 'debugBarPaused';
            debugText.innerHTML = 'Paused (Line:' + window.curBreakLineNum + ')';
          }
        } else {
          window.doContinue = false;
        }
      };
      function addLoadEvent(func) {
        var oldonload = window.onload;
        if (typeof window.onload != 'function') {
          window.onload = func;
        } else {
          window.onload = function() {
            oldonload();
            func();
          }
        }
      }
      window.toggleFirebug = function(options) {
        if (!window.firebug.env.minimized || (options && options.closeIt)) {
          window.firebug.env.minimized=true;
          window.firebug.el.main.environment.addStyle({ "height":"35px" });
          window.firebug.el.mainiframe.environment.addStyle({ "height":"35px" });
          window.firebug.el.button.maximize.environment.addStyle({ "display":"block" });
          window.firebug.el.button.minimize.environment.addStyle({ "display":"none" });
          window.firebug.win.refreshSize();
        } else {
          window.firebug.env.minimized=false;
          window.firebug.el.button.minimize.environment.addStyle({ "display":"block" });
          window.firebug.el.button.maximize.environment.addStyle({ "display":"none" });
          window.firebug.win.setHeight(firebug.env.height);
        }
      };
      addLoadEvent(function() {
        var debugBar = document.createElement('div');
        debugBar.id = 'debugBar';
        debugBar.className = (window.doContinue) ? "debugBarRunning" : "debugBarPaused";
        debugBar.innerHTML = '<div class="debugBarTop">\n</div>\n<div class="debugBarTile">\n<div class="debugBarContent">\n<a href="#" class="debugContinuePaused" onclick="window.setContinue(true);return false;"><img border=0 src="images/debug-btn-continue.png"></a>\n<img class="debugContinueRunning" src="images/debug-btn-continue.png">\n<a href="#" onclick="window.toggleFirebug();return false;"><img border=0 src="images/debug-btn-firebug-lite.png"></a>\n<span id="debugBarText">\n' + ((window.doContinue) ? "Complete.":"Paused (Line:" + window.curBreakLineNum + ")") + '</span>\n</div>\n</div>\n<div class="debugBarBottom">\n</div>\n';
        window.document.body.appendChild(debugBar);
        if (window.firebug.el && window.firebug.el.main && window.firebug.el.main.environment) {
          window.toggleFirebug();
        }
      });
    });
    var firebugScriptString = '<script type="text/javascript" src="http://savedbythegoog.appspot.com/firebug.js"></script>\n<script type="text/javascript">firebug.env.height = 220;\nfirebug.env.liteFilename = \'firebug.js\';\n';
    if (code.indexOf('<head>') == -1) alert('Sample must have <head> element');
    code = code.replace('<head>', '<head>\n' + firebugScriptString + '(' + anony.toString() + ')();</script>');
    return code;
  }

  RunBox.prototype.insertBreakPoints = function(code, breakPoints) {
    var breakPointsArray = [];
    for(i in breakPoints) {
      if (breakPoints[i] == true) {
        breakPointsArray.push(i);
      }
    }
    
    // If we are breaking inside of a function, make sure to only grab the
    // rest of the function for code.
    function findCodeSelection(code, startIndex) {
      var endBracketLoc = code.indexOf('}', startIndex);
      if (endBracketLoc != -1) {
        endBracketLoc += 1;
        var subCode = code.substring(0, endBracketLoc + 1);
        var doneCount = (subCode.split('}').length - 1) - (subCode.split('{').length - 1);
        if (doneCount == 1) {
          var end = endBracketLoc - 1;
          code = code.substring(0, end)
          return code;
        }
        return findCodeSelection(code, endBracketLoc);
      } else {
        return code; 
      }
    }
    
    function addBreakPointCode(codeToGoIn, lineNum) {
      var bpCode = '\nwindow.curBreakLineNum = ' + lineNum + ';\n';
      bpCode += 'window.setContinue(false);\n';
      bpCode += 'function breakpointAtLine'+lineNum+'() {\n';
      bpCode += 'if (!doContinue) {\n';
      bpCode += 'if (window.scheduledConsoleLogs && window.scheduledConsoleLogs.length > 0) {\n';
      bpCode += 'for (var i =0; i < window.scheduledConsoleLogs.length; i++) {\n';
      bpCode += 'console.log(eval(window.scheduledConsoleLogs[i]));\n';
      bpCode += '}\n';
      bpCode += '}\n';
      bpCode += 'window.scheduledConsoleLogs = [];\n';
      bpCode += 'window.setTimeout(breakpointAtLine'+lineNum+', 100);\n';
      bpCode += '} else {\n';
      bpCode += codeToGoIn + '\n';
      bpCode += '}\n';
      bpCode += '}\n';
      bpCode += 'breakpointAtLine'+lineNum+'();\n';
      return bpCode;
    }
    
    for (var i = breakPointsArray.length - 1; i >= 0; i--){
      // for each one of these, we need to go to that line in the string and insert extra code.
      var breakPointLine = breakPointsArray[i];
      var atLine = 0;
      var indexOfNewline = 0;
      while (atLine + 1 != breakPointLine) {
        indexOfNewline = code.indexOf('\n', indexOfNewline + 1);
        if (indexOfNewline == -1) {
          window.console.log('AddBreakPointCode failed.');
          break;
        } else {
          atLine++;
        }
      }
      var firstPartOfCode = code.substring(0, indexOfNewline);
      var secondPartOfCode = code.substring(indexOfNewline);
      var replaceableCode = findCodeSelection(secondPartOfCode, 0);
      secondPartOfCode = secondPartOfCode.replace(replaceableCode, '');
      replaceableCode = addBreakPointCode(replaceableCode, breakPointLine);
      firstPartOfCode = firstPartOfCode.concat(replaceableCode);
      firstPartOfCode = firstPartOfCode.concat(secondPartOfCode);
      code = firstPartOfCode;
    }

    return code;
  }

  RunBox.prototype.hideOnScreenRun = function() {
    // body...
  };

  RunBox.prototype.createIframe = function(htmlUrl) {
    // (lisbaken) Because safari is CRAZY.  There is a bug in safari.  Without this statement
    // if you refresh the browser and look at a sample, it won't work.  Upon refresh
    // safari will use the EXACT SAME URL for the iFrame as before the refresh,
    // ignoring that i'm passing in a NEW URL for htmlUrl.
    // If you load the iFrame first, THEN set the src, Safari likes it.
    // Lame.
    var height = $('#runFrame').height() || this.is.heightOfRunFrame || 450;
    if ($.browser.safari) {
      var iFrame = $('<iframe id="runFrame" name="runFrame" class="pane-row-heighter" style="height: ' + height + 'px;" onload="is.runBox.iFrameLoaded = true;"><\/iframe>');
      $(this.runBoxDiv).empty().append(iFrame);
      iFrame = iFrame.get(0);
      iFrame.src = htmlUrl;
      // iFrame.innerHTML = unescape(iFrame.documentBody);
    } else {
      var iFrame = $('<iframe src="'+htmlUrl+'" class="pane-row-heighter" style="height: ' + height + 'px;" onload="is.runBox.iFrameLoaded = true;" id="runFrame" name="runFrame"><\/iframe>');
      // iFrame.innerHTML = unescape(iFrame.innerHTML);
      $(this.runBoxDiv).empty().append(iFrame);
    }
  };

  RunBox.prototype.createIframeForRuncode = function(options){
    var me = this;
    return function(code) {
      if (options && options.debugMode) {
        code = me.insertDebuggingTools(code);
      }

      var url = 'about:blank';
      if (!is.runBox.runBoxPoppedOut) {
        window.is.runBox.createIframe(url);
        
        var frm = $('iframe', me.runBoxDiv).get(0);
        var doc = frm.contentWindow.document;
        doc.open();
        doc.write(code);
        doc.close();
      } else {
        // Run code in the popout window
        var runbox = window.is.runBox.popoutWindow.document.getElementById('runbox');
        runbox.innerHTML = '';
        window.is.runBox.popoutWindow.addIframe(url);
        var doc = runbox.getElementsByTagName('iframe')[0].contentWindow.document;
        doc.open();
        doc.write(code);
        doc.close();
      }
    };
  };

  RunBox.prototype.runCode = function(options) {
    var code = this.is.getCode();
    if (this.is.currentEditor == window.mixedEditor) {
      this.createIframeForRuncode(options)(code);
    } else {
      if (options && options.debugMode) {
        var breakPoints = this.is.currentEditor.getBreakPoints();
        breakPoints = (breakPoints.length == 0) ? null : breakPoints;
        code = this.insertBreakPoints(code, breakPoints);
      }
      this.is.getCodeAndRun(this.createIframeForRuncode(options), code);
    }
  };

  RunBox.prototype.changeToPopout = function() {
    this.runBoxPoppedOut = true;
    $(this.outputContainer).hide();
    this.popoutWindow = window.open('popout.html','popout', 'left=20,top=20,width=600,height=500,toolbar=1,resizable=1');
  };

  RunBox.prototype.changeToInline = function() {
    this.runBoxPoppedOut = false;
    $(this.outputContainer).show();
    this.runCode();
  };

  // Create and export the interactive sample instance to the global.
  window.is = new InteractiveSample();
})();

function encodeSpecialChars(b) {
  var c = '';
  for (var i = 0; i < b.length; i++) {
    if (b.charCodeAt(i) > 127) {
      c += '&#' + b.charCodeAt(i) + ';';
    } else {
      c += b.charAt(i);
    }
  }
  return c;
}

function decodeSpecialChars(b) {
  var c = b.replace(/&#(\d+);/g,
                    function(c, d) { return String.fromCharCode(d); }
                   );
  return c;
}

function setBgColorWhite() {
  this.style.backgroundColor = 'white';
}

function setBgColorBlue() {
  this.style.backgroundColor = '#E5ECF9';
}
