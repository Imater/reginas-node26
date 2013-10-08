//#fpk/admin_cup

myApp.controller('adminCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {

 	$scope.fpk.leftmenu = { active:1,
                items : [
                  {id:0, title:"Учёт трафика", href: "/fpk/admin_cup", segment: "s1.admin_cup"}
                ]

                };

    $scope.jsLoadAdmin = function(){
        myApi.jsGetManagerCupAdmin($scope).then(function(admin){
            $scope.admin = admin;
        })        
    }

    $scope.jsLoadAdmin();

    $scope.$watchCollection("[fpk.brand, fpk.today_date]",function(){
        $scope.jsLoadAdmin();
    })

    $scope.jsSign = function(a, b) {
        answer = "";
        if( !a && !b ) return " ";
        if(a>b) {
            answer = ">";
        } else if (a==b) {
            answer = "=";
        } else if (a<b) {
            answer = "<";
        }
        return answer;
    }

    $scope.jsAddAdminDo = function() {
    	$scope.cup_new_show=true;
    }

    $scope.jsCloseAdminDo = function() {
    	$scope.cup_new_show=false;
    }


});