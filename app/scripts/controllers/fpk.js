'use strict';

var NO_DATE = '0000-00-00 00:00:00';


/*i18n.init({lng:"ru"},function(t) {
  // translate nav
  $("body").i18n();
  // programatical access
  // var appName = t("4tree");
});
*/
var myApp = angular.module('fpkApp');



myApp.directive('resizable', function () {
    return {
        //restrict: 'A',
        require: '?ngModel',
        link: function ($scope, $element, attrs, ngModel) {
            // view -> model
            $element.resizable({
                handles: "e"
            });

            var tm_resize;
            $element.on('resize', function (event, ui) {
                console.info("rezize", event, ui);
                clearTimeout(tm_resize);
                tm_resize = setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.fpk.left_panel_width = ui.size.width;
                        localStorage.setItem("left_panel_width", ui.size.width);
                    });

                }, 1);
            })
        }
    }
});

myApp.directive('resizablefull', function () {
    return {
        //restrict: 'A',
        require: '?ngModel',
        link: function ($scope, $element, attrs, ngModel) {
            // view -> model
            $element.resizable({
                handles: "e"
            });
            $element.draggable();

            $element.on('resize', function (event, ui) {});
        }
    }
});


myApp.directive('resizable2', function () {
    return {
        //restrict: 'A',
        require: '?ngModel',
        link: function ($scope, $element, attrs, ngModel) {
            // view -> model
            $element.resizable({
                handles: "w"
            });

            var tm_resize;
            $element.on('resize', function (event, ui) {
                console.info("rezize", event, ui);
                clearTimeout(tm_resize);
                tm_resize = setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.fpk.right_panel_width = ui.size.width;
                        localStorage.setItem("right_panel_width", ui.size.width);
                    });

                }, 1);
            })
        }
    }
});




myApp.directive('autoComplete', function ($timeout, myApi) {
    return function (scope, iElement, iAttrs) {
        iElement.autocomplete({
            delay: 500,
            source: function (request, response) {
                var searchtext = request.term;
                myApi.getAutocomplete(scope, searchtext).then(function (answer) {
                    var res = [];
                    $.each(answer, function (i, el) {

                        var title = el.fio + " (" + el.manager + ") " + el.short + "";

                        var phones = (el.phone1 ? el.phone1 : "") + (el.phone2 ? " ," + el.phone2 + "" : "") + (el.phone3 ? " ," + el.phone3 + "" : "") + (el.phone4 ? " ," + el.phone4 + ". " : ". ");

                        title = (phones + title).replace(searchtext, "<font color='red'>" + searchtext + "</font>");

                        res.push({
                            label: title,
                            value: el.phone1
                        })
                    });

                    response(res);
                });

                /*                        response( {
                          label: "HELLO",
                          value: "UPS"
                        } );
*/

                /*                  $.ajax({
                    url: "api/v1/autocomplete",
                    dataType: "jsonp",
                    data: {
                      featureClass: "P",
                      style: "full",
                      maxRows: 12,
                      name_startsWith: request.term,
                      brand: scope.fpk.brand
                    },
                    success: function( data ) {
                      response( $.map( data, function( item ) {
                        console.info("ANSWER = ",item);

                        return {
                          label: "HELLO",
                          value: "UPS"
                        }
                      }));
                    }
                  });
*/
            },
            select: function () {
                $timeout(function () {
                    iElement.trigger('input');
                }, 0);
            }
        });
    };
});



myApp.directive('contenteditable', ['$timeout',
    function ($timeout) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function ($scope, $element, attrs, ngModel) {
                // don't do anything unless this is actually bound to a model
                // view -> model
                if (!ngModel) return true;
                $element.bind('input', function (e) {
                    $scope.$apply(function () {
                        var html, html2, rerender;
                        html = $element.html();
                        rerender = false;
                        if (attrs.stripBr && attrs.stripBr !== "false") {
                            html = html.replace(/<br>$/, '');
                        }
                        if (attrs.noLineBreaks && attrs.noLineBreaks !== "false") {
                            html2 = html.replace(/<div>/g, '').replace(/<br>/g, '').replace(/<\/div>/g, '');
                            if (html2 !== html) {
                                rerender = true;
                                html = html2;
                            }
                        }
                        ngModel.$setViewValue(html);
                        //$scope.note.changetime = jsNow();

                        if (rerender) {
                            ngModel.$render();
                        }
                        if (html === '') {
                            // the cursor disappears if the contents is empty
                            // so we need to refocus
                            $timeout(function () {
                                $element.blur()
                                $element.focus()
                            })
                        }
                    });
                });

                // model -> view
                var oldRender = ngModel.$render;
                ngModel.$render = function () {
                    var el, el2, range, sel;
                    if ( !! oldRender) {
                        oldRender();
                    }
                    $element.html(ngModel.$viewValue || '');
                    if ($element.hasClass("div_editor")) {
                        el = $element.get(0);
                        range = document.createRange();
                        sel = window.getSelection();
                        if (el.childNodes.length > 0) {
                            el2 = el.childNodes[el.childNodes.length - 1];
                            range.setStartAfter(el2);
                        } else {
                            range.setStartAfter(el);
                        }
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
                if (attrs.selectNonEditable && attrs.selectNonEditable !== "false") {
                    $element.click(function (e) {
                        var range, sel, target;
                        target = e.toElement;
                        if (target !== this && angular.element(target).attr('contenteditable') === 'false') {
                            range = document.createRange();
                            sel = window.getSelection();
                            range.setStartBefore(target);
                            range.setEndAfter(target);
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    });
                }
            }
        }
    }
]);


myApp.directive('modelChangeBlur', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attr, ngModelCtrl) {
            if (attr.type === 'radio' || attr.type === 'checkbox') return;

            elm.unbind('input').unbind('keydown').unbind('change');
            elm.bind('blur', function () {
                scope.$apply(function () {
                    ngModelCtrl.$setViewValue(elm.val());
                });
            });
        }
    };
});

var jsDateDiff = _.memoize(function ($scope, dif_sec, date2) {
    var answer = {
        text: "&nbsp;",
        class: "",
        image: false
    };
    if (!date2) return answer;
    if (date2 == "0000-00-00 00:00:00") return answer;

    var days = parseInt(dif_sec / (60 * 1000 * 60 * 24), 10);
    var minutes = parseInt(dif_sec / (60 * 1000), 10);

    //if(days<500) return answer;


    if (days == 0) {
        if ((minutes > 59) || (minutes < -59)) {
            var hours = parseInt(dif_sec / (60 * 1000 * 60) * 10, 10) / 10;
            answer.text = ((minutes > 0) ? "+ " : "") + hours + " ч.";
        } else {
            answer.text = ((minutes > 0) ? "+ " : "") + minutes + " мин.";
        }

    } else {
        answer.text = ((days > 0) ? "+ " : "") + days + " дн.";
    }

    if (days == 0) {
        if (minutes < 0) {
            answer.class = "datetoday past";
            var pr2 = ((-minutes / 480)) * 100;
            if (pr2 > 80) pr2 = 80;
            answer.image = "-webkit-gradient(linear, left top, right top, color-stop(" + pr2 + "%, #990000), color-stop(" + (pr2 + 10) + "%, #da5700))";
            //"-webkit-gradient(linear, right top, left top, color-stop("+pr+", #da5700), color-stop("+(pr+0.1)+", #990000));";
            //"-webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #333), color-stop(100%, #222))"
        }
        if (minutes >= 0) answer.class = "datetoday";


    } else if (minutes < 0) {
        answer.class = "datepast";
    }

    return answer;
}, function ($scope, dif_sec, date2) {
    return $scope + date2 + dif_sec + ($scope.client ? $scope.client.out : "") + ($scope.client ? $scope.client.dg : "");
});


myApp.directive('datemini', ['$timeout',
    function ($timeout) {
        return {
            restrict: 'C',
            require: '?ngModel',
            link: function ($scope, $element, attrs, ngModel) {
                // don't do anything unless this is actually bound to a model
                // view -> model
                //ngModel.$viewValue.html("+3дн");
                $scope.$watch("fpk.time_now", function () {
                    ngModel.$render();
                });
                ngModel.$render = function () {
                    var date2 = ngModel.$viewValue;

                    var time_now = $scope.fpk.time_now ? $scope.fpk.time_now : new Date();

                    var date1 = new Date((time_now).getTime() - 1 * 60000);
                    var date22 = fromMysql(date2);
                    var dif_sec = date22.getTime() - date1.getTime();


                    var answer = jsDateDiff($scope, dif_sec, date2);
                    if (attrs.dateType == "client") {
                        if (($scope.client) && ($scope.client.out != NO_DATE)) {
                            answer.text = "OUT";
                            answer.class = "date_out";
                        }
                        if (($scope.client) && (($scope.client.out != NO_DATE) && ($scope.client.out != "")) && ($scope.client.dg != NO_DATE)) {
                            answer.text = "РАСТОРГ";
                            answer.class = "date_rastorg";
                        }
                    }
                    $element.html(answer.text || '').removeClass("past").removeClass("datetoday").removeClass("datepast").addClass(answer.class);
                    $element.css("background-image", answer.image ? answer.image : "none;");
                    if (!answer.image) $element.attr("style", "");
                    //.css({"background":answer.image});

                }
            }

        }
    }
]);



myApp.factory('socket', function ($rootScope, $timeout) {

    //  io.configure(function () { 
    //  io.set("transports", ["xhr-polling"]); 
    //  io.set("polling duration", 10); 
    //  });
    var socket = io.connect(undefined, {
        'connect timeout': 3000
    });
    console.info("connect...");

    /*  var globalEvent = "*";
  socket.$emit = function (name) {
      if(!this.$events) return false;
      for(var i=0;i<2;++i){
          if(i==0 && name==globalEvent) continue;
          var args = Array.prototype.slice.call(arguments, 1-i);
          var handler = this.$events[i==0?name:globalEvent];
          if(!handler) handler = [];
          if ('function' == typeof handler) handler.apply(this, args);
          else if (io.util.isArray(handler)) {
              var listeners = handler.slice();
              for (var i=0, l=listeners.length; i<l; i++)
                  listeners[i].apply(this, args);
          } else return false;
      }
      return true;
  };
  socket.on(globalEvent,function(event){
      var args = Array.prototype.slice.call(arguments, 1);
      console.log("Global Event = "+event+"; Arguments = "+JSON.stringify(args));
  });
*/
    return {
        on: function (eventName, callback) {
            socket.on('disconect', function () {
                console.info("server off");
                $timeout(function () {
                    $rootScope.jsSetOnline(false);
                }, 1)
            });
            socket.on('connect', function () {
                if ($rootScope.jsStartSync) $rootScope.jsStartSync();
                $timeout(function () {
                    $rootScope.jsSetOnline(true);
                }, 1);


            });
            socket.on('EMAIL', function () {
                alert("NEW MAIL");
                console.info("NEW EMAIL.");
            });
            socket.on(eventName, function () {
                var args = arguments;
                //console.info("on=",socket, eventName);
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});

myApp.filter('jsTestFilter', function () {
    return _.memoize( function (tests, brand) {

        var answer = _.filter(tests, function(test){
          return (test['brand'] == brand)&&(test.hide != 1);
        });
        return answer;
    }, function(tests, brand){ return brand; });
});


myApp.filter('jsFilterDo', function () {
    return function (dts, stat_big_view_switch, group_by) {
        if(stat_big_view_switch == 'all') return dts;

        var answer = _.filter(dts, function(dt){
          return (dt['typ'] == stat_big_view_switch);
        });
        return answer;
    }
});


myApp.filter('jsFilterClients', function () {
    return function (clients, distinct, group_by) {
        console.info(777);
        var answer = _.filter(clients, function (client) {

            if ((group_by == 'manager') && (client.manager == distinct.manager)) return true;

            if ((group_by == 'vd') && (client.vd.indexOf(distinct.vd.substr(0, 7)) != -1)) return true;


            if ((group_by == 'creditmanager') && (client.creditmanager == distinct.creditmanager)) return true;

            if ((group_by == 'model') && (client.model == distinct.model)) return true;
            //if ((client.manager == distinct.manager)) return true;


        });
        return answer;
    }
});


myApp.filter('nicetime', function () {
    return function (the_date) {
        if (the_date) {
            var ds = the_date.split(" ")[1].split(":");
            return ds[0] + ":" + ds[1];
        }

    }
});



myApp.filter('nicedate', function () {
    return function (the_date) {
        if (the_date) {
            var ds = the_date.split("-");
            return ds[2] + "." + ds[1] + "." + ds[0];
        }

    }
});

myApp.filter('nicedatetime', function () {
    return function (the_date) {
        if (the_date) {
            var ds = the_date.split("-");
            var dt = ds[2].split(" ");

            var dif_days = parseInt((jsNow() - (fromMysql(the_date).getTime())) / 1000 / 60 / 60 / 24);

            if (dif_days > 1000) dif_days = "";
            else dif_days += " дн.назад"


                return dt[0] + "." + ds[1] + "." + ds[0] + " — " + dt[1].substr(0, 5) + ' (' + dif_days + ')';
        }

    }
});

myApp.filter('parent_id', function () {
    return function (input, uppercase) {
        return input;
    }
});

var lastRoute;


myApp.directive('eatClick', function () {
    return function (scope, element, attrs) {
        $(element).click(function (event) {
            event.preventDefault();
        });
    }
})


myApp.directive('returnOnBlur', function () {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            console.info("bluer", $(elm));

            var old_index, mydoid;
            var index_cache = {};

            elm.on("keydown", function () {
                old_index = $(this).parents("li:first").index();
                mydoid = $(this).parents("li:first").attr("mydoid");
            });

            elm.bind("blur", function () {
                console.info("blur!", scope.$parent.$index);
                var old_this = this;
                setTimeout(function () {
                    var new_index = $("li[mydoid='" + mydoid + "']").index();
                    if (old_index != new_index) {
                        $("li[mydoid='" + mydoid + "'] .do_text_input").focus();
                    }

                }, 0);
                setTimeout(function () {
                    var new_index = $("li[mydoid='" + mydoid + "']").index();
                    if (old_index != new_index) {
                        $("li[mydoid='" + mydoid + "'] .do_text_input").focus();
                    }

                }, 600);
            });

            //elm.datetimeEntry('setDatetime', scope.onChange);

        }
    };

});

myApp.directive('dateTimeEntry', function () {
    return {
        restrict: 'A',
        scope: {
            'dateTimeEntry': '=',
            'iamdisabled': '='
        },
        link: function (scope, elm, attrs) {
            scope.$watch('dateTimeEntry', function (nVal) {
                nVal = fromMysql(nVal);
                elm.datetimeEntry('setDatetime', nVal);
            });

            var old_index, mydoid;
            var index_cache = {};

            elm.on("keydown", function () {
                old_index = $(this).parents("li:first").index();
                mydoid = $(this).parents("li:first").attr("mydoid");
            });

            elm.datetimeEntry().change(function () {

                var currentValue = toMysql(elm.datetimeEntry('getDatetime'));

                if (scope.dateTimeEntry !== currentValue) {
                    scope.dateTimeEntry = currentValue;
                    if (!scope.$$phase && !scope.$root.$$phase) {
                        scope.$apply();
                    }
                }
            }).keydown(function () {}).blur(function () {
                console.info("blur!", scope.$parent.$index);
                var old_this = this;
                setTimeout(function () {
                    var new_index = $("li[mydoid='" + mydoid + "']").index();
                    if (old_index != new_index) {
                        $("li[mydoid='" + mydoid + "'] .do_date2").focus();
                    }

                }, 0);
                setTimeout(function () {
                    var new_index = $("li[mydoid='" + mydoid + "']").index();
                    if (old_index != new_index) {
                        $("li[mydoid='" + mydoid + "'] .do_date2").focus();
                    }

                }, 600);
            });

            if (scope['iamdisabled']) elm.datetimeEntry('disable');

            //elm.datetimeEntry('setDatetime', scope.onChange);

        }
    };
});



myApp.directive('collection', function () {
    return {
        restrict: "E",
        replace: true,
        templateUrl: "views/tree_li.html"
    };

});

myApp.filter('slice', function () {
    return function (arr, start, end) {
        return arr.slice(start, end);
    };
});

myApp.filter('onlyManager', function () {
    return function (managers, isTrue) {
        var answer = _.filter(managers, function (el) {
            if (isTrue && (el.user_group == 6 || el.user_group == 5)) return true;
            if (!isTrue && el.user_group != 6 && el.user_group != 5) return true;
        })
        return answer;
    };
});

myApp.directive('datepicker2', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                element.datepicker({
                    dateFormat: 'dd.mm.yy',
                    showOtherMonths: true,
                    selectOtherMonths: true,
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
            scope.$on('$destroy', function () {});
        }
    }
});


myApp.directive('datepicker', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                element.datepicker({
                    dateFormat: 'yy-mm-dd',
                    showOtherMonths: true,
                    selectOtherMonths: true,
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
            scope.$watch("fpk.today_date", function () {
                element.datepicker('setDate', scope.fpk.today_date);
            });
            scope.$on('$destroy', function () {});
        }
    }
});

myApp.directive('slideToggle', function () {
    return {
        restrict: 'A',
        scope: {
            isOpen: "=slideToggle",
            client: "@",
            clients: "@"
        },
        link: function (scope, element, attr) {
            var slideDuration = parseInt(attr.slideToggleDuration, 10) || 200;
            scope.$watch('isOpen', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    element.stop().slideToggle(slideDuration);
                }
            });
        }
    };
});

myApp.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});

myApp.factory('myApi', function ($http, $q, oAuth2) {
    return {
        jsLoadOrganizationsFromServer: function ($scope) {
            var dfd = $q.defer();
            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/organizations',
                    method: "GET",
                    params: {
                        token: token,
                        brand: $scope.fpk.brand
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });
            return dfd.promise;

        },
        jsGetManagerCupAdmin: function ($scope, searchtext) {
            var dfd = $q.defer();
            $http({
                url: '/api/v1/stat/admin_cup/managers',
                method: "GET",
                params: {
                    brand: $scope.fpk.brand,
                    today: $scope.fpk.today_date
                }
            }).then(function (result) {
                dfd.resolve(result.data);
            });

            return dfd.promise;
        },
        jsGetManagerCupAdminReport: function ($scope, searchtext) {
            var dfd = $q.defer();
            $http({
                url: '/api/v1/stat/admin_cup/managers_report',
                method: "GET",
                params: {
                    brand: $scope.fpk.brand,
                    today: $scope.fpk.today_date,
                    manager_filter: $scope.fpk.manager_filter
                }
            }).then(function (result) {
                dfd.resolve(result.data);
            });

            return dfd.promise;
        },
        getAutocomplete: function ($scope, searchtext) {
            var dfd = $q.defer();
            $http({
                url: '/api/v1/autocomplete',
                method: "GET",
                params: {
                    brand: $scope.fpk.brand,
                    searchtext: searchtext
                }
            }).then(function (result) {
                dfd.resolve(result.data);
            });

            return dfd.promise;
        },
        getDo: function ($scope, id) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/do/' + id,
                    method: "GET",
                    params: {
                        token: token
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;
        },
        getDoToday: function ($scope) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/do',
                    method: "GET",
                    params: {
                        token: token,
                        brand: $scope.fpk.brand,
                        manager: $scope.fpk.manager_filter,
                        left_menu: $scope.fpk.leftmenu ? $scope.fpk.leftmenu.active : '',
                        cal_type: $scope.fpk.cal_type
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;
        },
        getClient: function ($scope, filter, ids) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/client',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        filter: filter,
                        manager: $scope.fpk.manager_filter,
                        ids: ids
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;
        },
        getClientIds: function ($scope, ids) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/client_ids',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        manager: $scope.fpk.manager_filter,
                        ids: ids
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;
        },
        getAdminIds: function ($scope, ids) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/admin_ids',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        manager: $scope.fpk.manager_filter,
                        ids: ids
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;
        },
        getClientFull: function ($scope, client_id) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/client/' + client_id,
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        manager: $scope.fpk.manager_filter
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;
        },
        jsNewClient: function ($scope, add_do_array) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/client',
                    method: "POST",
                    isArray: true,
                    params: {
                        token: token,
                        manager: $scope.fpk.manager_filter,
                        brand: $scope.fpk.brand,
                        add_do_array: add_do_array
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;
        },
        getStat: function ($scope) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                var filters = $scope.fpk.leftmenu;

                $http({
                    url: '/api/v1/stat',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        filters: filters,
                        brand: $scope.fpk.brand,
                        manager: $scope.fpk.manager_filter,
                        today: $scope.fpk.today_date
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;

        },
        getTableStat: function ($scope) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/stat_table',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        brand: $scope.fpk.brand,
                        manager: $scope.fpk.manager_filter
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;

        },

        searchString: function ($scope, searchstring) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/search',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        search: searchstring,
                        brand: $scope.fpk.brand
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;

        },
        getDoCalendar: function ($scope, start_date, end_date, calendar_do_type) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                var filters = $scope.fpk.leftmenu;

                $http({
                    url: '/api/v1/calendar',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        start_date: start_date,
                        end_date: end_date,
                        brand: $scope.fpk.brand,
                        manager: $scope.fpk.manager_filter,
                        calendar_do_type: calendar_do_type
                    }
                }).then(function (result) {
                    console.info(result);
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;

        },
        getClientsByDoType: function ($scope, type_do, today) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/do_by_type',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        type_do: type_do,
                        brand: $scope.fpk.brand,
                        today: today
                    }
                }).then(function (result) {
                    console.info("DO RECIVED: ", result.data);
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;


        },
        getClientsDay: function ($scope) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/stat/cup/day',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        today: $scope.fpk.today_date,
                        brand: $scope.fpk.brand,
                        manager: $scope.fpk.manager_filter
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;


        },
        getReiting: function ($scope) {
            var dfd = $q.defer();

            var days = $scope.days;

            var start_today = toMysql(new Date((new Date(fromMysql($scope.fpk.today_date))).getTime() - 24 * 60 * 60 * 1000 * days));

            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/reiting',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        start_today: start_today,
                        today: $scope.fpk.today_date,
                        brand: $scope.fpk.brand,
                        manager: $scope.fpk.manager_filter
                    }
                }).then(function (result) {
                    console.info("REITING RECIVED: ", result.data);
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;


        },
        getClientsAllDay: function ($scope) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/stat/cup/all_day',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        today: $scope.fpk.today_date,
                        brand: $scope.fpk.brand,
                        manager: $scope.fpk.manager_filter
                    }
                }).then(function (result) {
                    console.info("CLIENTS RECIVED: ", result.data);
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;


        },
        addDo: function ($scope, do_type, client_id) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/do',
                    method: "POST",
                    isArray: true,
                    params: {
                        token: token,
                        do_type: do_type,
                        brand: $scope.fpk.brand,
                        client_id: client_id,
                        manager: $scope.fpk.manager_filter
                    }
                }).then(function (result) {
                    console.info("DO NEW: ", result.data);
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;


        },
        saveClient: function ($scope, changes, client_id) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/client/' + changes.id,
                    method: "PUT",
                    isArray: true,
                    data: {
                        changes: changes
                    },
                    params: {
                        token: token,
                        brand: $scope.fpk.brand,
                        client_id: client_id
                    }
                }).then(function (result) {
                    console.info("DO SAVED: ", result.data);
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;


        },
        addAdmin: function ($scope, manager_id, do_type) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/admin',
                    method: "POST",
                    isArray: true,
                    params: {
                        token: token,
                        do_type: do_type,
                        brand: $scope.fpk.brand,
                        manager_id: manager_id,
                        manager: $scope.fpk.manager_filter,
                        today: $scope.fpk.today_date
                    }
                }).then(function (result) {
                    console.info("DO NEW: ", result.data);
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;


        },
        saveAdmin: function ($scope, changes) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/admin/' + changes.id,
                    method: "PUT",
                    isArray: true,
                    data: {
                        changes: changes
                    },
                    params: {
                        token: token,
                        brand: $scope.fpk.brand
                    }
                }).then(function (result) {
                    console.info("ADMIN SAVED: ", result.data);
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;


        },
        deleteClient: function ($scope, client_id) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/client/' + client_id,
                    method: "DELETE",
                    isArray: true,
                    params: {
                        token: token,
                        client_id: client_id,
                        brand: $scope.fpk.brand
                    }
                }).then(function (result) {
                    console.info("CLIENT DELETE: ", result.data);
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;


        },
        deleteAdmin: function ($scope, mydo_id) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/admin/' + mydo_id,
                    method: "DELETE",
                    isArray: true,
                    params: {
                        token: token,
                        mydo_id: mydo_id,
                        brand: $scope.fpk.brand
                    }
                }).then(function (result) {
                    console.info("ADMIN DELETE: ", result.data);
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;


        },
        deleteDo: function ($scope, do_id) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/do/' + do_id,
                    method: "DELETE",
                    isArray: true,
                    params: {
                        token: token,
                        do_id: do_id,
                        brand: $scope.fpk.brand
                    }
                }).then(function (result) {
                    console.info("DO DELETE: ", result.data);
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;


        },
        regNewUser: function ($scope) {
            var dfd = $q.defer();
            var reg_user = angular.copy($scope.reg_user);

            reg_user.password = hex_md5(reg_user.password);
            reg_user.password2 = hex_md5(reg_user.password + "990990");
            reg_user.md5email = hex_md5(reg_user.email.toLowerCase() + "990990");

            $http({
                url: '/api/v1/user/new',
                method: "POST",
                isArray: true,
                data: {
                    reg_user: reg_user
                }
            }).then(function (result) {
                console.info("NEW USER: ", result.data);
                dfd.resolve(result.data);
            });

            return dfd.promise;


        },
        getModels: function ($scope) {
            var dfd = $q.defer();

            $http({
                url: '/api/v1/models',
                method: "GET",
                isArray: true,
                params: {
                    brand: $scope.fpk.brand
                }
            }).then(function (result) {
                dfd.resolve(result.data);
            });

            return dfd.promise;

        },
        newModel: function ($scope) {
            var dfd = $q.defer();
            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/models',
                    method: "POST",
                    isArray: true,
                    params: {
                        token: token,
                        brand: $scope.fpk.brand
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });

            });
            return dfd.promise;
        },
        saveModel: function ($scope, changes, model_id) {
            var dfd = $q.defer();
            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/models',
                    method: "PUT",
                    isArray: true,
                    data: {
                        changes: changes
                    },
                    params: {
                        token: token,
                        brand: $scope.fpk.brand,
                        model_id: model_id
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });

            });
            return dfd.promise;
        },

        deleteModel: function ($scope, del_id) {
            var dfd = $q.defer();
            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/models',
                    method: "DELETE",
                    isArray: true,
                    params: {
                        del_id: del_id,
                        token: token,
                        brand: $scope.fpk.brand
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });

            });
            return dfd.promise;
        },
        jsSaveOrg: function ($scope, test) {
            var dfd = $q.defer();
            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/organizations',
                    method: "PUT",
                    isArray: true,
                    data: {
                        test: test
                    },
                    params: {
                        token: token,
                        brand: $scope.fpk.brand
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });

            });
            return dfd.promise;
        },
        jsSaveTest: function ($scope, test) {
            var dfd = $q.defer();
            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/test',
                    method: "PUT",
                    isArray: true,
                    data: {
                        test: test
                    },
                    params: {
                        token: token,
                        brand: $scope.fpk.brand
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });

            });
            return dfd.promise;
        },
        jsDeleteTest: function ($scope, test) {
            var dfd = $q.defer();
            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/test',
                    method: "DELETE",
                    isArray: true,
                    data: {
                        test: test
                    },
                    params: {
                        token: token,
                        brand: $scope.fpk.brand,
                        id: test.id
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });

            });
            return dfd.promise;
        },
        jsNewTest: function ($scope) {
            var dfd = $q.defer();
            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/test',
                    method: "POST",
                    isArray: true,
                    params: {
                        token: token,
                        brand: $scope.fpk.brand
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });

            });
            return dfd.promise;
        },
        jsNewOrganization: function ($scope) {
            var dfd = $q.defer();
            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/organizations',
                    method: "POST",
                    isArray: true,
                    params: {
                        token: token,
                        brand: $scope.fpk.brand
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });

            });
            return dfd.promise;
        },
        jsDeleteOrganization: function ($scope, test) {
            var dfd = $q.defer();
            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/organizations',
                    method: "DELETE",
                    isArray: true,
                    data: {
                        test: test
                    },
                    params: {
                        token: token,
                        brand: $scope.fpk.brand,
                        id: test.id
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });

            });
            return dfd.promise;
        },
        getCUP: function ($scope) {
            var dfd = $q.defer();
            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/stat/cup',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        brand: $scope.fpk.brand,
                        today_date: $scope.fpk.today_date
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;

        },
        getCUPcars: function ($scope, brand_id, do_type, today) {
            var dfd = $q.defer();
            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/stat/cup/cars',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        brand: brand_id,
                        today_date: today,
                        do_type: do_type
                    }
                }).then(function (result) {
                    console.info("STAT_CARS: ", result.data.length);
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;

        },
        saveDo: function ($scope, changes, client_id) {
            var dfd = $q.defer();

            oAuth2.jsGetToken($scope).done(function (token) {

                $http({
                    url: '/api/v1/do/' + changes.id,
                    method: "PUT",
                    isArray: true,
                    params: {
                        token: token,
                        changes: changes,
                        brand: $scope.fpk.brand,
                        client_id: client_id
                    }
                }).then(function (result) {
                    console.info("DO SAVED: ", result.data);

                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;


        },
        loadUserInfo: function ($scope) {
            var dfd = $q.defer();
            oAuth2.jsGetToken($scope).done(function (token) {
                $http({
                    url: '/api/v1/user/info',
                    method: "GET",
                    isArray: true,
                    params: {
                        token: token,
                        brand: $scope.fpk.brand
                    }
                }).then(function (result) {
                    dfd.resolve(result.data);
                });
            });

            return dfd.promise;

        }


    }
});
////////////////////////////////////////////


var bootstrap_alert = function () {};

bootstrap_alert.warning = function (message) {
    $('#alert_placeholder').html('<div class="alert alert-warning"><a class="close" data-dismiss="alert">×</a><span>' + message + '</span></div>')
}

$('#clickme').on('click', function () {
    bootstrap_alert.warning('Your text goes here');
});


var tm_change;
myApp.directive('colorChange', function () {
    return {
        link: function (scope, element, attrs) {

            function jsMove() {
                clearTimeout(tm_change);
                tm_change = setTimeout(function () {
                    document.title = "ФПК (" + scope.fpk.the_user.fio.split(" ")[1] + " " + scope.fpk.the_user.fio.split(" ")[0][0] + ".) — " + diller.holding_name;

                    $('body').off(".my").off(".my1").off("touchstart");
                    $(".changed").removeClass("changed");
                }, 50);
            }

            scope.$watch(attrs.colorChange, function (Val, newVal) {
                if (Val != newVal) {
                    document.title = "* ФПК (" + scope.fpk.the_user.fio.split(" ")[1] + " " + scope.fpk.the_user.fio.split(" ")[0][0] + ".) — " + diller.holding_name;

                    if (element.hasClass("changed")) {
                        element.removeClass("changed");
                        setTimeout(function () {
                            element.addClass("changed");
                        }, 1500);
                    } else {
                        element.addClass("changed");
                    }


                    $('body').on("mousemove.my", jsMove);
                    $('body').on("click.my1", jsMove);
                    $('body').on("touchstart", jsMove);
                }


            }, true);

        }
    };
});


///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
var LIST_LENGTH = 100; //кол-во загружаемых клиентов за один раз


myApp.controller('fpkCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams, myApi, $routeSegment, $timeout, $filter) {

    $scope.fpk.today_date = toMysql((new Date())).substr(0, 10);

    $scope.fpk.jsLoadStat = function () {
        if ($scope.fpk.brand) {
            myApi.getStat($scope).then(function (result) {
                $scope.fpk.stat = result.left_stat;
                $scope.fpk.cup_sms = result.sms;
                var dogovors = _.find(result.sms, function(el){ return el.type=="dg" }).day;
                Tinycon.setBubble( dogovors );

            });
        }
    }

    $scope.fpk.hostcheck = function (client) {
        if ($scope.fpk.the_user.rights[0].can_hostcheck) {
            console.info(client.hostchecked);
            if (client.hostchecked == '0000-00-00 00:00:00') {
                client.hostchecked = toMysql(new Date());
                client.hostchecked_id = $scope.fpk.jsFioShort($scope.fpk.the_user.fio, 'name');
            } else {
                client.hostchecked = "0000-00-00 00:00:00";
                client.hostchecked_id = "";
            }
        } else {
            alert('Только руководитель может пометить карточку клиента как проверенную.');
        }
    }

    $scope.fpk.jsDoReadOnly = function (mydo) {
        var dif_days = parseInt((jsNow() - (fromMysql(mydo.created).getTime())) / 1000 / 60 / 60 / 24);

        var compare = (dif_days >= 2);

        if ($scope.fpk.the_user.rights[0].can_edit_all_client) compare = false;

        if (mydo['type'] == "Выдача") compare = false;

        return compare;
    }

    $scope.fpk.jsCanDeleteClient = function (client) {
        var dif_days = parseInt((jsNow() - (fromMysql(client.date).getTime())) / 1000 / 60 / 60 / 24);

        var compare = (dif_days <= 2);

        if ($scope.fpk.the_user.rights[0].can_edit_all_client) compare = (dif_days <= 45);
        return compare;
    }

    $scope.fpk.jsShowClientIds = function (my_ids) {

        myApi.getClientIds($scope, my_ids).then(function (clients) {
            //console.info("ids:",clients);
            $scope.fpk.one_client = clients;
            $scope.fpk.show_one_client = true;
        });

    }

    $scope.fpk.jsShowAdminIds = function (my_ids) {
        myApi.getAdminIds($scope, my_ids).then(function (clients) {
            //console.info("ids:",clients);
            $scope.fpk.one_admin = clients;
            $scope.fpk.show_one_client = true;
        });

    }


    if ($scope.fpk.jsLoadStat) $scope.fpk.jsLoadStat();


    $scope.fpk.jsShowClientIds = function (my_ids) {

        myApi.getClientIds($scope, my_ids).then(function (clients) {
            //console.info("ids:",clients);
            $scope.fpk.one_client = clients;
            $scope.fpk.show_one_client = true;
        });

    }

    $scope.fpk.jsDubTitle = function (dub) {
        if (dub.brand_id == $scope.fpk.brand) dub.brand_title += " (у нас)";
        var t = dub.brand_title + '\n' +
            'клиент: ' + dub.fio + '\n' +
            'модель: ' + dub.model + '\n' +
            'менеджер: [' + dub.manager_fio + ']\n';

        t += (dub.zv != NO_DATE) ? ("Звонок: " + $filter('nicedatetime')(dub.zv) + "\n") : "";
        t += (dub.vz != NO_DATE) ? ("Визит: " + $filter('nicedatetime')(dub.vz) + "\n") : "";
        t += (dub.tst != NO_DATE) ? ("Тест: " + $filter('nicedatetime')(dub.tst) + "\n") : "";
        t += (dub.dg != NO_DATE) ? ("Договор: " + $filter('nicedatetime')(dub.dg) + "\n") : "";
        t += (dub.vd != NO_DATE) ? ("Выдача: " + $filter('nicedatetime')(dub.vd) + "\n") : "";
        t += (dub.out != NO_DATE) ? ("OUT: " + $filter('nicedatetime')(dub.out) + "\n") : "";

        return t;
    }

    $scope.fpk.jsCanShowBrand = _.memoize(function (brand) {
        if (brand == 0) return true;
        //проверяем права пользователя для ограниченного РОП
        if ($scope.fpk.the_user.rights[0].brands_all == '["-"]')
            if (($scope.fpk.the_user.rights[0].brands.indexOf(parseInt(brand)) == -1) && (parseInt(brand) != $scope.fpk.the_user.brand)) {
                return false;
            } else {
                return true;
            }
        return true;

    });


    var brands_cache = "";

    $scope.jsGetBrands = function () { //определяет, какие бренды доступны

        if (!$scope.fpk.brands) return false;

        if (brands_cache != "") {
            return brands_cache;
        }


        var allow_brands = $scope.fpk.the_user.rights[0].brands;
        //console.info("!!!",allow_brands, $scope.fpk.the_user.rights[0].brands_all);
        if (allow_brands.length == 0) {
            allow_brands = "[" + $scope.fpk.brand + "]";
        }

        var brands = [];

        if (!allow_brands.length) {
            brands = _.find($scope.fpk.brands, function (brand) {
                brand.id == $scope.fpk.the_user.brand;
            });
        } else if (allow_brands.indexOf("*") != -1) {
            brands = $scope.fpk.brands;
        } else if (allow_brands.indexOf("-") != -1) {
            brands = _.filter($scope.fpk.brands, function (brand) {
                return ((allow_brands.indexOf(brand.id) != -1) || (brand.id == $scope.fpk.the_user.brand));
            });
        } else if (true) {
            brands = _.filter($scope.fpk.brands, function (brand) {
                return (allow_brands.indexOf(brand.id) != -1);
            });
        }
        brands = _.sortBy(brands, function (brand) {
            return brand.brand_group + brand.title;
        });
        brands_cache = brands;
        return brands;
        //$scope.fpk.the_user.rights[0].brands  
    }


    $scope.fpk.jsCanEditClient = function (client) {
        var can_edit_all_client = $scope.fpk.the_user.rights[0].can_edit_all_client;

        if (can_edit_all_client ||
            (client.manager_id == $scope.fpk.the_user.id)
        ) {
            return true; //редактировать можно
        } else {
            return false; //редактировать нельзя
        }

    }

    $scope.fpk.jsCanEditDo = function (client, mydo) {
        var can_edit_all_client = $scope.fpk.the_user.rights[0].can_edit_all_client;

        if (can_edit_all_client ||
            ((mydo.manager_id == $scope.fpk.the_user.id) || (mydo.host_id == $scope.fpk.the_user.id)) ||
            (client.manager_id == $scope.fpk.the_user.id)
        ) {

            if ((mydo.checked != "0000-00-00 00:00:00") && (can_edit_all_client != 1)) {
                var dif_days = ((jsNow() - (fromMysql(mydo.checked).getTime())) / 1000 / 60 / 60 / 24);
                if (dif_days > 3) {
                    if (mydo['type'] != 'OUT') return false;
                }
            }

            return true; //редактировать дело можно
        } else {
            return false; //редактировать дело нельзя
        }

    }


    socket.on("sendmessage", function (text) {
        console.info(text)
        alert(text.data);
    })

    var my_tm;
    socket.on("loadstat", function (msg) {
        $timeout.cancel(my_tm);
        my_tm = $timeout(function () {
            if (parseInt(msg.brand) == $scope.fpk.brand) {
                $scope.fpk.jsLoadStat();
            } else {}
            $rootScope.$broadcast("loadstat");
        }, 50 + parseInt(Math.random() * 60));
    });


    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        console.info("list_finish");
        //you also get the actual event object
        //do stuff, execute functions -- whatever...
    });

    $scope.$routeSegment = $routeSegment;


    $scope.getSMS = function (sms) {
        if (!$scope.fpk.inside) {
            alert("Вам недоступна статистика, вы зашли из интернета");
            return false;
        }
        //sms.do_type;
        if ($scope.sms_active == sms) {
            var today = $scope.fpk.today_date.substr(0, 7);
        } else {
            var today = $scope.fpk.today_date;
        }
        $scope.sms_active = sms;
        var type_do = sms.type;

        myApi.getClientsByDoType($scope, type_do, today).then(function (answer) {
            console.info("sns", sms);

            if (["dg", "vd", "out", "zv", "vz", "tst"].indexOf(sms.type) != -1) {
                answer = _.sortBy(answer, function (client) {
                    return client.model
                });
                $scope.fpk.clientsgroupby_one = "model";
            } else if (sms.type == "vd_plan") {
                answer = _.sortBy(answer, function (client) {
                    return -client.icon2
                });
                $scope.fpk.clientsgroupby_one = "icon2";
            }

            $scope.fpk.one_client = answer;
            $scope.fpk.show_one_client = true;
        });

    }


    $scope.fpk.jsFindInArray = _.memoize(function (myarray, fieldname, myid) {

        var answer = _.find(myarray, function (com) {
            if (com[fieldname]) {
                return (com[fieldname] == myid);
            }
        });
        return answer;


    }, function (a, b, c) {
        return a + b + c;
    });

    $scope.fpk.jsShowManagerFilter = function () {
        if ($scope.fpk.manager_filter == -1) {
            return "Все менеджеры";
        } else {
            var the_manager = _.find($scope.fpk.managers, function (manager) {
                return (manager.id == $scope.fpk.manager_filter);
            });
            if (the_manager) return the_manager.fio_short_name;
        }
    }

    $scope.fpk.jsShowManagerFilterReiting = function () {


        if ($scope.fpk.manager_filter == -1) {
            return {
                step: "",
                reiting_procent: 0
            };
        } else {
            var the_manager = _.find($scope.fpk.managers, function (manager) {
                return (manager.id == $scope.fpk.manager_filter);
            });

            if (the_manager) return {
                step: the_manager.reiting_step,
                reiting_procent: the_manager.reiting_procent
            };
        }
    }


    $scope.fpk.do_types = [ //типы дел
        {
            img: "1zvonok.png",
            title: "Звонок",
            fieldname: "zv"
        }, {
            img: "1zvonok2.png",
            title: "Звонок исходящий",
            fieldname: "zv_out"
        }, {
            img: "1vizit.png",
            title: "Визит",
            fieldname: "vz"
        }, {
            img: "1test-drive.png",
            title: "Тест-драйв",
            fieldname: "tst"
        }, {
            img: "1com.png",
            title: "Ком.предложение",
            fieldname: "com"
        }, {
            img: "1credit.png",
            title: "Кредит"
        }, {
            img: "1dogovor.png",
            title: "Договор",
            fieldname: "dg"
        }, {
            img: "1settings.png",
            title: "Подготовка"
        }, {
            img: "1vidacha.png",
            title: "Выдача",
            fieldname: "vd"
        }, {
            img: "1bu.png",
            title: "Трейд-ин",
            fieldname: "bu"
        }, {
            img: "1out.png",
            title: "OUT",
            fieldname: "out"
        },
    ];

    $scope.fpk.cal_type = 'all_do';

    var tmp_status = {};
    $.each($scope.fpk.do_types, function (i, dt) {
        tmp_status[dt.title] = dt;
    });
    $scope.fpk.do_types_array = tmp_status;


    var statuses = [ //статусы нахождения автомобилей
        {
            title: "+ Наличие",
            procent: 0
        }, {
            title: "1 - Транзит от поставщика",
            procent: 0.25
        }, {
            title: "2 - У поставщика",
            procent: 0.50
        }, {
            title: "3 - Транзит к поставщику",
            procent: 0.60
        }, {
            title: "4 - Производство",
            procent: 0.70
        }, {
            title: "5 - Виртуальный",
            procent: 0.90
        }, {
            title: "? - Неизвестно",
            procent: 0.95
        }
    ];
    var tmp_status = {};

    $.each(statuses, function (i, st) {
        tmp_status[st.title] = st;
    });

    $scope.fpk.car_status = tmp_status; //глобальные статусы
    $scope.fpk.car_status_array = statuses; //глобальные статусы
    tmp_status = "";


    $scope.$watch('fpk.today_date', function (val, newVal) {
        if (val != newVal) {
            $scope.fpk.jsLoadStat();
        }
    });



    $scope.jsSelectBrand = function (id) {

        if (!$scope.fpk.jsCanShowBrand(id)) {
            alert('У вас недостаточно прав, чтобы выбирать чужой бренд.');
            return false;
        }

        $scope.fpk.brand = id;
        $scope.fpk.manager_filter = -1;
        $scope.fpk.jsLoadStat();
        $scope.fpk.jsRefreshClients();
        $scope.fpk.jsRefreshUserInfo("dont_set_brand");
        //$scope.jsLoadModelsFromServer();
        if ($scope.jsRefreshModels) $scope.jsRefreshModels();
        $("#myfullcalendar").fullCalendar("refetchEvents");
    }

    $scope.jsSelectManager = function (manager_id) {
        $scope.fpk.manager_filter = manager_id;
        localStorage.setItem("manager_filter", manager_id);
        $scope.fpk.jsLoadStat();
        $scope.fpk.jsRefreshClients();
        $scope.fpk.jsRefreshDo($scope);
        $("#myfullcalendar").fullCalendar("refetchEvents");
    }


    $scope.jsCloseOneClient = function () {
        $scope.fpk.show_one_client = false;
        $scope.sms_active = false;
        $scope.fpk.one_admin = "";
        if ($scope.fpk.jsRefreshClients) $scope.fpk.jsRefreshClients();
    };

    //дефолтные установки выбора даты
    $.datetimeEntry.setDefaults({
        spinnerImage: 'bower_components/jquery.datetimeentry/spinnerDefault.png',
        datetimeFormat: 'W N Y H:M'
    });

    $scope.jsOpenClientFromRight = function (mydo) {

        myApi.getClientFull($scope, mydo.client).then(function (client) {
            console.info("client = ", client);
            $scope.fpk.one_client = client;
            $scope.fpk.show_one_client = true;
            $scope.fpk.one_client[0]._visible = true;
            $.each($scope.fpk.one_client[0].do,
                function (i, thedo) {
                    if (thedo.id == mydo.id) thedo._visible = true;
                });
        });
    }


    //фильтр для выбора уникальных групп менеджеров или дат
    $scope.fpk.jsGetDistinctTitle = function (client, distinct) {
        //    var group_by = $scope.fpk.clientsgroupby;
        var group_by = (distinct == "clients") ? $scope.fpk.clientsgroupby : $scope.fpk.clientsgroupby_one;

        var answer = client[group_by];
        if ((group_by == "vd") || (group_by == "out")) {
            answer = answer.substr(0, 7);
            var an = answer.split("-");
            answer = an[1] + "-" + an[0];
        } else if (group_by == "model") {
            if ($scope.fpk.models[answer]) {
                answer = $scope.fpk.models[answer].model;
            } else {
                answer = "Модель не указана";
            }
        } else if (group_by == "manager_id") {
            if (client.manager_id == -1) {
                answer = "Менеджер не указан";
            } else {
                answer = _.find($scope.fpk.all_managers, function (manager) {
                    return manager.id == client.manager_id;
                });
                if (answer) answer = $scope.fpk.jsFioShort(answer.fio, "name");
            }
        } else if (group_by == "icon2") {
            answer = answer + " — вероятность выдачи в этом месяце";
        } else if (group_by == "icon") {
            answer = answer + " — желание клиента";
        }
        return answer;
    }


    $scope.fpk.jsRefreshClients = function () {
        if (!$scope.fpk.clientsgroupby) return true;
        $scope.fpk.clients_current_i = 1;

        var query = angular.extend({
            brand: $scope.fpk.brand,
            limit: {
                start: 0,
                end: LIST_LENGTH
            }
        }, $scope.fpk.leftmenu.current_filter);
        $scope.fpk.clients_query = angular.extend(query, {
            group_by: $scope.fpk.clientsgroupby,
            manager: $scope.fpk.manager_filter
        });

        myApi.getClient($scope, $scope.fpk.clients_query).then(function (result) {
            $scope.fpk.clients = result;
            //$scope.fpk.clients_distincts = $scope.fpk.clientsToFilter( $scope.fpk.clients );
            //$scope.fpk.clients_by_distinct = $scope.fpk.clientsByDistinct( $scope.fpk.clients, $scope.fpk.clients_distincts );
            $timeout(function () {
                //$(".assign-list").dataTable();
                $scope.fpk.jsRoundCorner();
            });
        });
    }

    $scope.fpk.jsRoundCorner = function () {
        $("h3").parent(".client_card").prev(".client_card").addClass("last_element");
    }


    //клик в меню
    $scope.fpk.jsSelectLeftMenu = function (menu_item, $index) {
        $scope.fpk.leftmenu.active = $index;
        if (menu_item.href) {
            window.location.hash = menu_item.href;
            return true;
        }

        $scope.searchstring = "";
        $scope.fpk.leftmenu.current_filter = menu_item.filter;
        $scope.fpk.clients = [];
        $scope.fpk.clientsgroupby = menu_item.group_by;
        if (($scope.fpk.manager_filter > 0) && (($index == 0) || ($index == 1))) {
            $scope.fpk.clientsgroupby = "icon";
        }
        $scope.fpk.jsRefreshClients();

        $('#cards_scrollable').scrollTop(0);
    }

    $scope.$watch('fpk.leftmenu.active', function (val, newVal) {
        if (val != newVal) {
            if ((val == 3) || (newVal == 3) || (val == 5) || (newVal == 5)) $scope.fpk.jsRefreshDo($scope);
        }
    });


    $scope.jsSelectGroup = function (new_group) {
        $scope.fpk.clients = [];
        $scope.fpk.clientsgroupby = new_group;
        $scope.fpk.jsRefreshClients();
    }

    //Добавление нового клиента с делами
    $scope.jsNewClient = function (add_do_array) {
        myApi.jsNewClient($scope, add_do_array).then(function (answer) {
            console.info(answer);
            myApi.getClientFull($scope, answer.insert_id).then(function (client) {
                console.info("client = ", client);
                $scope.fpk.one_client = client;
                $scope.fpk.show_one_client = true;
                $scope.fpk.clientsgroupby_one = "";
                $scope.fpk.one_client[0]._visible = true;
                $scope.fpk.one_client[0]._edit = true;
                setTimeout(function () {
                    $("#new_client_div .client_fio_input input").focus().select();
                }, 600);
                /*            $.each($scope.$parent.one_client[0].do, function(i, mydo){
              if(mydo.id == calEvent.myid) mydo._visible = true;
            });
*/
            });

        });
    }

    $scope.fpk.jsGroupName = function (group_name) {
        var answer = group_name;
        if (group_name == "manager_id") answer = "Менеджер";
        if (group_name == "model") answer = "Модель";
        if (group_name == "icon") answer = "Желание";
        if (group_name == "icon2") answer = "Вероятность выдачи в этом месяце";
        return answer;
    }

    //функция группировки по выбранному полю
    $scope.fpk.jsGroupExpression1 = function (clients, $index, distinct) {
        var group_name = (distinct == "clients") ? $scope.fpk.clientsgroupby : $scope.fpk.clientsgroupby_one;

        var now_field = clients[$index][group_name];
        var old_field = clients[$index - 1] ? clients[$index - 1][group_name] : "tram";

        if (["vd", "out", "dg"].indexOf(group_name) != -1) {
            if ((now_field.substr(0, 7) != old_field.substr(0, 7))) return 10;
        } else {
            if (now_field != old_field) return 20;
        }

    }



    //если таблица выдач, то порядок клиентов обратный
    $scope.jsOrder = function (clientsgroupby) {
        if (clientsgroupby == "vd") return true;
        else return false;
    }

    //забираю ширину панели из хранилища браузера
    $scope.fpk.left_panel_width = localStorage.getItem("left_panel_width");
    if (!$scope.fpk.left_panel_width) $scope.fpk.left_panel_width = 250;


    $scope.fpk.right_panel_width = localStorage.getItem("right_panel_width");
    if (!$scope.fpk.right_panel_width) $scope.fpk.right_panel_width = 200;

    $scope.redactorOptions = {
        autoresize: false,
        imageUpload: './api/v1/save_file/?save_file=' + this_user_id

    };

    $scope.redactorOptionsMini = {
        autoresize: false,
        air: true
    }


    $scope.openPanel = function (which_panel) {
        $("body").toggleClass(which_panel + "_hide");
        localStorage.setItem("body_class", $("body").attr("class"));
        if ($("body").hasClass("right_hide")) {
            $scope.fpk.today_do = [];
            $scope.fpk.right_panel_hide = true;
        } else {
            $scope.fpk.right_panel_hide = false;
            $scope.fpk.jsRefreshDo($scope);
        }
        setTimeout(function () {
            onResize()
        }, 50);
    };


    //данные регистрации по умолчанию
    $scope.user_name = "eugene.leonar@gmail.com";
    $scope.user_password = "990990";

    //при клике в логин пытаемся соединиться
    $scope.jsLogin = function () {

        jsLogin(hex_md5($scope.user_name + '990990'), hex_md5($scope.user_password)).done(function (answer) {
            if (!answer) alert("Логин или пароль с ошибкой");
            console.info(answer);
        });
    }

    //интерфейс общения по socket.io
    var this_user_id = 11;
    $rootScope.messages = $resource(
        "./api/v1/:myAction/:idController:id", {
            id: "@id",
            idController: "@idController",
            user_id: this_user_id,
            lastTime: "@lastTime",
            change_time: jsNow(),
            token: "@token",
            myAction: "@myAction"

        }, {
            get: {
                method: 'GET',
                isArray: true
            },
            saveMessage: {
                method: "PUT",
                data: {
                    message: "@message"
                },
                isArray: true
            },
            clear: {
                method: "POST",
                params: {
                    listController: "clear-all"
                }
            },
            newMessage: {
                method: "POST",
                isArray: true,
                data: JSON.stringify({
                    to_user_id: "@to_user_id",
                    text: "@text"
                })
            }
        }
    );


});

myApp.directive('i18n', function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {

            //elem.removeAttr('i18n');
            //var orig = elem.html();
            //orig = orig.replace(/^\s+|\s+$/g, ''); // trim
            //console.info(attrs.i18n);
            //            elem.html( i18n.t( attrs.i18n ) );
            $(elem).i18n();

        }
    };
});



function twoDigits(d) {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
}


function jsNow() {
    return (new Date()).getTime();
}


//Перевожу дату new Date в mySQL формат
function toMysql(dat) {
    if (dat == "0000-00-00 00:00:00") return dat;
    return dat.getFullYear() + "-" + twoDigits(1 + dat.getMonth()) + "-" + twoDigits(dat.getDate()) + " " + twoDigits(dat.getHours()) + ":" + twoDigits(dat.getMinutes()) + ":" + twoDigits(dat.getSeconds());
};

function fromMysql(mysql_string) {
    if (mysql_string == "") return false;

    if (typeof mysql_string === 'string') {
        var t = mysql_string.split(/[- :]/);

        //when t[3], t[4] and t[5] are missing they defaults to zero
        return new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);
    }

    return null;
}


/*
 * Adapted from: http://code.google.com/p/gaequery/source/browse/trunk/src/static/scripts/jquery.autogrow-textarea.js
 *
 * Works nicely with the following styles:
 * textarea {
 *  resize: none;
 *  word-wrap: break-word;
 *  transition: 0.05s;
 *  -moz-transition: 0.05s;
 *  -webkit-transition: 0.05s;
 *  -o-transition: 0.05s;
 * }
 *
 * Usage: <textarea auto-grow></textarea>
 */
myApp.directive('autoGrow', function () {
    return function (scope, element, attr) {
        var minHeight = element[0].offsetHeight,
            paddingLeft = element.css('paddingLeft'),
            paddingRight = element.css('paddingRight');

        var $shadow = angular.element('<div></div>').css({
            position: 'absolute',
            top: -10000,
            left: -10000,
            width: element[0].offsetWidth - parseInt(paddingLeft || 0) - parseInt(paddingRight || 0),
            fontSize: element.css('fontSize'),
            fontFamily: element.css('fontFamily'),
            lineHeight: element.css('lineHeight'),
            resize: 'none'
        });
        angular.element(document.body).append($shadow);

        var update = function () {
            var times = function (string, number) {
                for (var i = 0, r = ''; i < number; i++) {
                    r += string;
                }
                return r;
            }

            var val = element.val().replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/&/g, '&amp;')
                .replace(/\n$/, '<br/>&nbsp;')
                .replace(/\n/g, '<br/>')
                .replace(/\s{2,}/g, function (space) {
                    return times('&nbsp;', space.length - 1) + ' '
                });
            $shadow.html(val);

            element.css('height', Math.max($shadow[0].offsetHeight + 10 /* the "threshold" */ , minHeight) + 'px');
        }

        element.bind('keyup keydown keypress change', update);
        update();
    }
});