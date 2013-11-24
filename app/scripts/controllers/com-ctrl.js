myApp.controller('comCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment, $timeout, $http) {

	var client_id = $routeParams.client;
	var do_id = $routeParams.do;
	$scope.client = {};
	$scope.client.dover = "Hi!"+client_id;

     $http({url:'/api/v1/com_doc', method: "GET", isArray: true, params: { client_id: client_id, do_id: do_id, brand: $scope.fpk.brand }}).then(function(result){
            $scope.client = result.data;
            window.print();
     });



});