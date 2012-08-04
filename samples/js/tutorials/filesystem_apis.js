window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
var fs = null;

function errorHandler(e) {
  var msg = '';
  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };
  document.querySelector('#example-list-fs-ul').innerHTML = 'Error: ' + msg;
}

function initFS() {
  window.requestFileSystem(window.TEMPORARY, 1024*1024, function(filesystem) {
    fs = filesystem;
  }, errorHandler);
}

var buttons = document.querySelectorAll('#example-list-fs button');
var filelist = document.querySelector('#example-list-fs-ul');

if (buttons.length >= 3) {
  buttons[0].addEventListener('click', function(e) {
    if (!fs) {
      return;
    }
    fs.root.getFile('log.txt', {create: true}, null, errorHandler);
    fs.root.getFile('song.mp3', {create: true}, null, errorHandler);
    fs.root.getDirectory('mypictures', {create: true}, null, errorHandler);
    filelist.innerHTML = 'Files created.';
  }, false);

  buttons[1].addEventListener('click', function(e) {
    if (!fs) {
      return;
    }

    var dirReader = fs.root.createReader();
    dirReader.readEntries(function(entries) {
      if (!entries.length) {
        filelist.innerHTML = 'Filesystem is empty.';
      } else {
        filelist.innerHTML = '';
      }

      var fragment = document.createDocumentFragment();
      for (var i = 0, entry; entry = entries[i]; ++i) {
        var img = entry.isDirectory ? '<img src="http://www.html5rocks.com/static/images/tutorials/icon-folder.gif">' :
                                      '<img src="http://www.html5rocks.com/static/images/tutorials/icon-file.gif">';
        var li = document.createElement('li');
        li.innerHTML = [img, '<span>', entry.name, '</span>'].join('');
        fragment.appendChild(li);
      }
      filelist.appendChild(fragment);
    }, errorHandler);
  }, false);

  buttons[2].addEventListener('click', function(e) {
    if (!fs) {
      return;
    }

    var dirReader = fs.root.createReader();
    dirReader.readEntries(function(entries) {
      for (var i = 0, entry; entry = entries[i]; ++i) {
        if (entry.isDirectory) {
          entry.removeRecursively(function() {}, errorHandler);
        } else {
          entry.remove(function() {}, errorHandler);
        }
      }
      filelist.innerHTML = 'Directory emptied.';
    }, errorHandler);
  }, false);
}

// Initiate filesystem on page load.
if (window.requestFileSystem) {
  initFS();
}
