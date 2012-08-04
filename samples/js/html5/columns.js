/*
 * Insert text content via javascript
 */
var content = document.getElementById('content');
var loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
content.innerText = loremIpsum;

/*
 * Insert slide bar
 */
var contentStyle = content.style;
var slideBar = document.createElement('p');
slideBar.innerHTML = "<input type='range' min='1' max='6' value='2' />";
document.body.appendChild(slideBar);
slideBar.addEventListener('change', function(event) {
  contentStyle.webkitColumnCount = event.target.value;
}, false);

/*
  You can also style everything from JavaScript instead of from CSS
  In this case you would use the following syntax:

  var contentStyle = content.style;
  contentStyle.webkitColumnCount = "2";
  contentStyle.webkitColumnRule = "1px solid #bbb";
  contentStyle.webkitColumnGap = "2em";
  contentStyle.display = "block";
*/
