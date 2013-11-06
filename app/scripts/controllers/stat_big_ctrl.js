myApp.controller('statBigCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment, $q, $http) {
	$scope.stat_big_view_switch='dg';

	$scope.fpk.d1 = "01.10.2013";
	$scope.fpk.d2 = "31.11.2013";


    var jsLoadBig = function($scope) {
      var dfd = $q.defer();
        $http({url:'/api/v1/stat_big1',method: "GET", params: { brand: $scope.fpk.brand, today: $scope.fpk.today_date, d1:$scope.fpk.d1, d2:$scope.fpk.d2}}).then(function(result){
        	$scope.stat_big = result.data.answers;
        	$scope.stat_top = result.data.top;
          	dfd.resolve(result.data);
          
        });

      return dfd.promise;
    };

    jsLoadBig($scope);

    $scope.$watchCollection("[fpk.d2, fpk.d1, fpk.today_date, fpk.user_filter, fpk.brand]", function(Val, newVal){
    	if(Val != newVal) {
		    jsLoadBig($scope);
    	}
    })

    $scope.jsShortDate = function(dt) {
    	var d = new Date(dt);
    	return d.getDate()+"."+(d.getMonth()+1);
    }

});