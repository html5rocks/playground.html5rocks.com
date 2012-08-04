document.getElementById('request_permission').addEventListener('click', function() {
  window.webkitNotifications.requestPermission();
}, false);

document.getElementById('show_notification').addEventListener('click', function() {
  showNotification();
}, false);

document.getElementById('show_delayed_notification').addEventListener('click', function() {
  setTimeout(function() { showNotification(); }, 5000);
}, false);

function showNotification() {
  var text = 'You got a new email from someone@test.com'
  if (window.webkitNotifications.checkPermission() == 0) {
    // note the show()
    window.webkitNotifications.createNotification('', 'Plain Text Notification', text).show(); 
  } else {
    alert('You have to click on "Set notification permissions for this page" first to be able to receive notifications.');
  }  
}
