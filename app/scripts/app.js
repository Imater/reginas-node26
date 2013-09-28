


angular.module('fpkApp', ["ngResource", "ngSanitize", "ngRoute", 'ui.redactor', 'ui.redactor.multi', 'ui.calendar', "ng", "infinite-scroll", "monospaced.elastic", 'route-segment', 'view-segment'])
    .config(function ($routeProvider, $locationProvider, $compileProvider, $routeSegmentProvider) {

//    $locationProvider.html5Mode(false).hashPrefix('!');
        $routeSegmentProvider.options.autoLoadTemplates = true;


        $routeSegmentProvider
            .when('/user/login', 'user.login')
            .when('/user/reg', 'user.reg')

            .when('/fpk', 's1')
            .when('/fpk/clients', 's1.clients')
            .when('/fpk/stat', 's1.stat')
            .when('/fpk/news', 's1.news')
            .when('/fpk/calendar', 's1.calendar')

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


function MainCtrl($scope, $routeSegment, myApi) {

    $scope.$routeSegment = $routeSegment;

    $scope.$on('routeSegmentChange', function () {
    });

    $scope.user_fio = "Login...";

    jsRefreshToken().done(function () {
        ///////////////////////////////////////////////
        myApi.loadUserInfo($scope).then(function(user){
          console.info(user,"user Loaded");
          $scope.the_user = user.user[0];
          $scope.brand = user.user[0].brand; //бренд по умолчанию
          $scope.managers = user.users; //список всех менеджеров

        });  
        ///////////////////////////////////////////////
        console.info("refresh_token_did");
        //загружаем таблицу моделей
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
         }); //getModels
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


