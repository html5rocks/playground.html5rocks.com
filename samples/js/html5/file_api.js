// Content section used alot
var content = document.getElementById('content');

if (!window.FileReader) {
  content.innerHTML = "<p>This browser doesnt support the File API</p>";
} else {
  // Page Layout
  content.innerHTML =
    '<p>Pick a text file or drag one into this area <br> <input type="file" id="file" /></p>' +
    '<p><b>Name:</b> <span id="name"></span><br>' +
    '<b>File Size:</b> <span id="size"></span><br>' +
    '<b>Content:</b> <br><br> <pre id="file-content"></pre>' +
    '</p>';

  // Prints out file properties.
  function displayFile(file) {
    document.getElementById('name').textContent = file.fileName;
    document.getElementById('size').textContent = file.fileSize;
    document.getElementById('file-content').style.border = "1px solid black";

    var reader = new FileReader();

    reader.onload = function(event) {
      document.getElementById('file-content').textContent = 
        event.target.result;
    };

    reader.onerror = function() {
      document.getElementById('file-content').innerHTML = 'Unable to read ' + file.fileName;
    };

    reader.readAsText(file);
  }

  // Input handler
  document.getElementById('file').onchange = function() {
    displayFile(this.files[0]);
  };

  // Add invisible border to drop area
  content.style.border = '4px solid transparent';

  // Add dragging events
  content.ondragenter = function() {
    content.style.border = '4px solid #b1ecb3';
    return false;
  };

  content.ondragover = function() {
    return false;
  };

  content.ondragleave = function() {
    return false;
  };

  content.ondrop = function(event) {
    content.style.border = '4px solid transparent';
    displayFile(event.dataTransfer.files[0]);
    return false;
  };
}