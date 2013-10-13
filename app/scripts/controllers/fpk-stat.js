//#fpk/stat

myApp.controller('statCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment, $timeout) {

 	$scope.fpk.leftmenu = { active:10,
                items : [
                  {id:10, title:"Холдинг", href: "/fpk/statistic", segment: "s1.statistic"},
                  {id:11, title:"Подробная таблица", href: "/fpk/stat_table", segment: "s1.stat_table"},
                  {id:12, title:"Ежедневный отчёт", href: "/fpk/stat_day", segment: "s1.stat_day"},
                  {id:13, title:"Подробный ежедневный отчёт", href: "/fpk/stat_all_day", segment: "s1.stat_all_day"}
                ]

                };

	$scope.fpk.leftmenu.active = -1;

	$scope.stat_view_switch = 1;




	$scope.getCUPtable = function() {
	 myApi.getCUP($scope).then(function(cup){

		  var allow_brands = $scope.fpk.the_user.rights[0].brands;

		  var brands = [];
		  console.info("brands = ", allow_brands);

		  if(!allow_brands.length) {
		    brands = _.filter(cup.brands, function(brand){
		      return (brand.id == $scope.fpk.the_user.brand);
		    });
		  } else if ( allow_brands.indexOf("*")!=-1 ) {
		    brands = cup.brands;
		  } else if ( allow_brands.indexOf("-")!=-1 ) {
		    brands = cup.brands;
		  } else if (true) {
		    brands = _.filter(cup.brands, function(brand){
		      return (allow_brands.indexOf(brand.id) != -1);
		    });
		    
		  }

	    $scope.cup = brands;



        var time_split = toMysql( (new Date) ).split(" ")[1].split(":");
	    $scope.fpk.stat_load_time = time_split[0]+":"+time_split[1];
	 });
	};

    $scope.fpk.init.done(function(){
    	$scope.getCUPtable();	
    });

	

	 $scope.loadCupCar = function(brand_id, do_type, my_this) {
	 	if($scope.cup_selected == my_this) {
			var today = $scope.fpk.today_date.substr(0,7);
			$scope.cup_selected = "";
	 	} else {
	 		var today = $scope.fpk.today_date;
		 	$scope.cup_selected = my_this;
	 	}
	    myApi.getCUPcars($scope, brand_id, do_type, today).then(function(cars){
          $scope.fpk.clientsgroupby = "model";
	      $scope.cup_clients = cars;
	    });
	 }

	$scope.$watch('fpk.today_date', function(val, newVal) {
		if(val != newVal) $scope.getCUPtable();	
  	});

	$rootScope.$on("loadstat", function(){
		$scope.getCUPtable();	
	});



  
});