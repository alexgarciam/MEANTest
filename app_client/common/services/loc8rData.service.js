//enclosuer o IIFE (inmediately invoqued function expression)
(function () {
angular.module('loc8rApp').service('loc8rData', loc8rData);

loc8rData.$inject = ['$http'];
function loc8rData ($http) {
	var locationByCoords = function (lat, lng) {
		console.log('buscando en ?lng=' + lng + '&lat=' + lat + '&maxDistance=20')
		return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=20');		
	};
	return {
		locationByCoords : locationByCoords
	};
}
})();