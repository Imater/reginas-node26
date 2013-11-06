myApp.controller('statDayCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {


    $scope.jsGetClientsDay = function(){
		myApi.getClientsDay($scope).then(function(day_clients){
	        $scope.fpk.clientsgroupby = "";
	        $scope.fpk.clientsgroupby_one = "";
			$scope.day_clients = day_clients;
		});    	
    }

    $scope.jsGetClientsDay();

    $scope.$watch("fpk.today_date", function(){
    	$scope.jsGetClientsDay();	
    });

    $scope.$watch("fpk.manager_filter", function(){
      $scope.jsGetClientsDay(); 
    });

    $scope.$watch("fpk.brand", function(){
    	$scope.jsGetClientsDay();	
    });



});