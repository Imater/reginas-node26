'use strict';

var NO_DATE = '0000-00-00 00:00:00';

var uagent = navigator.userAgent.toLowerCase();
if(uagent.search("iphone") > -1)
setTimeout(function(){
	$("#cards_scrollable").scroll(function(){

		setTimeout(function(){
			var top = $("#cards_scrollable").scrollTop();
			if(top > 75) $("body").addClass("fav_hide");
			if(top < 5) $("body").removeClass("fav_hide");
		},50);

	});
},2000);



i18n.init({lng:"ru"},function(t) {
  // translate nav
  $("body").i18n();
  // programatical access
  // var appName = t("4tree");
});

var myApp = angular.module('fpkApp');

myApp.directive('syncOnChange', function() {
    return {
        link: function(scope, element, attrs) {
            var tm_watch;
            scope.$watch('note', function(newValue, oldValue) {
                clearTimeout(tm_watch);
                clearTimeout(scope.tm_start_sync);
                tm_watch = setTimeout(function(){
                scope.sync.did = false;
                if (newValue!=oldValue) {
                    
                    var changefield = scope.note._changefield?scope.note._changefield:[];
                    var old_length = changefield.length;
                    $.each(newValue, function(i, n){
                       if( !(/\$\$/.test(i)) && !(/_/.test(i)) && (oldValue[i] != n) ) changefield.push(i);
                    });


                    if(changefield.length>old_length) {

                      scope.$apply(function(){
                        scope.note._changefield = arrayUnique(changefield);
                        scope.note._changetime = jsNow();
                        
                      });

                      scope.jsStartSync();
                    }
                }

                },500);
                    //console.info("I see a data change!",changefield);
            }, true);
        }
    }
});

myApp.directive('resizable', function() { return {
    //restrict: 'A',
    require: '?ngModel',
    link: function($scope, $element, attrs, ngModel) {
      // view -> model
      $element.resizable({ handles: "e" });

      var tm_resize;
      $element.on('resize', function(event, ui) {
        console.info("rezize", event, ui);
        clearTimeout(tm_resize);
        tm_resize = setTimeout(function(){
            $scope.$apply(function() {
              $scope.left_panel_width = ui.size.width;
              localStorage.setItem("left_panel_width", ui.size.width);
            });

        },1);
      })
    }
}
});



myApp.directive('sortable', function() { return {
    //restrict: 'A',
    require: '?ngModel',
    link: function($scope, $element, attrs, ngModel) {
      // view -> model
      $element.sortable({
        tolerance: 'pointer',
        handle: ".card_footer",
        //helper: "clone",
//        placeholder: "sortable-placeholder",


      });


      $element.on('sortstop', function(event, ui) {
        //console.info("sort_stop", event, ui.item.index());
        $scope.$apply(function() {
            $.each($element.find(".li_card"), function(i,el){
              var id = $(el).attr("myid");
              $scope.jsFind(id).position = i;
            });

        });
      })
    }
}
});





myApp.directive('contenteditable', ['$timeout', function($timeout) { return {
    restrict: 'A',
    require: '?ngModel',
    link: function($scope, $element, attrs, ngModel) {
      // don't do anything unless this is actually bound to a model
      // view -> model
      if(!ngModel) return true;
      $element.bind('input', function(e) {
        $scope.$apply(function() {
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
            $timeout(function(){
              $element.blur()
              $element.focus()
            })
          }
        });
      });

      // model -> view
      var oldRender = ngModel.$render;
      ngModel.$render = function() {
        var el, el2, range, sel;
        if (!!oldRender) {
          oldRender();
        }
        $element.html(ngModel.$viewValue || '');
        if( $element.hasClass("div_editor") ) {
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
        $element.click(function(e) {
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
  }}]);


myApp.directive('modelChangeBlur', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
            link: function(scope, elm, attr, ngModelCtrl) {
            if (attr.type === 'radio' || attr.type === 'checkbox') return;

            elm.unbind('input').unbind('keydown').unbind('change');
            elm.bind('blur', function() {
                scope.$apply(function() {
                    ngModelCtrl.$setViewValue(elm.val());
                });         
            });
        }
    };
});

function jsDateDiff(date2) {
  var answer = {text:"&nbsp;", class:""};

  if(!date2) return answer;
  if(date2=="0000-00-00 00:00:00") return answer;

  var date1 = new Date();
  var date2 = fromMysql(date2);
  var dif_sec = date2.getTime() - date1.getTime();

  var days = parseInt( dif_sec/(60*1000*60*24) , 10 );
  var minutes = parseInt( dif_sec/(60*1000) , 10 ); 

  //if(days<500) return answer;


  if(days == 0) {
    if( (minutes>59) || (minutes<-59) ) {
      var hours = parseInt( dif_sec/(60*1000*60)*10 , 10 )/10; 
      answer.text = ((minutes>0)?"+ ":"") + hours + " ч.";
    } else {
      answer.text = ((minutes>0)?"+ ":"") + minutes + " мин.";  
    }

  } else {
    answer.text = ((days>0)?"+ ":"") + days + " дн.";
  }

  if(days == 0) {
    if(minutes < 0) answer.class="datetoday past";
    if(minutes >= 0) answer.class="datetoday";

    
  } else if (minutes<0) {
    answer.class="datepast";
  }

  return answer;
}


myApp.directive('datemini', ['$timeout', function($timeout) { return {
    restrict: 'C',
    require: '?ngModel',
    link: function($scope, $element, attrs, ngModel) {
      // don't do anything unless this is actually bound to a model
      // view -> model

      //ngModel.$viewValue.html("+3дн");
      ngModel.$render = function() {
        var date2 = ngModel.$viewValue;
        var answer = jsDateDiff(date2);
        if(($scope.client) && ($scope.client.out!=NO_DATE)) {
          answer.text = "OUT";
          answer.class = "date_out";
        }
        if( ($scope.client) && ($scope.client.out!=NO_DATE) && ($scope.client.dg!=NO_DATE) ) {
          answer.text = "РАСТОРГ";
          answer.class = "date_rastorg";
        }
        $element.html(answer.text || '').removeClass("past").removeClass("datetoday").removeClass("datepast").addClass(answer.class);

        }
      }
    
  }}]);



myApp.directive("ngPortlet", function ($compile) {
  return {
    template: '',
    restrict: 'E',
        link: function (scope, elm, attrs) {
            var jsOpenFolder = function(){
                //console.log(elm, attrs);

                if(attrs.open) {

                  $(elm).next("ul").slideToggle(100);

                  return true;
                } 
                attrs.$set("open","true");

                var tmp_html = '<ul style="display:none">'+
                  '<li ng-repeat="note in findByParent('+attrs.parent+')"><div class="left_tree_title" compile="note.title"></div><ng-portlet parent="{{note.id}}"></ng-portlet></li></ul>';


var tmp_html = '<ul style="display:none">'+
                    '<li class="li_left" ng-repeat="note in findByParent('+attrs.parent+') | orderBy: sortByPosition()" ng-class="{ \'selected\': note.id == selectedIndexLeft,\'card_big\': $index == zoomIndex,\'card_folder\': note.count>0 }">'+
                      '<div class="li_icons">'+
                      '<div class="triangle" ng-click="add()"></div>'+
                      '<div class="card_icon" ng-click="add()">'+
                            '<i class="icon-doc-2"></i>'+
                            '<div class="the_count" ng-bind="note.count=findByParent(note.id,\'count\')">'+
                            '</div>'+
                          '</div>'+     
                      '</div>'+        

                      '<div class="left_tree_title" ng-click="liClickedLeft(note.id);" contenteditable="false" ng-model="note.title">'+
                      '</div>'+
                    '<ng-portlet parent="{{note.id}}"></ng-portlet>'+  
                    '</li>'+
                  '</ul>';
                elm.after( $compile(tmp_html)(scope) );
                setTimeout(function(){ $(elm).next("ul").slideDown(100) }, 1);
            }

            scope.add = jsOpenFolder;


        }
  };
});


myApp.filter('noFractionCurrency',
  [ '$filter', '$locale',
  function(filter, locale) {
    var currencyFilter = filter('currency');
    var formats = locale.NUMBER_FORMATS;
    return function(amount, currencySymbol) {
      var value = currencyFilter(amount, currencySymbol);
      var sep = value.indexOf(formats.DECIMAL_SEP);
      if(amount >= 0) { 
        return value.substring(0, sep);
      }
      return value.substring(0, sep) + ')';
    };
  } ]);


myApp.factory('socket', function($rootScope) {
	var socket = io.connect();

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
		on: function(eventName, callback) {
			socket.on('disconect', function(){
				console.info("server off");
			});
      socket.on('connect', function(){
        if($rootScope.jsStartSync) $rootScope.jsStartSync();
        console.info("Server connected.");
      });
      socket.on('EMAIL', function(){
        alert("NEW MAIL");
        console.info("NEW EMAIL.");
      });
			socket.on(eventName, function() {
				var args = arguments;
				//console.info("on=",socket, eventName);
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if(callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});

myApp.filter('jsFilterClients', function() {
    return function(clients, distinct, group_by) {

      var answer = _.filter(clients, function(client){

        if( (group_by=='manager') && (client.manager == distinct.manager) ) return true;

        if( (group_by=='vd') && (client.vd.indexOf(distinct.vd.substr(0,7))!=-1) ) return true;


        if( (group_by=='creditmanager') && (client.creditmanager==distinct.creditmanager) ) return true;

        if( (group_by=='model') && (client.model==distinct.model) ) return true;
        //if ((client.manager == distinct.manager)) return true;


      });
      return answer;
    }
});




myApp.filter('parent_id', function() {
    return function(input, uppercase) {
      return input;
    }
});

var lastRoute;


myApp.directive('eatClick', function() {
    return function(scope, element, attrs) {
        $(element).click(function(event) {
            event.preventDefault();
        });
    }
})

function onResize(){
	
  var center_height = $("#panel_center").height();

  $('#myfullcalendar').fullCalendar('option','contentHeight', center_height - 77); //

  $('.fc-view-month').height( center_height - 77 );

  $("#myfullcalendar .fc-content").height(center_height - 76);

  var body_height = center_height - 73;
  if( $("#editor_cont").hasClass("fullscreen") ) {
    body_height = $(window).height() - $("#editor_cont .redactor_editor").offset().top-14;
  }



	$("#main_editor .redactor_editor").height(body_height);
  $("#me .redactor_editor").height(body_height-59);
  

    $("#editor_cont:not(.ui-resizable)").resizable({
      handles: 'e',
      minWidth: 500
    }).draggable({
      handle: ".redactor_toolbar"
    });


};

myApp.directive('dateTimeEntry', function() {    
    return {
        restrict: 'A',
        scope:{'dateTimeEntry':'=' },
        link: function(scope, elm, attrs) {            
            scope.$watch('dateTimeEntry', function(nVal) { 
              nVal = fromMysql( nVal );
              elm.datetimeEntry('setDatetime', nVal);
            });

            var old_index, mydoid;
            var index_cache = {};

            elm.on("keydown",function(){
              old_index = $(this).parents("li:first").index();
              mydoid = $(this).parents("li:first").attr("mydoid");
              console.info("SAVE-CURRENT INDEX = ", old_index);
            });

            elm.datetimeEntry().change(function() {

                var currentValue = toMysql(elm.datetimeEntry('getDatetime'));

                if( scope.dateTimeEntry !== currentValue ) {
                    scope.dateTimeEntry = currentValue;
                    if(!scope.$$phase && !scope.$root.$$phase) {
                       scope.$apply();
                    }
                  }
                }).keydown(function(){
                }).blur(function(){
                  console.info( "blur!", scope.$parent.$index );
                  var old_this = this;
                  setTimeout(function(){
                    var new_index = $("li[mydoid='"+mydoid+"']").index();
                    if(old_index != new_index) {
                      $("li[mydoid='"+mydoid+"'] .do_date2").focus();
                    }
                    console.info( old_index, new_index, mydoid, scope.$parent.$index );

                  },0);
                  setTimeout(function(){
                    var new_index = $("li[mydoid='"+mydoid+"']").index();
                    if(old_index != new_index) {
                      $("li[mydoid='"+mydoid+"'] .do_date2").focus();
                    }
                    console.info( old_index, new_index, mydoid, scope.$parent.$index );

                  },600);
                });

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

myApp.filter('slice', function() {
  return function(arr, start, end) {
    return arr.slice(start, end);
  };
});

myApp.filter('onlyManager', function() {
  return function(managers, isTrue) {
    var answer =  _.filter(managers, function(el){
      if( isTrue && (el.user_group == 6 || el.user_group == 5) ) return true;
      if( !isTrue && el.user_group != 6 && el.user_group != 5 ) return true;
    })
    return answer;
  };
});


myApp.directive('datepicker', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function (scope, element, attrs, ngModelCtrl) {
            $(function(){
                element.datepicker({
                    dateFormat:'yy-mm-dd',
                    showOtherMonths: true,
                    selectOtherMonths: true,
                    onSelect:function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
            scope.$on('$destroy', function() {
            });
        }
    }
});

myApp.directive('slideToggle', function() {  
  return {
    restrict: 'A',      
    scope:{
      isOpen: "=slideToggle",
      client: "@",
      clients: "@"
    },  
    link: function(scope, element, attr) {
      var slideDuration = parseInt(attr.slideToggleDuration, 10) || 200;      
      scope.$watch('isOpen', function(newVal,oldVal){
        if(newVal !== oldVal){ 
            element.stop().slideToggle(slideDuration);
            alert(newVal);
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

myApp.factory('myApi', function($http, $q){
  return {
    getDo: function(id) {
      var dfd = $q.defer();

      jsGetToken().done(function(token){
        $http({url:'/api/v1/do/'+id,method: "GET", params: { token: token}}).then(function(result){
          dfd.resolve(result.data);
        });
      });

      return dfd.promise;
    },
    getClient: function($scope,filter) {
      var dfd = $q.defer();

      jsGetToken().done(function(token){
        $http({url:'/api/v1/client',method: "GET", isArray: true, params: { token: token, filter:filter, manager: $scope.manager_filter}}).then(function(result){
          dfd.resolve(result.data);
        });
      });

      return dfd.promise;      
    },
    getStat: function($scope) {
      var dfd = $q.defer();

      jsGetToken().done(function(token){

        var filters = $scope.leftmenu;

        $http({url:'/api/v1/stat',method: "GET", isArray: true, params: { token: token, filters: filters, brand: $scope.brand }}).then(function(result){
          dfd.resolve(result.data);
        });
      });

      return dfd.promise;      

    },
    searchString: function($scope, searchstring) {
      var dfd = $q.defer();

      jsGetToken().done(function(token){

        $http({url:'/api/v1/search',method: "GET", isArray: true, params: { token: token, search: searchstring, brand: $scope.brand }}).then(function(result){
          dfd.resolve(result.data);
        });
      });

      return dfd.promise;      

    },
    getDoCalendar: function($scope, start_date, end_date) {
      var dfd = $q.defer();

      jsGetToken().done(function(token){

        var filters = $scope.leftmenu;

        $http({url:'/api/v1/calendar',method: "GET", isArray: true, params: { token: token, start_date: start_date, end_date: end_date, brand: $scope.brand }}).then(function(result){
          console.info(result);
          dfd.resolve(result.data);
        });
      });

      return dfd.promise;      

    },
    saveDo: function($scope,changes, client_id) {
      var dfd = $q.defer();

      jsGetToken().done(function(token){

        $http({url:'/api/v1/do/'+changes.id,method: "PUT", isArray: true, params: { token: token, changes: changes, brand: $scope.brand, client_id: client_id }}).then(function(result){
            console.info("DO SAVED: ",result.data);
          dfd.resolve(result.data);
        });
      });

      return dfd.promise;      

      
    },
    addDo: function($scope, do_type, client_id) {
      var dfd = $q.defer();

      jsGetToken().done(function(token){

        $http({url:'/api/v1/do',method: "POST", isArray: true, params: { token: token, do_type: do_type, brand: $scope.$parent.brand, client_id: client_id }}).then(function(result){
            console.info("DO NEW: ",result.data);
          dfd.resolve(result.data);
        });
      });

      return dfd.promise;      

      
    },
    saveClient: function($scope, changes, client_id) {
      var dfd = $q.defer();

      jsGetToken().done(function(token){

        $http({url:'/api/v1/client/'+changes.id,method: "PUT", isArray: true, params: { token: token, changes: changes, brand: $scope.brand, client_id: client_id }}).then(function(result){
            console.info("DO SAVED: ",result.data);
          dfd.resolve(result.data);
        });
      });

      return dfd.promise;      

      
    },    
    regNewUser:function($scope) {
      var dfd = $q.defer();
        var reg_user = angular.copy( $scope.reg_user );

        reg_user.password = hex_md5( reg_user.password );
        reg_user.password2 = hex_md5( reg_user.password + "990990");
        reg_user.md5email = hex_md5( reg_user.email + "990990");

        $http({url:'/api/v1/user/new',method: "POST", isArray: true, data: {reg_user: reg_user}}).then(function(result){
            console.info("NEW USER: ",result.data);
          dfd.resolve(result.data);
        });

      return dfd.promise;      

      
    },
    getModels: function($scope) {
      var dfd = $q.defer();

        $http({url:'/api/v1/models', method: "GET", isArray: true, params: { brand: $scope.brand }}).then(function(result){
            dfd.resolve(result.data);
        });

      return dfd.promise;      

    },
    getCUP: function($scope) {
      var dfd = $q.defer();
      jsGetToken().done(function(token){

        $http({url:'/api/v1/stat/cup', method: "GET", isArray: true, params: { token: token, brand: $scope.brand, today_date: $scope.today_date }}).then(function(result){
          dfd.resolve(result.data);
        });
      });

      return dfd.promise;      

    },
    getCUPcars: function($scope, brand_id, do_type) {
      var dfd = $q.defer();
      jsGetToken().done(function(token){

        $http({url:'/api/v1/stat/cup/cars', method: "GET", isArray: true, params: { token: token, brand: brand_id, today_date: $scope.today_date, do_type: do_type }}).then(function(result){
            console.info("STAT_CARS: ",result.data.length);
          dfd.resolve(result.data);
        });
      });

      return dfd.promise;      

    },
    loadUserInfo:function($scope) {
      var dfd = $q.defer();
      jsGetToken().done(function(token){
        $http({url:'/api/v1/user/info', method: "GET", isArray: true, params: { token: token, brand: $scope.brand }}).then(function(result){
            dfd.resolve(result.data);
        });
      });

      return dfd.promise;      

    }


  }
});



var bootstrap_alert = function() {};

bootstrap_alert.warning = function(message) {
            $('#alert_placeholder').html('<div class="alert alert-warning"><a class="close" data-dismiss="alert">×</a><span>'+message+'</span></div>')
        }

$('#clickme').on('click', function() {
            bootstrap_alert.warning('Your text goes here');
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


myApp.controller('fpkCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {



$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    console.info("list_finish");
    //you also get the actual event object
    //do stuff, execute functions -- whatever...
});        


 $scope.$routeSegment = $routeSegment;

 $scope.manager_filter = -1;

 $scope.jsShowManagerFilter = function() {
  if($scope.manager_filter == -1) {
    return "Все клиенты";
  } else {
    var the_manager = _.find($scope.managers, function(manager) {
      return (manager.id == $scope.manager_filter );
    });
    if(the_manager) return the_manager.fio;
  }
 }
 
 $scope.do_types = [ //типы дел
    {img: "1zvonok.png", title: "Звонок"},
    {img: "1vizit.png", title: "Визит"},
    {img: "1test-drive.png", title: "Тест-драйв"},
    {img: "1credit.png", title: "Кредит"},
    {img: "1dogovor.png", title: "Договор"},
    {img: "1settings.png", title: "Подготовка"},
    {img: "1vidacha.png", title: "Выдача"},
    {img: "1out.png", title: "OUT"}
 ];

 var tmp_status = {};
 $.each($scope.do_types, function(i, dt){
  tmp_status[dt.title] = dt;
 });
 $scope.do_types_array = tmp_status;


 var statuses = [ //статусы нахождения автомобилей
    {title:"+ Наличие", procent:0},
    {title:"1 - Транзит от поставщика", procent: 0.25},
    {title:"2 - У поставщика", procent: 0.50},
    {title:"3 - Транзит к поставщику", procent: 0.60},
    {title:"4 - Производство", procent: 0.70},
    {title:"5 - Виртуальный", procent: 0.90},
    {title:"? - Неизвестно", procent: 0.95}
 ];
 var tmp_status = {};

 $.each(statuses, function(i, st){
  tmp_status[st.title] = st;
 });

 $scope.car_status = tmp_status; //глобальные статусы
 $scope.car_status_array = statuses; //глобальные статусы
 tmp_status = "";

 $scope.today_date = toMysql( (new Date()) ).substr(0,10);


 $scope.jsSelectBrand = function(id) {
    $scope.brand=id;
    $scope.jsLoadStat(); 
    $scope.jsRefreshClients();    
 }

 $scope.jsSelectManager = function(manager_id) {
    $scope.manager_filter = manager_id;
    $scope.jsRefreshClients();
 }

 //дефолтные установки выбора даты
 $.datetimeEntry.setDefaults({spinnerImage: 'bower_components/jquery.datetimeentry/spinnerDefault.png', datetimeFormat: 'W N Y H:M'});

 //клик в меню
 $scope.jsSelectLeftMenu = function(menu_item, $index) {
          $scope.clientsgroupby = menu_item.group_by; 
          $scope.leftmenu.active = $index;  
          $scope.leftmenu.current_filter = menu_item.filter;  
          console.info("SELECT LEFT MENU=", menu_item, $index);
          $scope.jsRefreshClients();

          $('#cards_scrollable').scrollTop(0);
 }

 $scope.jsRefreshClients = function() {
    if(!$scope.clientsgroupby) return true;
    $scope.clients_current_i = 1;
    console.info("jsRefreshClients");

    var query = angular.extend( {brand:$scope.brand, limit: {start:0, end:LIST_LENGTH}}, $scope.leftmenu.current_filter);
    $scope.clients_query = angular.extend( query, {group_by:$scope.clientsgroupby, manager: $scope.manager_filter} );

    myApi.getClient( $scope, $scope.clients_query ).then(function(result){
        $scope.clients = result;
    });
 }


 //если таблица выдач, то порядок клиентов обратный
 $scope.jsOrder = function(clientsgroupby) {
  if( clientsgroupby == "vd" ) return true;
  else return false;
 }

 //забираю ширину панели из хранилища браузера
  $scope.left_panel_width = localStorage.getItem("left_panel_width");
  if(!$scope.left_panel_width) $scope.left_panel_width = 250;

	$scope.redactorOptions = {
      autoresize: false,
      imageUpload: './api/v1/save_file/?save_file='+this_user_id

  };

  $scope.redactorOptionsMini  = {
    autoresize: false,
    air: true
  }


  $scope.openPanel = function(which_panel) {
    $("body").toggleClass(which_panel+"_hide");
  };

  
  //данные регистрации по умолчанию
  $scope.user_name = "eugene.leonar@gmail.com";
  $scope.user_password = "990990";

  //при клике в логин пытаемся соединиться
  $scope.jsLogin = function() {

    jsLogin(hex_md5($scope.user_name+'990990'), hex_md5($scope.user_password) ).done( function(answer){ 
      if(!answer) alert("Логин или пароль с ошибкой");
      console.info(answer);
    });
  }

    //интерфейс общения по socket.io
    var this_user_id = 11;
    $rootScope.messages = $resource(
        "./api/v1/:myAction/:idController:id",
        {
            id: "@id",
            idController: "@idController",
            user_id: this_user_id,
            lastTime: "@lastTime",
            change_time: jsNow(),
            token: "@token",
            myAction: "@myAction"
            
        },
        {
         	get: {
         		method: 'GET', isArray: true
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

myApp.directive('i18n', function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
        	
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
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}


function jsNow() {
  return (new Date()).getTime();
}


//Перевожу дату new Date в mySQL формат
function toMysql(dat) {
  if(dat == "0000-00-00 00:00:00") return dat;
    return dat.getFullYear() + "-" + twoDigits(1 + dat.getMonth()) + "-" + twoDigits(dat.getDate()) + " " + twoDigits(dat.getHours()) + ":" + twoDigits(dat.getMinutes()) + ":" + twoDigits(dat.getSeconds());
};

function fromMysql(mysql_string)
{ 
   if(mysql_string == "") return false;
   
   if(typeof mysql_string === 'string')
   {
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
myApp.directive('autoGrow', function() {
  return function(scope, element, attr){
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
      resize:     'none'
    });
    angular.element(document.body).append($shadow);
 
    var update = function() {
      var times = function(string, number) {
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
        .replace(/\s{2,}/g, function(space) { return times('&nbsp;', space.length - 1) + ' ' });
      $shadow.html(val);
 
      element.css('height', Math.max($shadow[0].offsetHeight + 10 /* the "threshold" */, minHeight) + 'px');
    }
 
    element.bind('keyup keydown keypress change', update);
    update();
  }
});