var initialLocation;
var siberia = new google.maps.LatLng(60, 105);
var newyork = new google.maps.LatLng(40.69847032728747, -73.9514422416687);
var map;
var infowindow = new google.maps.InfoWindow();
var mapOptions = {
  zoom: 13,
  mapTypeId: google.maps.MapTypeId.ROADMAP
};

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(showPosition, onError);
  // also monitor position as it changes
  navigator.geolocation.watchPosition(showPosition);
} else {
  onError();
}

function showPosition(position) {
  map = new google.maps.Map(document.getElementById("content"), mapOptions);
  
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  
  initialLocation = new google.maps.LatLng(lat, lng);
  map.setCenter(initialLocation);
  infowindow.setContent(lat + " " + lng);
  infowindow.setPosition(initialLocation);
  infowindow.open(map);
}

function onError() {
  if (navigator.geolocation) {
    initialLocation = newyork;
    contentString = "Error: The Geolocation service failed.";
  } else {
    initialLocation = siberia;
    contentString = "Error: Your browser doesn't support geolocation. Are you in Siberia?";
  }
  mapOptions.zoom = 4;
  map = new google.maps.Map(document.getElementById("content"), mapOptions);
  map.setCenter(initialLocation);
  infowindow.setContent(contentString);
  infowindow.setPosition(initialLocation);
  infowindow.open(map);
}