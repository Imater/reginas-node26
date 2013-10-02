//#fpk/admin_cup

myApp.controller('adminCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {

 	$scope.$parent.leftmenu = { active:1,
                items : [
                  {id:0, title:"Учёт трафика", href: "/fpk/admin_cup", segment: "s1.admin_cup"}
                ]

                };

    $scope.jsAddAdminDo = function() {
    	$scope.cup_new_show=true;
    }

    $scope.jsCloseAdminDo = function() {
    	$scope.cup_new_show=false;
    }


});