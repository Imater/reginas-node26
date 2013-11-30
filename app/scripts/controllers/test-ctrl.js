myApp.controller('testCtrl', function($scope, $resource, $rootScope, $location, socket, $routeParams, myApi, $routeSegment, $timeout, $http) {

	var client_id = $routeParams.client;
	var do_id = $routeParams.do;

	$http({
		url: '/api/v1/test_doc',
		method: "GET",
		isArray: true,
		params: {
			client_id: client_id,
			do_id: do_id,
			brand: $scope.fpk.brand
		}
	}).then(function(result) {
		$scope.dover = result.data.dover;
		window.print();
	});


});