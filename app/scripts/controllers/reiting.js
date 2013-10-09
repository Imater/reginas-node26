//#fpk/reiting

myApp.controller('reitingCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {

 	$scope.fpk.leftmenu = { active:1,
                items : [
                  {id:10, title:"Рейтинг менеджеров", href: "/fpk/reiting", segment: "s1.reiting"}
                ]

                };
    
    $scope.days = 7;

    $scope.jsShowClientIds = function(my_ids) {
    	
    	myApi.getClientIds($scope, my_ids).then(function(clients){
    		//console.info("ids:",clients);
		    $scope.fpk.one_client = clients;
    		$scope.fpk.show_one_client = true;
    	});
    	
    }

    $scope.refreshReiting = function() {
	    myApi.getReiting($scope).then(function(reiting){
	    	reiting = _.sortBy(reiting, function(reit) { return -reit.reiting_sum });
	    	var max_reiting_sum = _.max(reiting, function(reit){ return reit.reiting_sum; });
	    	$.each(reiting, function(i, reit){
	    		reit.reiting = parseInt((reit.reiting_sum/max_reiting_sum.reiting_sum)*100);
	    	});
	    	$scope.reiting = reiting;
	    });    	
    }
    $scope.refreshReiting();

    $scope.$watchCollection("[days, fpk.brand, fpk.today_date]", function(Val, newVal){
    	if(Val != newVal) {
			$scope.refreshReiting();    		
    	}
    })


});