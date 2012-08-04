var url = 'http://www.html5rocks.com';

document.getElementById('request_permission').addEventListener('click', function() {
  window.webkitNotifications.requestPermission();
}, false);
 
document.getElementById('show_html_notification').addEventListener('click', function() {
  if (window.webkitNotifications.checkPermission() == 0) {
    // you can pass any url as a parameter
    // note the show()
    window.webkitNotifications.createHTMLNotification(url).show(); 
  } else {
    alert("This page still doesn't have permissions to show notifications")
  }
}, false);