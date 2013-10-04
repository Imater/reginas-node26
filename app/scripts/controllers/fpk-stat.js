//#fpk/stat

myApp.controller('statCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {

 	$scope.fpk.leftmenu = { active:1,
                items : [
                  {id:0, title:"Холдинг", href: "/fpk/statistic", segment: "s1.statistic"},
                  {id:1, title:"Подробная таблица", href: "/fpk/stat_table", segment: "s1.stat_table"}
                ]

                };
	$scope.fpk.leftmenu.active = -1;

	$scope.stat_view_switch = 1;


	$scope.getCUPtable = function() {
	 myApi.getCUP($scope).then(function(cup){
	    $scope.cup = cup.brands;
	 });
	};
	$scope.getCUPtable();	

	 $scope.loadCupCar = function(brand_id, do_type, my_this) {
	 	if($scope.cup_selected == my_this) {
			var today = $scope.fpk.today_date.substr(0,7);
			$scope.cup_selected = "";
	 	} else {
	 		var today = $scope.fpk.today_date;
		 	$scope.cup_selected = my_this;
	 	}
	    myApi.getCUPcars($scope, brand_id, do_type, today).then(function(cars){
	      $scope.cup_clients = cars;
	    });
	 }

	$scope.$watch('fpk.today_date', function(newVal) {
		$scope.getCUPtable();	
  	});

	$rootScope.$on("loadstat", function(){
		$scope.getCUPtable();	
	});



  
});