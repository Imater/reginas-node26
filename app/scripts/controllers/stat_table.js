//#fpk/stat_table

myApp.controller('statTableCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {

 	$scope.fpk.leftmenu = { active:1,
                items : [
                  {id:0, title:"Холдинг", href: "/fpk/statistic", segment: "s1.statistic"},
                  {id:1, title:"Подробная таблица", href: "/fpk/stat_table", segment: "s1.stat_table"}
                ]

                };
$scope.fpk.leftmenu.active = -1;

$scope.stat_view_switch = 1;

$scope.refreshStatTable = function(){
	 myApi.getTableStat($scope).then(function(answer) {
	 	$scope.stat_labels = [];
	 	var k=0;
	 	$.each(answer, function(i, el){
	 		if(k==0) {
	 			$scope.stat_labels.push( el );
	 			k+=1;
	 		}
	 	});

	 	$scope.stat_table = answer;
	 });
}

$scope.refreshStatTable();

$scope.$watch("fpk.brand", function(){
	$scope.refreshStatTable();
});

$scope.$watch("stat_view_switch", function(){
	$scope.refreshStatTable();
});


});