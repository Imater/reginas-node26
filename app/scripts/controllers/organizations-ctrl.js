//#fpk/settings


myApp.controller('organizationsTestsCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment, $timeout) {

 
 $scope.jsRefreshModels = function(){
   //alert("refresh models");
   myApi.jsLoadOrganizationsFromServer($scope).then(function(data){
    console.info(data);
    $scope.orgs = data.organizations;
   });
   
 }

 //$scope.jsRefreshModels();
 
 $scope.fpk.models_array_show = _.filter($scope.fpk.models_array, function(el){ return ( (el.brand == $scope.fpk.brand) && (el.show == 1)); 
 });


 $scope.$watch('fpk.brand', function(){
  $scope.jsRefreshModels();
 });
              
 $scope.jsSaveOrg = function(org) {
  console.info("save_org", org);
  myApi.jsSaveOrg($scope, org).then(function(){
    console.info("saved!");
  });
 }

$scope.jsNewOrganization = function() {
  myApi.jsNewOrganization($scope).then(function(){
    $scope.jsRefreshModels();
  });
 }

$scope.jsDeleteOrg = function(test) {
  if(confirm("Вы уверены, что хотите удалить организацию? Если она уже используется, то она не удалится.")) {
    myApi.jsDeleteOrganization($scope, test).then(function(){
      console.info("deleted!");
      $scope.jsRefreshModels();
    });
  }
 }





});