//#fpk/settings

_.intersectionObjects = _.intersect = function(array) {
    var slice = Array.prototype.slice; // added this line as a utility
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        //return _.indexOf(other, item) >= 0;
        return _.any(other, function(element) { return _.isEqual(element, item); });
      });
    });
  };

myApp.controller('settingsCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment, $timeout) {

 $scope.myData = [{name: "Moroni", age: 50, sex: 4},
                 {name: "Tiancum", age: 43},
                 {name: "Jacob", age: 27},
                 {name: "Nephi", age: 29},
                 {name: "Enos", age: 34}];
 
 $scope.jsRefreshModels = function(){
   alert("refresh models");
   $scope.myData = _.filter($scope.fpk.models_array, function(model){
      return (model.brand == $scope.fpk.brand);
   });  
 }

 $scope.jsRefreshModels();
 
 var columns = [
    {field:'model', displayName: 'Полное название'},
    {field:'cost', displayName: 'Средняя цена'},
    {field:'show', displayName: 'Показывать'},
    {field:'short', displayName: 'Короткое название'}

 ];

 var save_model = function(newValue, oldValue, scope) {    
     var changes = {};
     angular.forEach(newValue, function(value, key){
       var oldVal = _.find(oldValue, function(old_model){
         return (old_model.id == value.id);
       });

       if( !_.isEqual(oldVal, value) ) {
        changes[key] = value;
        changed = true;
       }
     });

     if( !_.isEmpty(changes) ) {
      console.info("DIF = ", changes);
      myApi.saveModel($scope, changes).then(function(answer){
        console.info("Изменения сохранены",answer);
      })
     }
 }

 var throtle_save_model = _.throttle(save_model, 1000);

 $scope.$watch('myData', throtle_save_model, true);

 $scope.$watch('fpk.brand', function(){
  $scope.jsRefreshModels();
 });


 $scope.mySelections = [];

 $scope.gridOptions = { data: 'myData', 
        columnDefs: columns,
//        enableCellSelection: true,
//        enableRowSelection: false,
        enableCellEditOnFocus: true,
        multiSelect: false,
        selectedItems: $scope.mySelections,
         };                 

 $scope.jsAddNewModel = function() {
  myApi.newModel($scope).then(function( answer ){
    var new_id = answer.rows.insertId;
    console.info("Новая модель добавлена", new_id);
    $scope.jsLoadModelsFromServer().then(function(){
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
    if(answer.rows[0].cnt) alert("Не могу удалять модель которая используется в клиентах "+answer.rows[0].cnt+" раз. Если хотите её скрыть, поставьте 'Показывать' = 0");
    $scope.jsLoadModelsFromServer().then(function(){
      $scope.jsRefreshModels();  
    });
   });
 }

 $scope.$parent.leftmenu = { active:1,
                items : [
                  {id:0, title:"Менеджеры", group_by: "manager", 
                   filter: {no_out: true, no_dg: true, no_vd:true}},

                  {id:1, title:"Модели", group_by: "manager", 
                   filter: {no_out: true, dg: true, no_vd:true}}

                  ]
                };


});