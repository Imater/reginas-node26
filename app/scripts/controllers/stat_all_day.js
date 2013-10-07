myApp.controller('statAllDayCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {

 	$scope.fpk.leftmenu = { active:8,
                items : [
                  {id:10, title:"Холдинг", href: "/fpk/statistic", segment: "s1.statistic"},
                  {id:11, title:"Подробная таблица", href: "/fpk/stat_table", segment: "s1.stat_table"},
                  {id:12, title:"Ежедневный отчёт", href: "/fpk/stat_day", segment: "s1.stat_day"},
                  {id:13, title:"Подробный ежедневный отчёт", href: "/fpk/stat_all_day", segment: "s1.stat_all_day"}
                ]

                };

    $scope.day = {
      month: {days: 31, days_past: 18, days_last: 12},
      plan_month: [ 
        {title: "CBU", plan_month: 67},
        {title: "Solaris", plan_month: 100}, 
        {title: "Итого", plan_month: 167}, 
      ],
      vd_month: [
        {title: "CBU", vd: 19, clients:[100483, 100491]},
        {title: "Solaris", vd: 45, clients:[100491]},
        {title: "Итого", vd: 64, clients:[100491, 100483]}
      ],
      vd_rest_month: [
        {title: "CBU", vd: 48, clients:[100483, 100491]},
        {title: "Solaris", vd: 55, clients:[100491]},
        {title: "Итого", vd: 103, clients:[100491, 100483]}
      ],
      vd_plan_month: [
        {title: "CBU", vd: "6<br>(3 + 2 + 1)", clients:[100483, 100491]},
        {title: "Solaris", vd: "3<br>(2 + 1 + 0)", clients:[100491]},
        {title: "Итого", vd: "9<br>(5 + 3 + 1)", clients:[100491, 100483]}
      ],
      vd_need_rest_for_plan_month: [
        {title: "CBU", vd: 4, clients:[100483, 100491]},
        {title: "Solaris", vd: 2, clients:[100491]},
        {title: "Итого", vd: 9, clients:[100491, 100483]}
      ],
      //Воронка продаж
      voronka_traffic: [
        {title: "CBU", count: "4 (20)", clients:[100483, 100491]},
        {title: "Solaris", count: "2 (35)", clients:[100491]},
        {title: "Итого", count: "6 (55)", clients:[100491, 100483]},
        {title: "% от трафика", count: "100% (100%)", clients:[100491, 100483]},
        {title: "% от контактов", count: "130% (120%)", clients:[100491, 100483]}
      ],
      voronka_contacts: [
        {title: "CBU", count: "14 (120)", clients:[100483, 100491]},
        {title: "Solaris", count: "12 (67)", clients:[100491]},
        {title: "Итого", count: "26 (187)", clients:[100491, 100483]},
        {title: "% от трафика", count: "60% (50%)", clients:[100491, 100483]},
        {title: "% от контактов", count: "50% (45%)", clients:[100491, 100483]}
      ],
      voronka_tst: [
        {title: "CBU", count: "1 (18)", clients:[100483, 100491]},
        {title: "Solaris", count: "8 (23)", clients:[100491]},
        {title: "Итого", count: "9 (41)", clients:[100491, 100483]},
        {title: "% от трафика", count: "45% (40%)", clients:[100491, 100483]},
        {title: "% от контактов", count: "30% (28%)", clients:[100491, 100483]}
      ],
      voronka_dg: [
        {title: "CBU", count: "3 (18)", clients:[100483, 100491]},
        {title: "Solaris", count: "2 (34)", clients:[100491]},
        {title: "Итого", count: "5 (52)", clients:[100491, 100483]},
        {title: "% от трафика", count: "15% (12%)", clients:[100491, 100483]},
        {title: "% от контактов", count: "10% (8%)", clients:[100491, 100483]}
      ],
      voronka_dg_average: [
        {title: "CBU", count: 2.1, clients:[100483, 100491]},
        {title: "Solaris", count: 3.2, clients:[100491]},
        {title: "Итого", count: 5.3, clients:[100491, 100483]}
      ],
      voronka_rastorg: [
        {title: "CBU", count: "1 (8)", clients:[100483, 100491]},
        {title: "Solaris", count: "2 (16)", clients:[100491]},
        {title: "Итого", count: "3 (24)", clients:[100491, 100483]},
        {title: "% от трафика", count: "1% (2%)", clients:[100491, 100483]},
        {title: "% от контактов", count: "0.8% (0.6%)", clients:[100491, 100483]}
      ],
      voronka_vd: [
        {title: "CBU", count: "2 (10)", clients:[100483, 100491]},
        {title: "Solaris", count: "3 (15)", clients:[100491]},
        {title: "Итого", count: "5 (25)", clients:[100491, 100483]},
        {title: "% от трафика", count: "19% (23%)", clients:[100491, 100483]},
        {title: "% от контактов", count: "16% (12%)", clients:[100491, 100483]}
      ],
      voronka_models: [
        {title: "Elantra", 
         sklad: 15, 
         dg_all: 18, 
         tst: 1, 
         dg_day: 3, 
         dg_month: 10, 
         vd_day: 3, 
         vd_month: 50, 
         plan: 30,
         traffic_day: 20,
         traffic_month: 180,
         phones_day: 50,
         phones_month: 170
        }
      ]




    }

/*    $scope.jsGetClientsAllDay = function(){
		myApi.getClientsAllDay($scope).then(function(day_clients){
			$scope.day_clients = day_clients;
		});    	
    }

    $scope.jsGetClientsAllDay();

    $scope.$watch("fpk.today_date", function(){
    	$scope.jsGetClientsAllDay();	
    });
*/


});