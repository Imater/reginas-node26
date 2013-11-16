myApp.controller('statBigCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment, $q, $http) {
	$scope.stat_big_view_switch='all';

    function normal_date(col_date){
        return ('0'+col_date.getDate()).slice(-2)+"."+( '0'+(col_date.getMonth()+1) ).slice(-2)+"."+col_date.getFullYear()    
    }
    

	$scope.fpk.d1 = normal_date( new Date( (new Date()).getTime()-45*24*60*60*1000 ) );
    $scope.fpk.d2 = normal_date( new Date( (new Date()).getTime()+5*24*60*60*1000 ) );


    $scope.do_types = [
        { typ: "zv", img: "images/do_type/1zvonok.png", title: "Первичные звонки", tshort: "звонки"},
        { typ: "vz", img: "images/do_type/1vizit.png", title: "Первичные визиты", tshort: "визиты"},
        { typ: "tst", img: "images/do_type/1test-drive.png", title: "Тестдрайвы (по одному на каждого клиента)", tshort: "тесты"},
        { typ: "out", img: "images/do_type/1out.png", title: "Расторжения", tshort: "расторг"},
        { typ: "out_all", img: "images/do_type/1out.png", title: "Отказы (без договора)", tshort: "out"},
        { typ: "dg", img: "images/do_type/1dogovor.png", title: "Договора", tshort: "договора"},
        { typ: "vd", img: "images/do_type/1vidacha.png", title: "Выдачи", tshort: "выдачи"}
    ];


    var jsLoadBig = function($scope) {
      var dfd = $q.defer();
        $http({url:'/api/v1/stat_big3',method: "GET", params: { brand: $scope.fpk.brand, today: $scope.fpk.today_date, d1:$scope.fpk.d1, d2:$scope.fpk.d2}}).then(function(result){
            console.info("data",result.data);
        	$scope.stat_big = result.data.stat_big;
            $scope.col_dates = $scope.jsColDates();
            setTimeout(function(){
                $("#table_right").scrollLeft(999999);
            },100)

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

    $scope.jsColDates = function() {
          var col_dates = [];
          var _d1 = $scope.fpk.d1;
          var _d2 = $scope.fpk.d2;

          var d1_split = _d1.split(".");
          var d2_split = _d2.split(".");

          var d1 = new Date(d1_split[2], d1_split[1], d1_split[0],0 ,0 ,0 );
          var d2 = new Date(d2_split[2], d2_split[1], d2_split[0], 23, 59, 59 );

          var d = d1;

          while( d<=d2 ) {
            col_dates.push(d);
            d = new Date(d);
            var the_month = d.getMonth();
            var old_date = d;
            d.setDate(d.getDate()+1);
            if(d.getMonth() != the_month) {
              //col_dates.push({month:old_date});
            }
          }

          col_dates = _.map( col_dates, function(col_date){
            if(_.isDate(col_date)) {
             return col_date.getFullYear()+"."+( '0'+(col_date.getMonth()) ).slice(-2)+"."+('0'+col_date.getDate()).slice(-2);           
            }
          });

          return col_dates;

    }

    $scope.jsFindStat = function(group_line, col_date) {
        answer = group_line.statistic[col_date];

        return answer;
    }

    var today = toMysql(new Date()).split(" ")[0].replace(/-/ig, ".");
    $scope.jsShowDate = function(top){
      if(top == today ) {
          return "<span class='header_month'>"+top.slice(-5).replace('.','<br>')+"</span>";
      } else {
          return top.slice(-5).replace('.','<br>');
      }
    }

    $scope.jsShortDate = function(dt) {

    	if(dt.month) {
    		var month = new Date(dt.month);
    		return "<span class='header_month'>"+(month.getMonth())+"."+month.getFullYear()+"</span>";
    	}

    	var d = new Date(dt);
    	return d.getDate()+"."+(d.getMonth()+1);
    }

});