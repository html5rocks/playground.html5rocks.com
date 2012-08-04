// Content section used alot
var content = document.getElementById('content');

if (!window.FileReader) {
  content.innerHTML = "<p>This browser doesnt support the File API</p>";
} else {
  // Page Layout
  content.innerHTML =
    '<p>Pick a text file or drag one into this area <br> <input type="file" id="file" /></p>' +
    '<b>Content:</b> <br><br> <pre id="file-content"></pre>' +
    '</p>';

  // Input handler
  document.getElementById('file').onchange = function() {
    readFileAsText(this.files[0]);
  };

  // Drag and drop methods
  content.ondragover = function(e) {
    e.preventDefault();
    return false;
  };
  content.ondrop = function(event) {
    e.stopPropagation();
    readFileAsText(event.dataTransfer.files[0]);
    return false;
  };
    
  function readFileAsText(file) {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event) {
      document.getElementById('file-content').textContent = 
        event.target.result;
    };
    reader.onerror = function() {
      document.getElementById('file-content').innerHTML = 'Unable to read ' + file.fileName;
    };
  }
}