/**
 * Adding geocomplete - suggestions, on the input
 * boxes, when document is ready
 */
$(document).ready(function() {
  $('#start').geocomplete();
  $('#end').geocomplete();
});
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

/**
 * Initializes the map
 */
function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var tokyo = new google.maps.LatLng(35.6895, 139.6917);
  var mapOptions = {
    zoom: 9,
    center: tokyo,
    scrollwheel: false
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  directionsDisplay.setMap(map);
}
/**
 * Renders the route, and generates
 * the fare, distance and duration of
 * travel
 */
function calcRoute() {
  var start = document.getElementById('start').value;
  var end = document.getElementById('end').value;
  var request = {
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      var routeDistance = response.routes[0].legs[0].distance.value/1000; // + " meters";
      var routeDuration = response.routes[0].legs[0].duration.value/3600; // + " seconds"

      addedDistance = routeDistance - 2;
      waiting = $('#waiting').val();

      routeFare  = 40;

      if (addedDistance > 0 ){
        routeFare = routeFare+ (addedDistance*12) + (waiting*2);
      }
      




      $('.info').removeClass('hidden');
      $('.fare').val(routeFare.toFixed(2));
      // estimate(routeDistance);
      $('.distance').text((routeDistance).toFixed(2)); //converted to meters, upto 2 decimal places
      $('.duration').text((routeDuration).toFixed(2)); //converted to hours, upto 2 decimal places
    }
  });
  initialize();
}
/**
 * Gets the current location of the 
 * user, via sensors, using HTML5
 * geolocation api
 */
function getGeolocation(){
  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
      // console.log('lat : '+position.coords.latitude + ' ; lng : '+position.coords.longitude);
      setGeoLocation(position.coords.latitude,position.coords.longitude);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
}
/**
 * Function to handle errors, while 
 * getting geolocation using HTML5 api
 */
function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }
}
/**
 * Sets the users current geocode on the input box, using the 
 * current latitute and longitute.
 * @param {float} lat latitute of the users current location
 * @param {float} lng longitute of the users current location
 */
function setGeoLocation(lat, lng) {
  // alert('address for ' + lat + ' : ' +lng);
  lat = parseFloat(lat);
  lng = parseFloat(lng);
  var latlng = new google.maps.LatLng(lat, lng);
  geocoder = new google.maps.Geocoder();
  geocoder.geocode({'latLng': latlng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        // console.log(results[1].formatted_address);
        $('#start').val(results[1].formatted_address);
        if($('#end').val() !== ''){
          calcRoute();
        }
      } else {
        // return'No results found';
      }
    } else {
      // return'Geocoder failed due to: ' + status;
    }
  });
}
//using api for estimation
function GetQueryString() {
    if (1 < document.location.search.length) {
        // 最初の1文字 (?記号) を除いた文字列を取得する
        var query = document.location.search.substring(1);

        // クエリの区切り記号 (&) で文字列を配列に分割する
        var parameters = query.split('&');

        var result = new Object();
        for (var i = 0; i < parameters.length; i++) {
            // パラメータ名とパラメータ値に分割する
            var element = parameters[i].split('=');

            var paramName = decodeURIComponent(element[0]);
            var paramValue = decodeURIComponent(element[1]);

            // パラメータ名をキーとして連想配列に追加する
            result[paramName] = decodeURIComponent(paramValue);
        }
        return result;
    }
    return null;
}
function query_geo() {
  var _Id = GetQueryString()['id'];

  var requestData = {};
  requestData.id = _Id;

  gapi.client.taximeter.customers.query.geo(requestData).execute(function(resp) {
    destination = resp.geo_location;
  });
}
function initEstimation() {
  alert('called')
  gapi.client.load('taximeter', 'v1', function() {query_geo();}, 'https://taximeter-estimation.appspot.com/_ah/api');
}
function estimate(distance) {
  var _Distance = distance;
  var requestData = {};
  requestData.distance = _Distance;
  gapi.client.taximeter.estimate(requestData).execute(function(resp) {
    $('.fare').val(resp.day_fee);
  });
}
google.maps.event.addDomListener(window, 'load', initialize);
getGeolocation();