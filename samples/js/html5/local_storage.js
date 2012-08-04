// Generate the little markup from javascript
document.querySelector('#content').innerHTML = 
    '<p><em>Save text locally (it will still be available after restarting your browser)</em></p>';
var area = document.createElement('textarea');
area.style.width = '300px'; 
area.style.height = '150px';
document.querySelector('#content').appendChild(area);

// place content from previous edit
if (!area.value) {
  area.value = window.localStorage.getItem('value');
}
 
// your content will be saved locally
area.addEventListener('keyup', function () {
  window.localStorage.setItem('value', area.value);
  window.localStorage.setItem('timestamp', (new Date()).getTime());
}, false);

updateLog();
setInterval(updateLog, 5000); // show time every 5 seconds

function updateLog() {
  var delta = 0;
  if (window.localStorage.getItem('value')) {
    delta = ((new Date()).getTime() - (new Date()).setTime(window.localStorage.getItem('timestamp'))) / 1000;
    document.querySelector("#log").innerHTML = 'last saved: ' + delta + 's ago';
  } 
  else {
    area.value = 'Type your text here...';
  }
}
