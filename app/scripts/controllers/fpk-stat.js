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

	$scope.cup_tab="by_day";

	setTimeout(function(){
		onResize();
	},10);

//	$scope.chartConfig = {"options":{"chart":{"type":"areaspline"},"plotOptions":{"series":{"stacking":""}}},"series":[{"name":"Договора","data":[1,2,4,7,3,5,6,7,8,9,5,1,3,4,5],"id":"series-0"}],"title":{"text":"Hello"},"credits":{"enabled":true},"loading":false};


	$scope.LoadJsonByDay = function() {
		$.getJSON('/api/v1/json/cup?brand='+$scope.fpk.brand).done(function(data) {

				// Create the chart
				$scope.chartConfig = {
					exporting: {
						enabled: true
					},
					xAxis: {
						range: 1 * 30 * 24 * 3600 * 1000
					},
					rangeSelector : {
						//selected : 1
					},
					legend: {
					            align: 'right',
					            verticalAlign: 'top',
					            x: 0,
					            y: 100
					        },					useHighStocks: true,
					title : {
						text : 'Динамика '+$scope.fpk.brands[$scope.fpk.brand].title
					},
					series : [{
						name : 'Договора',
						data : data.dg,
						type : 'areaspline',
						threshold : null,
						tooltip : {
							valueDecimals : 0
						},
						color: '#6df943',
						fillColor : {
							linearGradient : {
								x1: 0, 
								y1: 0, 
								x2: 0, 
								y2: 1
							},
							stops : [[0, Highcharts.getOptions().colors[2]], [1, 'rgba(0,0,0,0)']]
						}
					},{
						name : 'Выдачи',
						data : data.vd,
						type : 'areaspline',
						threshold : null,
						tooltip : {
							valueDecimals : 0
						},
						color: '#7ba1d7',
						fillColor : {
							linearGradient : {
								x1: 0, 
								y1: 0, 
								x2: 0, 
								y2: 1
							},
							stops : [[0, Highcharts.getOptions().colors[1]], [1, 'rgba(0,0,0,0)']]
						}
					},{
						name : 'Расторжения',
						data : data.out,
						type : 'column',
						threshold : null,
						tooltip : {
							valueDecimals : 0
						},
						color: '#89585b',
					}]
				};
			}).fail(function(err){
				console.info(err);
			});

	};

	$scope.$watch('cup_tab', function(val, newVal){
		if(newVal=="by_day") {
			$scope.LoadJsonByDay();
		}
	});

	$scope.LoadJsonByDay();

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
	 	$scope.cup_tab = "clients";
	 	if($scope.cup_selected == my_this) {
			var today = $scope.fpk.today_date.substr(0,7);
			$scope.cup_selected = "";
	 	} else {
	 		var today = $scope.fpk.today_date;
		 	$scope.cup_selected = my_this;
	 	}
	    myApi.getCUPcars($scope, brand_id, do_type, today).then(function(cars){
          $scope.fpk.clientsgroupby = "model";
          if(do_type=="prognoz") $scope.fpk.clientsgroupby = "icon2";
	      $scope.cup_clients = cars;
	    });
	 }

	$scope.$watch('fpk.today_date', function(val, newVal) {
		if(val != newVal) $scope.getCUPtable();	
		$scope.LoadJsonByDay();
  	});

	$scope.$watch('fpk.brand', function(val, newVal) {
		$scope.LoadJsonByDay();
  	});

	$rootScope.$on("loadstat", function(){
		$scope.getCUPtable();	
	});



  
});