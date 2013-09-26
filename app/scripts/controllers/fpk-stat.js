//#fpk/stat

myApp.controller('statCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {

 	$scope.$parent.leftmenu = { active:1,
                items : [
                  {id:10, title:"Холдинг", href: "#/fpk/clients/stat/cup"},
                  {id:11, title:"Ежедневный", href: "#/fpk/clients/stat/day"},
                  {id:12, title:"Детальный", href: "#/fpk/clients/stat/detail"},
                  {id:13, title:"По месяцам", href: "#/fpk/clients/stat/year"},
                ]

                };
	
	$scope.stat_view_switch = 1;


	$scope.getCUPtable = function() {
	 myApi.getCUP($scope).then(function(cup){
	    $scope.cup = cup.brands;
	 });
	};
	$scope.getCUPtable();	

	 $scope.loadCupCar = function(brand_id, do_type) {
	    myApi.getCUPcars($scope, brand_id, do_type).then(function(cars){
	      $scope.cup_clients = cars;
	    });
	 }

	$scope.$watch('today_date', function(newVal) {
		$scope.getCUPtable();	
  	});


  
});