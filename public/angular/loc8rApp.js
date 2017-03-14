angular.module('loc8rApp', []);

var geolocation = function () {
	var getPosition = function (cbSuccess, cbError, cbNoGeo) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
		}
		else {
			cbNoGeo();
		}
	};
	return {
		getPosition : getPosition
	};
};

var loc8rData = function($http){
	
	var locationByCoords = function (lat, lng) {
	return $http.get('/api/locations?lng=' + lng + '&lat=' + lat +'&maxDistance=20');
	};
		return {
		locationByCoords : locationByCoords
	};	
}

//http devuelve una promise así que usamos success y error para gestionar la llamadas
var locationListCtrl = function ($scope, loc8rData, geolocation) {


	$scope.message = "Checking your location";
	
	$scope.getData = function (position) {
		$scope.message = "Searching for nearby places";
		var lat = position.coords.latitude,	lng = position.coords.longitude;
		console.log("lat: "+lat+ " lng: "+lng);
		loc8rData.locationByCoords(lat, lng).then(function(response) {
			$scope.message = response.data.length > 0 ? "" : "No locations found";
			$scope.data = { locations: response.data };
			console.log("Success!", response);
		}, 
		function(error) {
			$scope.message = "Sorry, something's gone wrong ";
			console.error("Failed!", error);
		})
	};

	$scope.showError = function (error) {
		$scope.$apply(function() {
			$scope.message = error.message;
		});
	};

	$scope.noGeo = function () {
		$scope.$apply(function() {
			$scope.message = "Geolocation not supported by this browser.";
		});
	};

	geolocation.getPosition($scope.getData,$scope.showError,$scope.noGeo);
		
};

var _isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

var formatDistance = function () {
  return function (distance) {
    var numDistance, unit;
    if (distance && _isNumeric(distance)) {
      if (distance > 1) {
        numDistance = parseFloat(distance).toFixed(1);
        unit = 'km';
      } else {
        numDistance = parseInt(distance * 1000,10);
        unit = 'm';
      }
      return numDistance + unit;
    } else {
      return "?";
    }
  };
};

var ratingStars = function () {
	return {
		scope: {
			thisRating : '=rating'
		},
		templateUrl: '/angular/rating-stars.html'
	};
};

angular.module('loc8rApp')
.controller('locationListCtrl', locationListCtrl)
.filter('formatDistance',formatDistance)
.directive('ratingStars', ratingStars)
.service('loc8rData', loc8rData)
.service('geolocation', geolocation);