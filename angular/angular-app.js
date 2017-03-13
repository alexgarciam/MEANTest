angular.module('myApp', []);

var mycontroller=function($scope){
 $scope.myinput = "John";
};

angular.module('myApp', []).controller('myCtrl', mycontroller);

