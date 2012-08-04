(function() {
  var dragZone = document.querySelector('#drag-zone');
  var dropZone = document.querySelector('#drop-zone');
  dragZone.addEventListener('dragstart', function(event) {
    if (event.target.className) { // img case
      event.dataTransfer.effectAllowed = event.target.className;
      event.target.style.border = "4px solid #cc3300";
    } else { // text case
      if (event.target.parentNode.className == 'overwrite') {
        event.dataTransfer.setData("text", "<strong>Overwritten Content</strong>");
      }
      event.target.parentNode.style.border = "4px solid #cc3300";
    }
    return true;
  }, true);

  dragZone.addEventListener('dragend', function(event) {
    if (event.target.className) { // img case
      event.target.style.border = "4px solid #888";
    } else { // text case
      event.target.parentNode.style.border = "4px solid #888";
    }
    return true;
  }, true);

  dropZone.addEventListener('dragenter', function(event) {
    if (event.preventDefault) event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    this.className = 'hovering';
    return false;
  }, false);

  dropZone.addEventListener('dragover', function(event) {
    if (event.preventDefault) event.preventDefault(); // allows us to drop
    event.dataTransfer.dropEffect = 'copy';
    return false;
  }, false);

  dropZone.addEventListener('dragleave', function(event) {
    if (event.preventDefault) event.preventDefault(); // allows us to drop
    this.className = '';
    return false;
  }, false);

  dropZone.addEventListener('drop', function(event) {
    if (event.preventDefault) event.preventDefault();
    var imgPassed = null;
    var dropdata = document.querySelector('#drop-data');
    var types = event.dataTransfer.types;
    document.querySelector('#drop-data').textContent = '';
    this.innerHTML = '';
    for (var i = 0; i < types.length; i++) {
      if (types[i] == 'Files') {
        var files = event.dataTransfer.files;
        for (var j = 0; j < files.length; j++) {
          dropdata.textContent += 'File Name: '+files[j].fileName;
          dropdata.textContent += 'File Size: '+files[j].fileSize;
        }
      } else {
        if (typeof event.dataTransfer.getData(types[i]) !== 'undefined') {
          dropdata.innerHTML += '<p><em class="datatypes">'+types[i]+'</em>: <br />'+event.dataTransfer.getData(types[i]).replace(/</g, '&lt;') + '</p>';
        }
      }

      if (types[i] == 'text/uri-list') {
        imgPassed = event.dataTransfer.getData('text/uri-list');
      }
    }

    if (imgPassed) {
      var cEl = document.createElement('canvas');
      cEl.width = 200;
      cEl.height = 100;
      var ctx = cEl.getContext('2d');
      var img_buffer = document.createElement('img');
      img_buffer.src = imgPassed;
      img_buffer.style.display = 'none';
      document.body.appendChild(img_buffer); // this line only needed in safari
      img_buffer.onload = function() { ctx.drawImage(img_buffer,0,0,100,100); }
      this.appendChild(cEl);
    } else {
      if (event.dataTransfer.getData('text')) {
        this.innerHTML = event.dataTransfer.getData('text');
      } else if (event.dataTransfer.getData('text/plain')) {
        this.innerHTML = event.dataTransfer.getData('text/plain');
      }
    }
    return false;
  }, false);
})();
