window.onload = function() {
  var startPos;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      startPos = position;
      document.getElementById("startLat").innerHTML = startPos.coords.latitude;
      document.getElementById("startLon").innerHTML = startPos.coords.longitude;
    }, function(error) {
      alert("Error occurred. Error code: " + error.code);
      // error.code can be:
      //   0: unknown error
      //   1: permission denied
      //   2: position unavailable (error response from locaton provider)
      //   3: timed out
    });

    navigator.geolocation.watchPosition(function(position) {
      document.getElementById("currentLat").innerHTML = position.coords.latitude;
      document.getElementById("currentLon").innerHTML = position.coords.longitude;
      document.getElementById("distance").innerHTML =
        calculateDistance(startPos.coords.latitude, startPos.coords.longitude,
                          position.coords.latitude, position.coords.longitude);
    });
  }
};

// Reused code - copyright Moveable Type Scripts - retrieved May 4, 2010.
// http://www.movable-type.co.uk/scripts/latlong.html
// Under Creative Commons License http://creativecommons.org/licenses/by/3.0/
function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = (lat2-lat1).toRad();
  var dLon = (lon2-lon1).toRad();
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
}
Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}
