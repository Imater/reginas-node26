myApp.controller('statDayCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {

 	$scope.fpk.leftmenu = { active:8,
                items : [
                  {id:10, title:"Холдинг", href: "/fpk/statistic", segment: "s1.statistic"},
                  {id:11, title:"Подробная таблица", href: "/fpk/stat_table", segment: "s1.stat_table"},
                  {id:12, title:"Ежедневный отчёт", href: "/fpk/stat_day", segment: "s1.stat_day"}
                ]

                };

    $scope.jsGetClientsDay = function(){
		myApi.getClientsDay($scope).then(function(day_clients){
			$scope.day_clients = day_clients;
		});    	
    }

    $scope.jsGetClientsDay();

    $scope.$watch("fpk.today_date", function(){
    	$scope.jsGetClientsDay();	
    });



});