myApp.controller('statMainCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {

 	$scope.fpk.leftmenu = { active:8,
                items : [
                  {id:10, title:"Холдинг", href: "/fpk/st/statistic", segment: "s1.st.statistic"},
                  {id:11, title:"Подробная таблица", href: "/fpk/st/stat_table", segment: "s1.st.stat_table"},
                  {id:12, title:"Ежедневный отчёт", href: "/fpk/st/stat_day", segment: "s1.st.stat_day"},
                  {id:13, title:"Аналитика по датам", href: "/fpk/st/stat_big", segment: "s1.st.stat_big"}
                ]

                };


});