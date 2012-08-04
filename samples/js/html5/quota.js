(function() {
  var outputs = document.querySelectorAll('output');
  document.querySelector('#temp-query').addEventListener(
    'click', function() {
      webkitStorageInfo.queryUsageAndQuota(
          webkitStorageInfo.TEMPORARY,
          function(used, remaining) {
            outputs[0].textContent = used;
            outputs[1].textContent = remaining;
          }, function(error) { alert(error) });

    }, false);
    
  document.querySelector('#perm-request').addEventListener(
    'click', function() {
      webkitStorageInfo.requestQuota(
          webkitStorageInfo.PERSISTENT,
          document.querySelector('#requested-quota').value,
          function(used) {
            outputs[2].textContent = used;
          }, function(error) { alert(error) });

    }, false);
}())