myApp.controller('comCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment, $timeout, $http) {

	var client_id = $routeParams.client;
	var do_id = $routeParams.do;

     $http({url:'/api/v1/com_doc', method: "GET", isArray: true, params: { client_id: client_id, do_id: do_id, brand: $scope.fpk.brand }}).then(function(result){
            $scope.client = result.data;
     });



});


myApp.controller('dogCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment, $timeout, $http) {

	var client_id = $routeParams.client;
	var do_id = $routeParams.do;

     $http({url:'/api/v1/dog_doc', method: "GET", isArray: true, params: { client_id: client_id, do_id: do_id, brand: $scope.fpk.brand }}).then(function(result){
            $scope.client = result.data;
            console.info("INFO = ",result.data);
     });



});