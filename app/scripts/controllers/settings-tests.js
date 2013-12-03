//#fpk/settings


myApp.controller('settingsTestsCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment, $timeout) {

 
 $scope.jsRefreshModels = function(){
   //alert("refresh models");
   $scope.fpk.jsLoadModelsFromServer();
   
 }

 $scope.jsRefreshModels();
 
 $scope.fpk.models_array_show = _.filter($scope.fpk.models_array, function(el){ return ( (el.brand == $scope.fpk.brand) && (el.show == 1)); 
 });


 $scope.$watch('fpk.brand', function(){
  $scope.jsRefreshModels();
 });
              
 $scope.jsSaveTest = function(test) {
  console.info("save_test", test);
  myApi.jsSaveTest($scope, test).then(function(){
    console.info("saved!");
  });
 }

$scope.jsNewTest = function() {
  myApi.jsNewTest($scope).then(function(){
    $scope.jsRefreshModels();
  });
 }

$scope.jsDeleteTest = function(test) {
  if(confirm("Вы уверены, что хотите удалить автомобиль? Если он хоть раз исопльзуется, то он не удалится.")) {
    myApi.jsDeleteTest($scope, test).then(function(){
      console.info("deleted!");
      $scope.jsRefreshModels();
    });
  }
 }

 $scope.jsFilterTest = function() {
  var result = _.filter($scope.fpk.tests, function(test) {
    return test.brand == $scope.fpk.brand;
  });
  return result;
 }

 $scope.jsAddNewModel = function() {
  myApi.newModel($scope).then(function( answer ){
    var new_id = answer.rows.insertId;
    console.info("Новая модель добавлена", new_id);
    $scope.fpk.jsLoadModelsFromServer().then(function(){
      $scope.jsRefreshModels();  
      $timeout(function(){
        $(".ngViewport").scrollTop(9999999);
        angular.forEach($scope.myData, function(data, index){
            console.info(data.id);
            if(data.id == new_id){
                $scope.gridOptions.selectItem(index, true);
            }
        });

      },5);
    });    
  });
  //$scope.myData.push( {id: 999, brand: $scope.brand, model: "Новая модель", show: 1, short: "Новая"} )
}

 $scope.jsDeleteSelectedModel = function() {
   var del_id = $scope.mySelections[0].id;
   myApi.deleteModel($scope, del_id).then(function(answer){
    if(answer.rows && answer.rows[0].cnt) alert("Не могу удалять модель которая используется в клиентах "+answer.rows[0].cnt+" раз. Если хотите её скрыть, поставьте 'Показывать' = 0");
    $scope.fpk.jsLoadModelsFromServer().then(function(){
      $scope.jsRefreshModels();  
    });
   });
 }



});