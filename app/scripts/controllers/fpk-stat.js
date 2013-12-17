//#fpk/stat
myApp.controller('statCtrl', function($scope, $resource, $rootScope, $location, socket, $routeParams, myApi, $routeSegment, $timeout, $http) {
	$scope.fpk.leftmenu.active = -1;
	$scope.stat_view_switch = 1;
	$scope.cup_tab = "by_day";
	setTimeout(function() {
		onResize();
	}, 10);
	//	$scope.chartConfig = {"options":{"chart":{"type":"areaspline"},"plotOptions":{"series":{"stacking":""}}},"series":[{"name":"Договора","data":[1,2,4,7,3,5,6,7,8,9,5,1,3,4,5],"id":"series-0"}],"title":{"text":"Hello"},"credits":{"enabled":true},"loading":false};
	$scope.jsCarsEnterClick = function(brand) {
		var user_group = $scope.fpk.the_user.user_group;
		var can_edit = (user_group == 1) || (user_group == 2) || (user_group == 10) || (user_group == 3);
		if (can_edit || ((brand.id == $scope.fpk.brand) && ($scope.fpk.the_user.rights[0].can_edit_all_client)) ) {
			var plan = prompt("Введите кол-во товарных автомобилей на складе:", brand.cup.plan);
			if(parseInt(plan)>0) {
				$http({
					url: '/api/v1/set_cars',
					method: "GET",
					params: {
						brand: brand.id,
						today: $scope.fpk.today_date,
						amount: parseInt(plan)
					}
				}).then(function(result) {
					brand.cup.plan = plan;
					alert("Данные успешно сохранены");
				});
			}
		} else {
			alert("Данные по кол-ву автомобилей на складе может менять только руководитель, старший менеджер или диспонент. Также, вы должны переключиться в тот бренд, в котором меняете кол-во.");
		}
	}
	$scope.LoadJsonByDay = function() {
		if ($routeSegment.startsWith('s1.st.statistic')) {
			//		$.getJSON('/api/v1/json/cup?brand='+$scope.fpk.brand).done(function(data) {
			$http({
				url: '/api/v1/json/cup',
				method: "GET",
				params: {
					brand: $scope.fpk.brand,
					today: $scope.fpk.today_date
				}
			}).then(function(result) {
				var title = ($scope.fpk.brand > 0) ? $scope.fpk.brands[$scope.fpk.brand].title : "Итого";
				var data = result.data;
				// Create the chart
				$scope.chartConfig = {
					exporting: {
						enabled: true
					},
					xAxis: {
						range: 1.2 * 30 * 24 * 3600 * 1000
					},
					rangeSelector: {
						selected: 1
					},
					useHighStocks: true,
					title: {
						text: 'Динамика — ' + title
					},
					series: [{
						name: 'Договора',
						data: data.dg,
						type: 'areaspline',
						threshold: null,
						tooltip: {
							valueDecimals: 0
						},
						color: '#6df943',
						fillColor: {
							linearGradient: {
								x1: 0,
								y1: 0,
								x2: 0,
								y2: 1
							},
							stops: [[0, Highcharts.getOptions().colors[2]], [1, 'rgba(0,0,0,0)']]
						}
					}, {
						name: 'Выдачи',
						data: data.vd,
						type: 'areaspline',
						threshold: null,
						tooltip: {
							valueDecimals: 0
						},
						color: '#7ba1d7',
						fillColor: {
							linearGradient: {
								x1: 0,
								y1: 0,
								x2: 0,
								y2: 1
							},
							stops: [[0, Highcharts.getOptions().colors[1]], [1, 'rgba(0,0,0,0)']]
						}
					}, {
						name: 'Расторжения',
						data: data.out,
						type: 'line',
						threshold: null,
						tooltip: {
							valueDecimals: 0
						},
						color: '#89585b',
						fillColor: {
							linearGradient: {
								x1: 0,
								y1: 0,
								x2: 0,
								y2: 1
							},
							stops: [[0, Highcharts.getOptions().colors[3]], [1, 'rgba(0,0,0,0)']]
						}
					}]
				};
			});
		}
	};
	$scope.$watch('cup_tab', function(val, newVal) {
		if ((newVal == "by_day") && (val != newVal)) {
			$scope.LoadJsonByDay();
		}
	});
	$scope.getCUPtable = function() {
		if ($routeSegment.startsWith('s1.st.statistic')) {
			myApi.getCUP($scope).then(function(cup) {
				var allow_brands = $scope.fpk.the_user.rights[0].brands;
				var brands = [];
				if (!$scope.fpk.the_user.can_see_corp) {
					cup.brands = _.filter(cup.brands, function(brand) {
						if (brand.Show == 0) return false;
						return true;
					});
				};
				//console.info("brands_all",$scope.fpk.the_user.rights[0].brands_all);
				//console.info("allow_brands",allow_brands);
				if (!allow_brands.length) {
					brands = _.filter(cup.brands, function(brand) {
						return (brand.id == $scope.fpk.the_user.brand);
					});
				} else if (allow_brands.indexOf("*") != -1) {
					brands = cup.brands;
				} else if ((allow_brands.indexOf("-") != -1) || ($scope.fpk.the_user.rights[0].brands_all == '["-"]')) {
					brands = cup.brands;
				} else if (true) {
					brands = _.filter(cup.brands, function(brand) {
						return (allow_brands.indexOf(brand.id) != -1);
					});
				}
				//console.info("brands = ", brands)
				$scope.cup = brands;
				var time_split = toMysql((new Date)).split(" ")[1].split(":");
				$scope.fpk.stat_load_time = time_split[0] + ":" + time_split[1];
				$scope.LoadJsonByDay();
			});
		};
	}
	$scope.fpk.init.done(function() {
		$scope.getCUPtable();
	});
	$scope.loadCupCar = function(brand_id, do_type, my_this) {
		$scope.cup_tab = "clients";
		if ($scope.cup_selected == my_this) {
			var today = $scope.fpk.today_date.substr(0, 7);
			$scope.cup_selected = "";
		} else {
			var today = $scope.fpk.today_date;
			$scope.cup_selected = my_this;
		}
		myApi.getCUPcars($scope, brand_id, do_type, today).then(function(cars) {
			$scope.fpk.clientsgroupby = "model";
			if (do_type == "prognoz") $scope.fpk.clientsgroupby = "icon2";
			$scope.cup_clients = cars;
		});
	}
	$scope.$watch('fpk.today_date', function(val, newVal) {
		if (val != newVal) $scope.getCUPtable();
		$scope.LoadJsonByDay();
	});
	$scope.$watch('fpk.d1', function(val, newVal) {
		if (val != newVal) $scope.getCUPtable();
			$scope.getCUPtable();
	});
	$scope.$watch('fpk.d2', function(val, newVal) {
		if (val != newVal) $scope.getCUPtable();
			$scope.getCUPtable();
	});
	$scope.$watch('fpk.brand', function(val, newVal) {
		$scope.LoadJsonByDay();
	});
	var tm_loadstat;
	$rootScope.$on("loadstat", function() {
		clearTimeout(tm_loadstat);
		tm_loadstat = setTimeout(function() {
			$scope.getCUPtable();
		}, 5000)
	});
});