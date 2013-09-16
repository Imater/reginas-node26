'use strict';

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

var myApp = angular.module('4treeApp');

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

  $('#myfullcalendar').fullCalendar('option','contentHeight', center_height - 146); //

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

myApp.directive('collection', function () {
  return {
      restrict: "E",
      replace: true,
      templateUrl: "views/tree_li.html"
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


myApp.controller('MainCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams, $route) {

 $scope.tmp = "";

 $scope.view_switch = 3;

	$scope.editor = $routeParams.edit;
  $scope.sync = {did: true, syncing: false};

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

  $scope.jsGetEvents = function(start, end, callback) {
     var caldata = [];

     $.each($scope.notes, function(i,el) {
            if( el.date1!="0000-00-00 00:00:00" ) {
            caldata.push(
               {title: el.title, 
                start:el.date1, 
                end:el.date2
               } 
               );                
          } 
       });
     console.info(start, caldata);
     callback(caldata);
  }

  $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        slotMinutes: 15,
        timeFormat: 'H:mm',
        axisFormat: 'H:mm',
        weekends:true,
        selectable: true,
        selectHelper: true,
        defaultView:'basicWeek', //agendaWeek
        header:{
          left: 'month basicWeek basicDay agendaWeek agendaDay',
          center: 'title',
          right: 'today prev,next'
        },
        eventSources: [{ events: function(start, end, callback) {
            $scope.jsGetEvents(start, end, callback);
           },
           className: 'my_event'
        }],        
        dayClick: $scope.alertEventOnClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize
      }
    };  

  $scope.eventSources = [
  ];   

  $scope.left_tabs = [
    {title: "Дерево", color: "#eeeeee"},
    {title: "Поиск", color: "#e3ffff"},
    {title: "Теги", color: "#fff1ff"},
    {title: "Контакты", color: "#ffffdd"},
    {title: "GTD", color: "#dbffe4"}
  ];

  $scope.user_name = "eugene.leonar@gmail.com";
  $scope.user_password = "990990";

  $scope.jsLogin = function() {

    jsLogin(hex_md5($scope.user_name+'990990'), hex_md5($scope.user_password) ).done( function(answer){ 
      if(!answer) alert("Логин или пароль с ошибкой");
      console.info(answer);
    });
  }

  ///функция синхронизации с сервером
  $scope.jsSync = function(){

    jsGetToken().done(function(token){

      $scope.sync.syncing = true;  
      
      console.time("Синхронизация заняла");
      //1. Подбираем элементы для синхронизации
      var sync_elements = [];
      var sync_dry = [], dry_element;

      $.each($scope.notes, function(i,el){
        if(el._changetime>el.lsync) {
         
          sync_elements.push(el);
          dry_element = {id:el.id, changetime: el._changetime?el._changetime:jsNow()};
          $.each( el._changefield, function(j, fieldname){
            dry_element[fieldname] = el[fieldname];
          });
          sync_dry.push(dry_element);

        }
      });    
      console.info("Буду синхронизировать: ",sync_elements);
      console.info("Высушил данные:", JSON.stringify(sync_dry) );

      socket.emit("sync", { notes: sync_dry, token: token } );

      //отправили данные по сокету и ждём ответа в функции sync_answer
    });

  };

  //Сервер сообщил, что синхронизация завершилась
  socket.on('sync_answer',function(data) {
      if(data.err) {
        jsRefreshToken().done(function(){
          $scope.jsStartSync();
          console.info("Обновил token и синхронизировался снова");
        });
      };
      console.info("answer = ", data);
      console.timeEnd("Синхронизация заняла");
      $scope.sync.did = true;
      setTimeout(function(){
      $scope.$apply(function() { $scope.sync.syncing = false; },300 );
      },10);
      

  });

  
  $scope.jsStartSync = function() {
    clearTimeout($scope.tm_start_sync);
    $scope.tm_start_sync = setTimeout(function(){
      $scope.jsSync();
    },500);
  };

	$scope.jsFind = function(id) {
		var answer = {};
		if(id==1) return { id:1, title: "4tree", parent_id:0 };
		$.each($scope.notes, function(i,el){
			if(el.id == id) { answer = el; return false; }
		});
		return answer;
	}

	$scope.jsGetPath = function(id) {
		var path = [];

		var element = $scope.jsFind(id);
		var parent_id = element?element.parent_id:1;

    var loop_prevent = 50;
		while(parent_id != 0) {
      if(loop_prevent < 0) break;
      loop_prevent-=1;
			path.push({id: element.id, title: element.title});

			element = $scope.jsFind(parent_id);
			parent_id = element?element.parent_id:1;
		}

		$scope.current_path = path.reverse();

	};


	$scope.settings = {cardWidth: 250, cardHeight: 130};

    $scope.$on('$locationChangeSuccess', function(event) {
        $route.current = lastRoute;

    });

	var this_user_id = 11;

	if($routeParams.parent_id) {
		$scope.parent_id = $routeParams.parent_id;	
	} else {
		$scope.parent_id = 1;
	}
  $scope.left_parent_id = 1;
//	$location.path('/1')


  $scope.fullScreen = function() {
    $("#editor_cont").toggleClass("fullscreen");
    onResize();
  }

	$scope.closeEditor = function(event) {
		if( (event && ( ($(event.target).attr("id") == "main_editor") || ($(event.target).parents("button").hasClass("btn")) || ($(event.target).hasClass("btn"))  ) ) || (!event)){
			$location.search("edit",null);
			$scope.editor = null;
		}
	}

	var tm_search;
	$scope.startSearch = function(search_string_for_timeout) {
		console.info(1);
		clearTimeout(tm_search);
		tm_search = setTimeout(function(){
			$scope.$apply(function(){
				$scope.search_string = search_string_for_timeout;
				$scope.selectedIndex = -1;
				$scope.zoomIndex = -1;
			});
		},800);
		
	}

	$scope.findByParent = function(parent_id, only_count) {

/*		var answer = only_count? 0:[];
		$.each($scope.notes, function(i, el){
			if(el.parent_id == parent_id) {
				if(only_count) {
					answer += 1;
				} else {
					answer.push(el);
			}
			}
		});
		return answer?answer:"";
*/	
  if(!$scope.parents) return "";

  var answer = $scope.parents[parent_id];
  if(!answer) return "";
  if(only_count) return answer.length;
  else return answer;
  }

	$scope.filterEdit = function() {
		return function(item) {
			if(item.id == $scope.editor) return true;
			else return false;
		}
	}

  $scope.filterEditMulti = function() {
    return function(item) {
      if(item.id == 5638 || item.id == 13825 || item.id == 4613 ) return true;
      else return false;
    }
  }


	$scope.goToParent = function(event) {
    var target = $(event.target);

    if(event && ( (target.attr("id") == "cards_scrollable") || ((target.attr("id") == "cards_container")) || (target.hasClass("cards_list")) ) ) {
    		var parent_id = $scope.parent_id;
    		if(parent_id!=1) {
    			var id = $scope.jsFind(parent_id).parent_id;
    			if(id) $scope.openParentId(id);
    		}
    }
	}

  $scope.jsDeselect = function(event) {
      var target = $(event.target);
      if(event && ( (target.attr("id") == "cards_scrollable") || ((target.attr("id") == "cards_container")) || (target.hasClass("cards_list")) ) ) {
        $scope.selectedIndex = -1;
      }
  }

	$scope.openEditor = function(element) {
		$location.search({edit:element});
		$scope.editor = element;
	}

  $scope.zoomIndex = -1;
  $scope.selectedIndex = -1; // Whatever the default selected index is, use -1 for no selection


  $scope.itemClicked = function ($index) {
  	if( $scope.zoomIndex == $index ) $scope.zoomIndex = -1;
  	else
    $scope.zoomIndex = $index;
  };	

  $scope.liClicked = function ($index) {
    $scope.selectedIndex = $index;
  };	

  $scope.liClickedLeft = function ($index) {
    var open_id = $index;
    $scope.selectedIndexLeft = open_id;
    $scope.openParentId($index);  
    

  };  




	$scope.openParentId = function(element, $event) {
		if($event) {
			$event.preventDefault();
			console.info("prevent");
		}
		console.info("openParentId");
		if( $scope.findByParent(element, "only_count") ) {
			$scope.selectedIndex = -1;
			$scope.zoomIndex = -1;
			$scope.parent_id = element;
			lastRoute = $route.current;
			$scope.search_string = "";
			$scope.jsGetPath(element);
			$location.path('cards/'+element);
			$scope.closeEditor();
			return false;
		} else {
			$scope.openEditor(element);
		}

	}

	$scope.parentIdMatch = function( criteria, search_string) {
	  if(($scope.search_string) && ($scope.search_string.length>2)) return $scope.searchFilter();

	  var parent_id = $routeParams.parent_id;
    if(criteria) {
      parent_id = criteria; 
    } else {
      parent_id = $scope.parent_id;
    }
	  return function( item ) {
	    return item.parent_id == parent_id;
	  };
	};	

  $scope.sortByPosition = function() {
    return function( item ) {
      return item.position;
    }
  }


	$scope.searchFilter = function() {
	  return function( item ) {
	  	var search_text = "";
	  	if(item.text) search_text = item.text;
	  	if(item.title) search_text += item.title;
	  	var answer = ( (new RegExp($scope.search_string,"ig")).test(search_text) );
	    return answer;
	  };
	};	

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
  	
  	$scope.current_path = [{id:1, title: "4tree.ru"},
  						   {id:2, title: "Домашние дела"},
						   {id:3, title: "Книги"},
						   {id:4, title: "Социальная сеть Ковчег"},
  						  ];

    $scope.favorits = [
    				   {id:1, title: "", icon: "icon-folder-1"},
    				   {id:2, title: "", icon: "icon-heart"},
    				   {id:3, title: "Регулировки", icon: "icon-adjust"},
    				   {id:4, title: "", icon: "icon-tag"},
    				   {id:5, title: "Архив", icon: "icon-archive"},
    				   {id:6, title: "", icon: "icon-tree"},
    				   {id:7, title: "", icon: "icon-wallet"},
    				   {id:8, title: "АСТД", icon: "icon-folder-1"},
    				   {id:9, title: "Новости", icon: "icon-folder-1"},
    				   {id:10, title: "", icon: "icon-camera"}
    				  ];

    $scope.notes = [
      {title: 'HTML5 Boilerplate', text: 'Вова, Аполлион и Таня пролетают кротовую нору и после небольших поисков, находят планету пригодную для жизни. Эта планета очень похожа на землю, тоже есть спутник похожий на луну. Но все континенты соединены вместе. (Земля до заселения человеком). Планета очень похожа на тот остров Суртсей в том состоянии, когда они там были.'}
      ];

    console.time("Загружаю все данные с сервера");

jsRefreshToken().done(function(){
    jsGetToken().done(function(token){

        $rootScope.messages.query( {lastTime: 0, token: token, myAction:"message", idController:"" }, function( data ){
              console.timeEnd("Загружаю все данные с сервера");
            	$scope.notes = data;
              var tmp_parents = {};
              $.each($scope.notes, function(i,el){
                    if(!tmp_parents[el.parent_id]) tmp_parents[el.parent_id] = [];
                    tmp_parents[el.parent_id].push(el);
              });
              if($scope.add) $scope.add();
              $scope.parents = tmp_parents;
        		$scope.jsGetPath($scope.parent_id);
        });
    });
});


  	  $scope.openPanel = function(which_panel) {
  	  	$("body").toggleClass(which_panel+"_hide");
  	  };



      $scope.sqldate = function(UNIX_timestamp){ //показываю время в виде mysql. timeConverter( jsFindLastSync ) используются для отладки
 var a = new Date(UNIX_timestamp);
 var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var year = a.getFullYear();
     var month = a.getMonth()+1;
     if(month<10) month = "0"+month;
     var date = a.getDate();
     if(date<10) date = "0"+date;
     var hour = a.getHours();
     if(hour<10) hour = "0"+hour;
     var min = a.getMinutes();
     if(min<10) min = "0"+min;
     var sec = a.getSeconds();
     if(sec<10) sec = "0"+sec;
     var msec = a.getMilliseconds();
     if(msec<10) msec = "0"+msec;
     var time = year+"-"+month+'-'+date+' '+hour+':'+min+':'+sec;
     return time;
 }

  	  $scope.addNotesInput = function(add_text) {
  	  	if(add_text) {
  	  		var add_text_items = add_text.split(",");
  	  		$.each(add_text_items, function(i, el){
  	  			var new_title = el.trim();
  	  			var new_el = {title: new_title, text: ""};
  	  			if($scope.current_note) $scope.notes[$scope.current_note] = new_el;
  	  			else
  				$scope.current_note = $scope.notes.push(new_el);
  	  		});
  	  		console.info($scope.current_note);
  	  	}
  	  }

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


function jsNow() {
	return (new Date()).getTime();
}



function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};


