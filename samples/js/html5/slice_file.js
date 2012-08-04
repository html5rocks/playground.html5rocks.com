// Content section used alot
var content = document.getElementById('content');

if (!window.FileReader) {
  content.innerHTML = "<p>This browser doesnt support the File API</p>";
} else {
  // Page Layout
  content.innerHTML =
    '<p>Pick a text file or drag one into this area <br> <input type="file" id="file" /></p>' +
    '<b>First 30 bytes of file content:</b> <br><br> <pre id="byte-content"></pre>' +
    '</p>';

  // Input handler
  document.getElementById('file').onchange = function() {
    showFirstBytes(this.files[0]);
  };

  // Drag and drop methods
  content.ondragover = function(e) {
    e.preventDefault();
    return false;
  };
  content.ondrop = function(event) {
    e.stopPropagation();
    showFirstBytes(event.dataTransfer.files[0]);
    return false;
  };

        
  function showFirstBytes(file) {
    var reader = new FileReader();
    // split first 10 bytes of the file
    if (file.webkitSlice) {
      var blob = file.webkitSlice(0, 30);
    } else if (file.mozSlice) {
      var blob = file.mozSlice(0, 30);
    }
    
    reader.readAsBinaryString(blob);
    
    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        document.getElementById('byte-content').textContent = evt.target.result;
      }
    };
      
    reader.onerror = function() {
      document.getElementById('file-content').innerHTML = 'Unable to read ' + file.fileName;
    };
  }
}