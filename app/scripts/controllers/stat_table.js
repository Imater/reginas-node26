//#fpk/stat_table

myApp.controller('statTableCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {


if(false)
$scope.myData = [{name: "Moroni", age: 50},
                 {name: "Tiancum", age: 43},
                 {name: "Jacob", age: 27},
                 {name: "Nephi", age: 29},
                 {name: "Enos", age: 34}];
 
if(false)
 var columns = [
    {field:'model', displayName: 'Полное название'},
    {field:'cost', displayName: 'Средняя цена'},
    {field:'show', displayName: 'Показывать'},
    {field:'short', displayName: 'Короткое название'}

 ];

 myApi.getTableStat($scope).then(function(answer) {
 	console.info(answer);
 	var table = [];
 	$.each(answer, function(i, el){
 		var line = {};
 		$.each(el.cols, function(j, col){
 			line[col.col] = col.value;
 		})
 		line["model"] = el.model;
 		
 		table.push( line );
 	});
 	console.info(table);
 	$scope.myData = table;
 });

 $scope.mySelections = [];

 $scope.gridOptions = { data: 'myData', 
//        columnDefs: columns,
//        enableCellSelection: true,
//        enableRowSelection: false,
        enableCellEditOnFocus: true,
        multiSelect: false,
        selectedItems: $scope.mySelections,
         };         


});