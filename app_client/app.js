//enclosuer o IIFE (inmediately invoqued function expression)
(function () {
	//añadimos angular routing a nuestra app
	angular.module('loc8rApp', ['ngRoute']);

	//definimos el controlador
	function config ($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: 'home/home.view.html',
			controller: 'homeCtrl',		
			controllerAs: 'vm'
		}).otherwise({redirectTo: '/'});
	}

	//seteamos el controlador al routing de nuestra app
	angular.module('loc8rApp').config(['$routeProvider', config]);
})();