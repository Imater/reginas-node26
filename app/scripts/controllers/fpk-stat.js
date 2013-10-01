//#fpk/stat

myApp.controller('statCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {

 	$scope.$parent.leftmenu = { active:1,
                items : [
                  {id:0, title:"Холдинг", href: "/fpk/statistic", segment: "s1.statistic"},
                  {id:1, title:"Подробная таблица", href: "/fpk/stat_table", segment: "s1.stat_table"}
                ]

                };
	$scope.leftmenu.active = -1;

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