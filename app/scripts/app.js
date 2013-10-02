


angular.module('fpkApp', ["ngResource", "ngSanitize", "ngRoute", 'ui.redactor', 'ui.redactor.multi', 'ui.calendar', "ng", "infinite-scroll", "monospaced.elastic", 'route-segment', 'view-segment', 'ngGrid'])
    .config(function ($routeProvider, $locationProvider, $compileProvider, $routeSegmentProvider) {

//    $locationProvider.html5Mode(false).hashPrefix('!');
        $routeSegmentProvider.options.autoLoadTemplates = true;


        $routeSegmentProvider
            .when('/user/login', 'user.login')
            .when('/user/reg', 'user.reg')

            .when('/fpk', 's1')
            .when('/fpk/clients', 's1.clients')
            .when('/fpk/statistic', 's1.stat')
            .when('/fpk/stat_table', 's1.stat_table')
            .when('/fpk/admin_cup', 's1.admin_cup')
            .when('/fpk/news', 's1.news')
            .when('/fpk/calendar', 's1.calendar')
            .when('/fpk/settings', 's1.settings')
            .when('/fpk/settings/models', 's1.settings.models')

            .segment('user', {
                templateUrl: 'views/user.html',
                controller: 'loginCtrl'})
            .within()
            .segment('login', {
                templateUrl: 'views/user/login.html'})
            .segment('reg', {
                templateUrl: 'views/user/reg.html'})
            .up()
            .segment('s1', {
                templateUrl: 'views/fpk.html',
                controller: 'fpkCtrl'})
            .within()
            .segment('clients', {
                templateUrl: 'views/fpk/clients.html',
                controller: 'clientsCtrl'
            })
            .segment('admin_cup', {
                templateUrl: 'views/fpk/admin_cup.html',
                controller: 'adminCtrl'
            })
            .segment('news', {
                templateUrl: 'views/fpk/news.html',
                controller: 'statCtrl'
            })
            .segment('calendar', {
                templateUrl: 'views/fpk/calendar.html',
                controller: 'calendarCtrl'
            })
            .segment('stat', {
                templateUrl: 'views/fpk/stat.html',
                controller: 'statCtrl'
            })
            .segment('stat_table', {
                templateUrl: 'views/fpk/stat/stat_table.html',
                controller: 'statTableCtrl'
            })
            .segment('settings', {
                templateUrl: 'views/fpk/settings.html',
                controller: 'settingsCtrl'
            })
            .within()
            .segment('models', {
                templateUrl: 'views/fpk/settings/models.html',
                controller: 'settingsCtrl'
            })

            .up();

        $routeProvider.otherwise({redirectTo: '/fpk/clients'});


        /*    $routeProvider
         .when('/clients/:parent_id', {
         templateUrl: 'views/main.html',
         controller: 'MainCtrl',
         reloadOnSearch: false
         })
         .when('/editor/:parent_id', {
         templateUrl: 'views/multieditor.html',
         controller: 'MainCtrl',
         reloadOnSearch: false
         })
         .otherwise({
         redirectTo: '/clients/1'
         });*/


        // configure new 'compile' directive by passing a directive
        // factory function. The factory function injects the '$compile'
        $compileProvider.directive('compile', function ($compile) {
            // directive factory creates a link function
            return function (scope, element, attrs) {

                scope.$watch(
                    function (scope) {
                        // watch the 'compile' expression for changes
                        return scope.$eval(attrs.compile);
                    },
                    function (value) {
                        // when the 'compile' expression changes
                        // assign it into the current DOM
                        element.html(value);

                        // compile the new DOM and link it to the current
                        // scope.
                        // NOTE: we only compile .childNodes so that
                        // we don't get into infinite loop compiling ourselves
                        $compile(element.contents())(scope);
                    }
                );
            };
        })


    });


function MainCtrl($scope, $routeSegment, myApi, $timeout) {

    var body_class = localStorage.getItem("body_class");
    if(body_class) $("body").attr("class", body_class);
    if($("body").hasClass("right_hide")) $scope.right_panel_hide = true;
    else $scope.right_panel_hide = false;


    $scope.$routeSegment = $routeSegment;

    $scope.$on('routeSegmentChange', function () {
    });

    var manager_filter = localStorage.getItem("manager_filter");
    $scope.manager_filter = manager_filter?manager_filter:(-1);

    $scope.user_fio = "Login...";

    $scope.jsLoadModelsFromServer = function() {
         var dfd = new $.Deferred();
         myApi.getModels($scope).then(function(data){ 
            var answer = {};
            var answer2 = {};
            var answer3 = {};

            $.each(data.models, function(i, model){
              answer[model.id] = model;
            });
            $.each(data.brands, function(i, brand){
              answer2[brand.id] = brand;
            });
            $.each(data.users_group, function(i, user_group){
              answer3[user_group.id] = user_group;
            });
            $scope.models_array = data.models;
            $scope.models = answer;
            $scope.brands = answer2;
            $scope.users_group = answer3;
            $scope.users_groups = data.users_group;
            dfd.resolve();
         }); //getModels
         return dfd.promise();
    }

    $scope.brand = localStorage.getItem("brand")?localStorage.getItem("brand"):1;

    $scope.today_do = [];
    $scope.jsRefreshDo = function(scope){        
        if($scope.right_panel_hide == false) {
          myApi.getDoToday(scope).then(function(answer){
            $scope.today_do = answer;
            console.info("DO:",$scope.today_do);
          });
        } else {
            //$scope.today_do = [];
        }

    }

    $scope.jsRefreshUserInfo = function() {
        myApi.loadUserInfo($scope).then(function(user){
          $scope.the_user = user.user[0];
          $scope.brand = user.user[0].brand; //бренд по умолчанию
          localStorage.setItem("brand", $scope.brand);
          $scope.managers = user.users; //список всех менеджеров
          $scope.credit_managers = _.filter(user.users, function(user){
            return (user.user_group == 7);
          });
          $scope.commercials = user.commercials;
          /////////////////////////////////////////////
          $scope.jsRefreshDo($scope);
        });  
    }


    jsRefreshToken().done(function () {
        ///////////////////////////////////////////////
        $scope.jsRefreshUserInfo();
        ///////////////////////////////////////////////
        console.info("refresh_token_did");
        //загружаем таблицу моделей
        $scope.jsLoadModelsFromServer().then(function(){
            setTimeout(function(){
            $scope.$broadcast('user_loaded', $scope.the_user);
            },1);
        });
         /////////////////////////////////////////////



    }); //Refresh Token

}


function strip_tags(str) { // Strip HTML and PHP tags from a string
    //
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    if (!str) return "";
    var answer = str.replace(/<\/?[^>]+>/gi, '');

    answer = answer.replace(/\n/gi, '');

    return answer;
}


$.datepicker.regional['ru'] = {
    closeText: 'Закрыть',
    prevText: '&#x3C;Пред',
    nextText: 'След&#x3E;',
    currentText: 'Сегодня',
    monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
        'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    dayNames: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
    dayNamesShort: ['вск', 'пнд', 'втр', 'срд', 'чтв', 'птн', 'сбт'],
    dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    weekHeader: 'Нед',
    dateFormat: 'dd.mm.yy',
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: false,
    yearSuffix: ''};
$.datepicker.setDefaults($.datepicker.regional['ru']);


////////////////////////

angular.module("ngLocale", [], ["$provide", function ($provide) {
    var PLURAL_CATEGORY = {ZERO: "zero", ONE: "one", TWO: "two", FEW: "few", MANY: "many", OTHER: "other"};
    $provide.value("$locale", {"NUMBER_FORMATS": {"DECIMAL_SEP": ",", "GROUP_SEP": " ", "PATTERNS": [
        {"minInt": 1, "minFrac": 0, "macFrac": 0, "posPre": "", "posSuf": "", "negPre": "-", "negSuf": "", "gSize": 3, "lgSize": 3, "maxFrac": 3},
        {"minInt": 1, "minFrac": 2, "macFrac": 0, "posPre": "", "posSuf": " \u00A4", "negPre": "-", "negSuf": " \u00A4", "gSize": 3, "lgSize": 3, "maxFrac": 2}
    ], "CURRENCY_SYM": "руб"}, "pluralCat": function (n) {
        if ((n % 10) == 1 && (n % 100) != 11) {
            return PLURAL_CATEGORY.ONE;
        }
        if ((n % 10) >= 2 && (n % 10) <= 4 && ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
            return PLURAL_CATEGORY.FEW;
        }
        if ((n % 10) == 0 || ((n % 10) >= 5 && (n % 10) <= 9) || ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
            return PLURAL_CATEGORY.MANY;
        }
        return PLURAL_CATEGORY.OTHER;
    }, "DATETIME_FORMATS": {"MONTH": ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"], "SHORTMONTH": ["янв.", "февр.", "марта", "апр.", "мая", "июня", "июля", "авг.", "сент.", "окт.", "нояб.", "дек."], "DAY": ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"], "SHORTDAY": ["вс", "пн", "вт", "ср", "чт", "пт", "сб"], "AMPMS": ["AM", "PM"], "medium": "dd.MM.yyyy H:mm:ss", "short": "dd.MM.yy H:mm", "fullDate": "EEEE, d MMMM y 'г'.", "longDate": "d MMMM y 'г'.", "mediumDate": "dd.MM.yyyy", "shortDate": "dd.MM.yy", "mediumTime": "H:mm:ss", "shortTime": "H:mm"}, "id": "ru-ru"});
}]);






          //парсер даты (позвонить послезавтра)
          var jsParseDate = function(title) {
          
            title = title.replace(" один"," 1").replace(" один"," 1").replace(" два"," 2").replace(" три"," 3").replace(" четыре"," 4").replace(" пять"," 5").replace(" шесть"," 6").replace(" семь"," 7").replace("восемь","8").replace("девять","9").replace("десять","10").replace("одинадцать","11").replace("двенадцать","12").replace("тринадцать","13").replace("четырнадцать","14").replace("пятнадцать","15").replace(" шестнадцать"," 16").replace(" семнадцать"," 17").replace(" двадцать"," 20").replace(" ноль"," 0");
          
            if(title) title = title.toLowerCase();
            var answer = "";
            var did = false;
            var mytime = "";
            var mydate = new Date();
            var newdate = new Date();
            
            var d = new Object;
            
            d.myhours = 0;
            d.myminutes = 0;
            d.mydays = 0;
            d.mymonth = 0;
            d.myyears = 0;
            d.myweek = 0;
            
            
            var shablon = /(\d{1,2}.\d{1,2}.\d{4})/g; 
            var matches = title.match(shablon);
            
            if(matches) {
                shablon = /(\d{1,4})/g; 
                var matches2 = matches[0].match(shablon);
                newdate.setDate(matches2[0]);
                newdate.setMonth(matches2[1]-1);
                newdate.setFullYear(matches2[2]);
                answer = matches2[0] + "." + matches2[1] + "." + matches2[2];
                did = true;
            }
            
            shablon = /(\d{1,2} янв)|(\d{1,2} фев)|(\d{1,2} мар)|(\d{1,2} апр)|(\d{1,2} мая)|(\d{1,2} май)|(\d{1,2} июн)|(\d{1,2} июл)|(\d{1,2} авг)|(\d{1,2} сен)|(\d{1,2} окт)|(\d{1,2} ноя)|(\d{1,2} дек)/g; 
            matches = title.match(shablon);
            
            if(matches) {
                console.info(matches);
                shablon = /(\d{4})/g; 
                matches2 = title.match(shablon); //найти год
            
                shablon = /(янв)|(фев)|(мар)|(апр)|(мая)|(май)|(июн)|(июл)|(авг)|(сен)|(окт)|(ноя)|(дек)/g; 
                matches3 = title.match(shablon); //найти месяц
            
                shablon = /(\d{1,2})/g; 
                matches4 = matches[0].match(shablon); //найти дату
            
                if(matches3[0]=="янв") var mymonth = 1;
                if(matches3[0]=="фев") var mymonth = 2;
                if(matches3[0]=="мар") var mymonth = 3;
                if(matches3[0]=="апр") var mymonth = 4;
                if(matches3[0]=="мая") var mymonth = 5;
                if(matches3[0]=="май") var mymonth = 5;
                if(matches3[0]=="июн") var mymonth = 6;
                if(matches3[0]=="июл") var mymonth = 7;
                if(matches3[0]=="авг") var mymonth = 8;
                if(matches3[0]=="сен") var mymonth = 9;
                if(matches3[0]=="окт") var mymonth = 10;
                if(matches3[0]=="ноя") var mymonth = 11;
                if(matches3[0]=="дек") var mymonth = 12;
                
                newdate.setDate(matches4[0]);
                newdate.setMonth(mymonth-1);
            
                if(matches2) newdate.setFullYear(matches2[0]);
                
                answer = matches4[0] + " " + matches3[0];
                did = true;
            }
            
            shablon = /(вчера)|(позавчера)|(сегодня)|(завтра)|(послезавтра)/g; 
            matches = title.match(shablon);
            if(matches) {
                if(matches[0]=="позавчера") var add_days = -2;
                if(matches[0]=="вчера") var add_days = -1;
                if(matches[0]=="сегодня") var add_days = 0;
                if(matches[0]=="завтра") var add_days = +1;
                if(matches[0]=="послезавтра") var add_days = +2;
                
                newdate.setDate( newdate.getDate() + add_days );
                answer=" + " + matches[0];
                did = true;
            }
            
            shablon = /(\d{1,2}ч|\d{1,2} ч)|(в \d{1,2}:\d{1,2})|(в\d{1,2}:\d{1,2})|(\d{2} ми)|(\d{2}ми)|(\d{1,2} \d{2}м)|(в \d{1,2})|(в\d{1,2})|(\d{1,2}:\d{1,2})/g; 
            matches = title.match(shablon);
            
            if(matches) {
                if(matches.length==1) {
                    mytime = matches;
                } else {
                    mytime = matches.join(" ");
                }
            }
            
            var matches2 = title.match(/\d{1,4}/g); //все двух-значные цифры
            
            var plus;
            shablon = /(дней|лет|нед|год|мес|день|дня|час|мин|\d{1,2}м|\d{1,2} м)/g;
            matches = title.match(shablon);
            //если "через 2 часа 30 минут"
            if( ( (title.indexOf("назад")!=-1) || (title.indexOf("через")!=-1) ) && matches ) {
                if (title.indexOf("через")!=-1) { plus = "+";
                } else { plus = "-"; }
                
                if(matches[0]=="час") //если указаны часы и минуты
                    {
                    if(matches2)
                        {
                        answer = plus;
                        if(matches2[0]) { answer += matches2[0] + " час."; d.myhours=plus+matches2[0]; }
                        if(matches2[1]) { answer += " "+matches2[1] + " мин."; d.myminutes=plus+matches2[0]; }
                        mytime = ""; //это не время
                        }
                    }
                if(matches[0]=="мин" || (matches[0][matches[0].length-1]=="м" && (title.indexOf("мес")==-1 ))) //если указаны только минуты
                    {
                    if(matches2)
                        {
                        answer = plus;
                        if(matches2[0]) { answer += " "+matches2[0] + " minute"; d.myminutes=plus+matches2[0]; }
                        mytime = ""; //это не время
                        }
                    }
                if(matches[0]=="нед") //если указаны только недели
                    {
                    if(matches2)
                        {
                        answer = plus;
                        if(matches2[0]) { answer += ""+matches2[0] + " нед."; d.myweek = plus+matches2[0]; };
                        }
                    if(title.indexOf("через нед")!=-1) { answer = "+ 1 нед."; d.myweek = plus+1 };
                    }
                if(title.indexOf("месяц")!=-1) //если указаны только месяцы
                    {
                    if(matches2)
                        {
                        answer = plus;
                        if(matches2[0]) { answer += ""+matches2[0] + " мес."; d.mymonth = plus+matches2[0]; };
                        }
                    if(title.indexOf("через мес")!=-1) { answer = "+ 1 мес."; d.mymonth = plus+1; };
                    }
                if( (title.indexOf(" год")!=-1) || (title.indexOf(" лет")!=-1) ) //если указаны только месяцы
                    {
                    if(matches2)
                        {
                        answer = plus;
                        if(matches2[0]) { answer += ""+matches2[0] + " год.";  d.myyears = plus+matches2[0]; };
                        }
                    if(title.indexOf("через год")!=-1) { answer = "+ 1 год.";  d.myyears = plus+1; };
                    }
        
                if( (title.indexOf(" день")!=-1) || (title.indexOf(" дня")!=-1) || (title.indexOf(" дней")!=-1) ) //если указаны только месяцы
                    {
                    if(matches2)
                        {
                        answer = plus;
                        if(matches2[0]) { answer += ""+matches2[0] + " дн."; d.mydays = plus+matches2[0]; };
                        }
                    if(title.indexOf("через год")!=-1) { answer = "+ 1 дн."; d.mydays = plus+1; };
                    }
            }
            
            if(mytime!="") {
                ///анализ времени
                shablon = /(в \d{1,2})|(в\d{1,2})|(\d{1,2}:\d{1,2})/g; 
                matches = mytime.toString().match(shablon);
                
                if((matches))
                    {
                    need_analyse = mytime.toString().match(/(в \d{1,2} в \d{1,2})|(\d{1,2} \d{1,2}м)|(\d{1,2}ч\d{1,2}м)|(\d{1,2}ч \d{1,2}м)|(\d{1,2}:\d{1,2})/g);
                    
                    shablon1 = /(в \d{1,2}:\d{1,2})|(в\d{1,2}:\d{1,2})/g; 
                    matches1 = mytime.toString().match(shablon1);
                    if(matches1) need_analyse=false;
                    
                    
                    if(!need_analyse)
                        {
                        mytime = mytime.toString().replace("в ","").replace("в","");
                        if(!matches1) mytime += ":00";
                        }
                    else
                        {
                        matches3 = mytime.toString().match(/\d{1,4}/g); //все двух-значные цифры
                        
                        if(matches3)
                            if(matches3.length==1) mytime = matches3;
                            else mytime = matches3.join(":");
                        }
                    }
            
            }
            
            if(mytime!="") var add = "[" + mytime+"]";
            else var add="";
            
            if( (mytime!="") )
                {
                
                if(mytime.toString().match(/\d{1,2}:\d{1,2}/g))
                    {
                    newtime = mytime.toString().split(":");
                    mydate.setHours(parseInt(newtime[0]),10 );
                    mydate.setMinutes(parseInt(newtime[1],10) );
                    mydate.setSeconds(0);
                    }
                else
                    {
                    mytime = "";
                    }
                
                }
            
            if(did) 
                {
                newdate.setHours( mydate.getHours() + parseInt(d.myhours,10) );
                newdate.setMinutes( mydate.getMinutes() + parseInt(d.myminutes,10) );
                newdate.setSeconds(0);
                mydate = newdate;
                }
            else
                {
                mydate.setHours( mydate.getHours() + parseInt(d.myhours,10) );
                mydate.setMinutes( mydate.getMinutes() + parseInt(d.myminutes,10) );
                mydate.setSeconds(0);
                }
            
            mydate.setDate( mydate.getDate() + parseInt(d.mydays,10) + parseInt(d.myweek*7,10));
            mydate.setMonth( mydate.getMonth() + parseInt(d.mymonth,10) );
            mydate.setYear( mydate.getFullYear() + parseInt(d.myyears,10) );
            
            shablon = /(понед)|(вторн)|(сред)|(четв)|(пятн)|(субб)|(воскр)/g; 
            matches = title.match(shablon);
            if(matches) {
                week = 0;
                if(matches[0]=="понед") week = 1;
                if(matches[0]=="вторн") week = 2;
                if(matches[0]=="сред") week = 3;
                if(matches[0]=="четв") week = 4;
                if(matches[0]=="пятн") week = 5;
                if(matches[0]=="субб") week = 6;
                if(matches[0]=="воскр") week = 7;
                if(week != 0) 
                    {
                    mydate = nextWeekDay(mydate,week);
                    answer = matches[0];
                    }
            }
            
            if((answer=="") && (mytime =="")) mydate = "";
            
            if(title.toLowerCase().indexOf("смс")!=-1 || 
               title.toLowerCase().indexOf("sms")!=-1 || 
               title.toLowerCase().indexOf("напомни")!=-1 ) {
                    var remind_time_default = localStorage.getItem("remind_time");
                    remind_time = remind_time_default?remind_time_default:15;           
                    add += " | <i class='icon-bell'></i> за "+remind_time+" м";
                    var sms = " | <i class='icon-bell'></i> за "+remind_time+" м";
            } else {
                var sms = "";
            }
            
            
            
            
            return {title:answer+" "+add,date:mydate, sms:sms};
            } //jsParseDate
            
          function nextWeekDay(date,day){ //поиск следующего дня недели
                (day = (Math.abs(+day || 0) % 7) - date.getDay()) < 0 && (day += 7);
                return day && date.setDate(date.getDate() + day), date;
          };
            
