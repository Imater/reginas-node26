myApp.controller('statBigCtrl', function($scope, $resource, $rootScope, $location, socket, $routeParams, myApi, $routeSegment, $q, $http) {
  $scope.stat_big_view_switch = 'all';


  function normal_date(col_date) {
    return ('0' + col_date.getDate()).slice(-2) + "." + ('0' + (col_date.getMonth() + 1)).slice(-2) + "." + col_date.getFullYear()
  }

  $scope.show_days = false;
  //    $scope.group1 = "manager_id";
  //$scope.group2 = "user_fio";
  $scope.group1 = "model";
  $scope.group2 = "short";

  $scope.fpk.d1 = normal_date(new Date((new Date()).getTime() - 65 * 24 * 60 * 60 * 1000));
  $scope.fpk.d2 = normal_date(new Date((new Date()).getTime() + 25 * 24 * 60 * 60 * 1000));


  $scope.do_types = [{
    typ: "zv",
    img: "images/do_type/1zvonok.png",
    title: "Первичные звонки",
    tshort: "звонки"
  }, {
    typ: "vz",
    img: "images/do_type/1vizit.png",
    title: "Первичные визиты",
    tshort: "визиты"
  }, {
    typ: "tst",
    img: "images/do_type/1test-drive.png",
    title: "Тестдрайвы (по одному на каждого клиента)",
    tshort: "тесты"
  }, {
    typ: "out",
    img: "images/do_type/1out.png",
    title: "Расторжения",
    tshort: "расторг"
  }, {
    typ: "out_all",
    img: "images/do_type/1out.png",
    title: "Отказы (без договора)",
    tshort: "out"
  }, {
    typ: "dg",
    img: "images/do_type/1dogovor.png",
    title: "Договора",
    tshort: "договора"
  }, {
    typ: "vd",
    img: "images/do_type/1vidacha.png",
    title: "Выдачи",
    tshort: "выдачи"
  }];

  $scope.myownfiler = function() {
    alert(1);
  }

  //ng-show="(stat_big_view_switch==dt.typ)||(stat_big_view_switch=='all')"
  var jsLoadBig = function($scope) {
      var dfd = $q.defer();
      $http({
        url: '/api/v1/stat_big3',
        method: "GET",
        params: {
          brand: $scope.fpk.brand,
          today: $scope.fpk.today_date,
          d1: $scope.fpk.d1,
          d2: $scope.fpk.d2,
          group1: $scope.group1,
          group2: $scope.group2,
          manager_filter: $scope.fpk.manager_filter
        }
      }).then(function(result) {
        console.info("data", result.data);
        $scope.stat_big = result.data.stat_big;
        $scope.col_dates = $scope.jsColDates();
        setTimeout(function() {
          $("#table_right").scrollLeft(999999);
        }, 100)

        dfd.resolve(result.data);

      });

      return dfd.promise;
    };

  jsLoadBig($scope);

  $scope.$watchCollection("[fpk.d2, fpk.d1, fpk.today_date, fpk.brand, show_days, group1, fpk.manager_filter]", function(Val, newVal) {
    if (Val != newVal) {
      jsLoadBig($scope);
    }
  })

  $scope.jsColDates = function() {
    var month_names = {
      '1': "Январь",
      '2': "Февраль",
      '3': "Март",
      '4': "Апрель",
      '5': "Май",
      '6': "Июнь",
      '7': "Июль",
      '8': "Август",
      '9': "Сентябрь",
      '10': "Октябрь",
      '11': "Ноябрь",
      '12': "Декабрь",
    }
    var col_dates = [];
    var _d1 = $scope.fpk.d1;
    var _d2 = $scope.fpk.d2;

    var d1_split = _d1.split(".");
    var d2_split = _d2.split(".");

    var d1 = new Date(d1_split[2], d1_split[1] - 1, d1_split[0], 0, 0, 0);
    var d2 = new Date(d2_split[2], d2_split[1] - 1, d2_split[0], 23, 59, 59);

    var d = d1;

    while (d <= d2) {

      if ($scope.show_days) col_dates.push({
        date: d
      });
      d = new Date(d);
      var the_month = d.getMonth();
      var old_date = d;
      d.setDate(d.getDate() + 1);

      if (d.getDay() == 1) {
        col_dates.push({
          week: old_date
        });
      }

      if (d.getMonth() != the_month) {
        col_dates.push({
          month: old_date
        });
      }

    }

    col_dates = _.map(col_dates, function(col_date) {
      var answer = {};
      if (col_date.date) {
        var dt = toMysql(col_date.date).split(" ")[0];
        var title = dt.split('-');
        title = title[1] + "<br>" + title[2];
        answer.date = {
          date: dt.replace(/-/ig, "."),
          title: title,
          int_date: col_date.date
        };
      } else if (col_date.week) {
        var dt = toMysql(col_date.week).split(" ")[0];
        var title = dt.split('-');
        title = title[1] + "<br>W" + (col_date.week.getWeek());
        answer.date = {
          week: true,
          date: dt.replace(/-/ig, "."),
          title: title,
          int_date: col_date.week
        };
      } else if (col_date.month) {
        var dt = toMysql(col_date.month).split(" ")[0];
        var title = dt.split('-');
        title = title[0] + "<br>" + month_names[title[1] - 1];
        answer.date = {
          month: true,
          date: dt.replace(/-/ig, "."),
          title: title,
          int_date: col_date.month
        };
      }
      return answer;
    });

    console.info(col_dates);
    return col_dates;

  }


/*            if(_.isDate(col_date.date)) {
                return {date: col_date.date.getFullYear()+"."+( '0'+(col_date.date.getMonth()) ).slice(-2)+"."+('0'+col_date.date.getDate()).slice(-2)};           
            } else {
                if(col_date.month) {
                    col_date = col_date.month;
                    return {week: col_date.getFullYear()+"."+( '0'+(col_date.getMonth()) ).slice(-2)};
                } else if(col_date.week) {
                    col_date = col_date.week;
                    return {month: col_date.getFullYear()+".W"+( '0'+(col_date.getWeek()) ).slice(-2)};                    
                }
            }
*/

  $scope.jsFindStat = _.memoize(function(group_line, col_date) {
    var answer = {};
    if (col_date.date.week) {
      var dt = new Date(col_date.date.int_date);
      var find_date = dt.getFullYear() + ".W" + (dt.getWeek() - 1);
      answer = group_line.statistic_week[find_date];
    } else if (col_date.date.month) {
      answer = group_line.statistic_month[col_date.date.date.substr(0, 7)];
    } else {
      answer = group_line.statistic[col_date.date.date];
    }

    return answer;
  }, function(group_line, col_date) {
    return group_line.time + JSON.stringify(col_date)
  });

  var today = toMysql(new Date()).split(" ")[0].replace(/-/ig, ".");

  $scope.jsShowDate = _.memoize(function(top) {
    if (top.date) {
      if (top.date.date == today) {
        return "<span class='header_today'>" + top.date.title + "</span>";
      } else {
        return top.date.title;
      }
    } else if (top.week) {
      return "<span class='header_week'>" + top.week.title + "</span>";
    } else if (top.month) {
      return "<span class='header_month'>" + top.month.title + "</span>";
    }
  }, function(top) {
    return JSON.stringify(top)
  });

  $scope.jsShortDate = function(dt) {

    if (dt.month) {
      var month = new Date(dt.month);
      return "<span class='header_month'>" + (month.getMonth()) + "." + month.getFullYear() + "</span>";
    }

    var d = new Date(dt);
    return d.getDate() + "." + (d.getMonth() + 1);
  }

});