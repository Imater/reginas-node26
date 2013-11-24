//#fpk/clients

myApp.controller('clientsCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment, $timeout) {

 $scope.$routeSegment = $routeSegment;

 $scope.fpk.today_date = toMysql( (new Date()) ).substr(0,10);

 $scope.fpk.leftmenu = { active:1,
                items : [
                  {id:0, title:"В работе", group_by: "manager_id", 
                   filter: {no_out: true, no_dg: true, no_vd:true}},

                  {id:1, title:"Договора", group_by: "manager_id", 
                   filter: {no_out: true, dg: true, no_vd:true}},

                  {id:2, title:"Выданы", group_by: "vd", 
                   filter: {no_out: true, no_dg: false, vd:true}},

                  {id:3, title:"Кредиты", group_by: "creditmanager", 
                   filter: {no_out: true, no_vd:true, credit: true}},

                  {id:4, title:"Out", group_by: "out", 
                   filter: {out: true}}, 

                  {id:5, title:"Трейд-ин", group_by: "manager_id", 
                   filter: {bu: true}}

                  ]
                };


    if(($scope.fpk.the_user)&&($scope.fpk.the_user.rights[0].can_hostcheck)) {
        $scope.fpk.leftmenu.items.push( {id:6, title:"<i class='icon-record'></i> Ждут проверки", group_by: "manager_id", 
                   filter: {need_check: true}} );

    }

        $scope.fpk.leftmenu.items.push( {id:7, title:"<i class='icon-attention'></i> Некорректные", group_by: "manager_id", 
                   filter: {need_check_attention: true}} );


  $scope.fpk.init.done(function(){
      $scope.fpk.clients_current_i = 1;
      
      if($scope.fpk.jsLoadStat) $scope.fpk.jsLoadStat();

      if($scope.fpk.jsSelectLeftMenu) {
        $scope.fpk.jsSelectLeftMenu($scope.fpk.leftmenu.items[1], 1);
      }


  });

/*  setTimeout(function(){
    $(".client_container:first").click();
    setTimeout(function(){
      $(".do_line")[1].click();
    }, 200);
  },500);
*/
/*    myApi.getClient({brand:1, no_out: true, no_dg: true, no_vd:true}).then(function(x){
      $scope.clients = x;
    });
*/





 $scope.myPagingFunction = function() {
          console.info("page_function");
          var query = $scope.fpk.clients_query;
          if(!query) return true;
          query.limit.start = LIST_LENGTH*$scope.fpk.clients_current_i;
          query.limit.end = LIST_LENGTH;


          myApi.getClient( $scope, query ).then(function(result){
            angular.forEach(result, function(value, key){
              if($scope.fpk.clients) $scope.fpk.clients.push( value );  
            });
            $scope.fpk.clients_current_i += 1;
            $timeout(function() {
                //$(".assign-list").dataTable();
                $scope.fpk.jsRoundCorner();
            });

          });
   };


  var tm_search;
  $scope.startSearch = function(searchstring) {
    clearTimeout(tm_search);
    tm_search = setTimeout(function(){
      if(searchstring.length>3) {
          $scope.fpk.clientsgroupby = "manager_id";
          myApi.searchString($scope, searchstring).then(function(result){
            $scope.fpk.clients = result;
            $scope.fpk.clients_distincts = $scope.fpk.clientsToFilter( $scope.fpk.clients );
            $scope.fpk.clients_by_distinct = $scope.fpk.clientsByDistinct( $scope.fpk.clients, $scope.fpk.clients_distincts );

          });
      } else {
        $scope.fpk.jsRefreshClients();    
      }
    },1000);
  }



  
});









myApp.directive("clientList", function ($compile, myApi, $routeSegment) {
  return {
//    template: '{{local_clients}} {{local_clients.length}} hi!', 
    templateUrl: 'views/client_list.html',
    restrict: 'A',
    scope: {
      local_clients: "=myAttr",
      time_now: "=timeNow",
      distinct: "@myDistinct",
      clients_by_distinct: "=clientsByDistinct"
    },
    link: function ($scope, elm, attrs, clients) {

        $scope.fpk = $scope.$parent.fpk;
        $scope.$routeSegment = $routeSegment;

//       $scope.time_now = fpkCtrl.get_time_now();

/*        $scope.models = $scope.$parent.models;
        $scope.models_array = $scope.$parent.models_array;
        $scope.car_status = $scope.$parent.car_status;
        $scope.car_status_array = $scope.$parent.car_status_array //глобальные статусы
        $scope.commercials = $scope.$parent.commercials;
        $scope.jsFindInArray = $scope.$parent.jsFindInArray;
        //$scope.clients_distincts //= $scope.$parent.clients_distincts;

//        $scope.clients_by_distinct = $scope.$parent.clients_by_distinct;

        $scope.do_types = $scope.$parent.do_types;
        $scope.do_types_array = $scope.$parent.do_types_array;
        $scope.jsFioShort = $scope.$parent.jsFioShort;

        $scope.credit_managers = $scope.$parent.credit_managers;
        $scope.managers = $scope.$parent.managers;

        $scope.jsOnOffDateParser = $scope.$parent.jsOnOffDateParser;

        $scope.jsLoadStat = $scope.$parent.jsLoadStat;
        $scope.jsRefreshDo = $scope.$parent.jsRefreshDo;
        $scope.stat = $scope.$parent.stat;
        $scope.brand = $scope.$parent.brand;
        $scope.manager_filter = $scope.$parent.manager_filter;

        

*/
        
        $scope.jsShowRemind = function(mydo) {
          var answer = "выкл";
          if(mydo.sms==5) answer = "за 5 минут";
          if(mydo.sms==15) answer = "за 15 минут";
          if(mydo.sms==30) answer = "за 30 минут";
          if(mydo.sms==60) answer = "за 1 час";
          if(mydo.sms==120) answer = "за 2 часа";
          if(mydo.sms==360) answer = "за 6 часов";
          if(mydo.sms==1440) answer = "за 24 часа";
          return answer;
        }

        $scope.jsSetRemind = function(mydo, minutes) {
          var answer = "выкл";
          mydo.sms=minutes;
          mydo.sms_send=0;
        }

        $scope.jsPlanRotate = function(client, fieldname) {
          client[fieldname] += 1;
          if(client[fieldname]>5) client[fieldname] = 0;
          $scope.jsClientSave(client);
        }


        $scope.jsCheckDoType = function(do_type, client) {
          return false;
          console.info(do_type, client, client[do_type.fieldname]);
          if( do_type.fieldname && (client[do_type.fieldname]!=NO_DATE) ) return true;
          else return false;
        }

        $scope.jsClientsInDistinct = function() {
          if(!$scope.distinct) return $scope.local_clients;
          var index = $scope.distinct[$scope.fpk.clientsgroupby];
          if( ($scope.fpk.clientsgroupby == "vd") || ($scope.fpk.clientsgroupby == "out") ) var index = $scope.distinct[$scope.fpk.clientsgroupby].substr(0,7);
          return $scope.clients_by_distinct[ index ];
        }

        $scope.jsClientDelete = function(client) {
          var client_id = client.id;
          if( confirm("Вы действительно хотите удалить клиента №"+client_id+"? Лучше откажитесь и поставьте ему OUT.") ) {
              myApi.deleteClient($scope, client_id).then(function(value){
                console.info(value);
                if(value.rows.affectedRows>0) {
                  $scope.fpk.jsRefreshClients();
                }
                else alert("Не могу удилить клиента. Лучше поставьте ему OUT.");
              }); 
          }

        }

        $scope.jsClientSave = function(client){
          var client_id = client.id;
          var changes = {};
          $.each(client, function(key,value){
             //console.info(key, value, _.isArray(value) );
             if( !(_.isArray(value)) && !(/^\$/.test(key)) && !(/^\_/.test(key)) && !(/^na/.test(key)) ) {
                changes[key] = value; 
             }
             
          });

          console.info(changes);

          
          myApi.saveClient($scope, changes, client_id).then(function(value){
            if(value.length>0) {
              console.info("11", value)

              client.na_date = value[0].na_date; 
              client.attention = value[0].attention; 
              client.dublicate = value[0].dublicate; 

              client.phone1 = value[0].phone1; 
              client.phone2 = value[0].phone2; 
              client.phone3 = value[0].phone3; 
              client.phone4 = value[0].phone4; 

              client._edit = false;
              $scope.fpk.jsLoadStat();
              $("#myfullcalendar").fullCalendar("refetchEvents");
            }
            else alert("Не могу отправить данные на сервер");
          });
        }


        $scope.jsOpenClient = function(client) {
          console.info("open_client = ", $scope.fpk.the_user.rights[0].brands, client.brand );

          if( !$scope.fpk.jsCanShowBrand(client.brand) ) {
            alert('У вас недостаточно прав, чтобы открывать клиентов чужого бренда');
            return false;
          }

          if(!client.do) {

            myApi.getDo($scope, client.id).then(function(value){
              client._visible = true;
              client.do = value;
            });


          } else {
              client._visible = !client._visible;
/*            $("li[myid="+client.id+"] .client_inside").slideToggle(200);
*/        } 

          
        }

        $scope.jsEditClient = function(client) {
          if($scope.fpk.jsCanEditClient(client)) {
            client._edit = !client._edit;  
          } else {
            alert("Вы не можете редактировать чужого клиента, но можете добавить ему дела. Права на редактирование есть у старшего менеджера и руководителей.");
          }
          
        }

        $scope.jsEditDo = function(client, mydo) {
          if($scope.fpk.jsCanEditDo(client, mydo)) {
            mydo._visible = !mydo._visible;
          } else {
            alert("Вы не можете редактировать дела чужого клиента, но можете добавить ему дела. Права на редактирование есть у старшего менеджера и руководителей. Дела выполненные больше чем 3 дня назад, может менять только руководитель.");
          }
        }

        $scope.jsAddDo = function(do_type, client) {
          var client_id = client.id;
          var do_type_title = do_type.title;

          myApi.addDo($scope, do_type_title, client_id).then(function(result){
            console.info("ADDED",result);
            var insert_id = result.insert_id;
            myApi.getDo($scope, client.id).then(function(value){
              client.do = value;
              client._visible = true;
              var new_do = _.find(client.do, function(el){ return el.id == insert_id; });
              new_do._visible = true;
              setTimeout(function(){
                $("li[mydoid='"+insert_id+"'] textarea:first").focus().select();
              },1);
              setTimeout(function(){
                $("li[mydoid='"+insert_id+"'] textarea:first").focus().select();
              },600);
            });

          });

          console.info(do_type_title,client_id);
          return false;
        }


      
    }
  }

});


//////////////////////////////////////////////////////////

myApp.directive('jqShowEffect', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      // configure options
      var passedOptions = $scope.$eval(attrs.jqOptions);
      
      // defaults
      var options = {
        type: 'fade', // or 'slide'
        duration: 200,
        delay: 0, 
        hideImmediately: false, // if true, will hide without effects or duration
        callback: null 
      };
      $.extend(options, passedOptions);
      var type = options.type;
      var duration = options.duration;
      var callback = options.callback;
      var delay = options.delay;
      var hideImmediately = options.hideImmediately;
 
      // watch the trigger
      var jqElm = $(element);
      $scope.$watch(attrs.jqShowEffect, function(value) {
        if (hideImmediately && !value) {
          jqElm.hide(0, callback);
        } else {
          $timeout(function() {
            if (type == 'fade') {
              value ? jqElm.fadeIn(duration, callback) : jqElm.fadeOut(duration, callback);
            } else if (type == 'slide') {
              value ? jqElm.slideDown(duration, callback) : jqElm.slideUp(duration, callback);
            } else {
              value ? jqElm.show(duration, callback) : jqElm.hide(duration, callback);
            }
          }, delay);
        }
      });
    }
  }
}]);


///////////////////////////////////////////////////////////


function DoCtrl($scope, myApi, oAuth2, $http) { //контроллер дел
   $scope.backup_copy = angular.copy( $scope.do );
/*   $scope.client = $scope.$parent.client;
   $scope.backup_copy._visible = true;
   $scope.time_now = $scope.$parent.time_now;
   $scope.brand = $scope.$parent.brand;

   $scope.models = $scope.$parent.models;
   $scope.models_array = $scope.$parent.models_array;
   $scope.car_status = $scope.$parent.car_status;
   $scope.car_status_array = $scope.$parent.car_status_array;

   $scope.fpk.jsRefreshClients = $scope.fpk.jsRefreshClients;

   $scope.do_types_array = $scope.$parent.do_types_array;

   $scope.jsLoadStat = $scope.$parent.jsLoadStat;
   $scope.jsRefreshDo = $scope.$parent.jsRefreshDo;
   $scope.stat = $scope.$parent.stat;
   $scope.manager_filter = $scope.$parent.manager_filter;
*/
   $scope.fpk = $scope.$parent.fpk;

   $scope.can_parse_date = true;

   $scope.jsAddHours = function(hours) {
          var answer = new Date( (new Date).getTime() + hours*60*60000 );
          $scope.do.date2 = toMysql(answer);
   };


   $scope.$watch("do.text",function( value, old_value ){
     if(($scope.do.checked!=NO_DATE) || (!$scope.can_parse_date) || (old_value == value)) return true;
     var parse_date = jsParseDate( value );
     if(parse_date && parse_date.date) {
      $scope.do.date2 = toMysql( parse_date.date );
     }
   });

   $scope.jsParseDateTrigger = function(){
    $scope.can_parse_date = !$scope.can_parse_date;
   }

   $scope.jsDoDone = function() {
      var now = toMysql( (new Date()) );

      $scope.do.checked = ($scope.do.checked==NO_DATE)?now:NO_DATE ;

      $scope.jsDoSave();

/*      if( ($scope.do.type == "Выдача") && (confirm("Добавить 3 звонка внимания после выдачи?")) ) {
          client_id = $scope.client.id;
          alert(client_id);
          if(false)
          myApi.addDo($scope, "Звонок исходящий", client_id).then(function(result){
            console.info("ADDED",result);
            var insert_id = result.insert_id;
            myApi.getDo($scope, client.id).then(function(value){
              client.do = value;
              client._visible = true;
              var new_do = _.find(client.do, function(el){ return el.id == insert_id; });
              new_do._visible = true;
              setTimeout(function(){
                $("li[mydoid='"+insert_id+"'] textarea:first").focus().select();
              },1);
              setTimeout(function(){
                $("li[mydoid='"+insert_id+"'] textarea:first").focus().select();
              },600);
            });

          });

      }
*/   }

   $scope.setFocusInWhile = function(obj, $event) {
      alert(1);
      console.info($event.target);
      setTimeout(function(){
        $($event.target).focus();
      },5); 
   };

   $scope.jsShowManagerInfo = function(mydo) {
      var dfd = new $.Deferred;
      oAuth2.jsGetToken($scope).done(function(token){
        $http({url:'/api/v1/user/info/full', method: "GET", isArray: true, params: { token: token, brand: $scope.fpk.brand, user_id: mydo.manager_id }}).then(function(result){
            dfd.resolve(result.data);
            console.info(result.data);

            $scope.the_manager = result.data.user;
            $scope.show_manager_info = !$scope.show_manager_info;

        });

      });
      return dfd.promise();


   }

   $scope.jsSaveManagerInfo = function(the_manager) {
      var dfd = new $.Deferred;
      oAuth2.jsGetToken($scope).done(function(token){
        $http({url:'/api/v1/user/info/full', method: "PUT", isArray: true, params: { token: token, brand: $scope.fpk.brand, changes: the_manager }}).then(function(result){
            dfd.resolve(result.data);
            $scope.show_manager_info = !$scope.show_manager_info;
        });

      });
      return dfd.promise();


   }

   $scope.jsDoSave = function(all_client_do) {
     var changes = {id: $scope['do'].id};
     var changed = false;

     $scope['do']["_date2"] = $scope['do'].date2;

     $(".do_date2:focus").blur();

     if($scope.do['type']=="Тест-драйв") {
      $scope.jsClientSave($scope.client);
     }

     angular.forEach($scope.do, function(value, key){
       if( ($scope.backup_copy[key] != value) && !(/^_/.test(key)) ) {
        changes[key] = value;
        changed = true;
       }
     });


     if(changed) {
        console.info("cl_id=",$scope.client.id);
        myApi.saveDo($scope, changes, $scope.client.id).then(function(client_back){
          $scope.backup_copy = angular.copy( $scope.do );
          $scope.client.na_date = client_back[0].na_date; 
          $scope.client.attention = client_back[0].attention; 
          $scope.client.dublicate = client_back[0].dublicate; 
          $scope.client.phone1 = client_back[0].phone1; 
          $scope.client.phone2 = client_back[0].phone2; 
          $scope.client.phone3 = client_back[0].phone3; 
          $scope.client.phone4 = client_back[0].phone4; 

          $("#myfullcalendar").fullCalendar("refetchEvents");

          setTimeout(function(){ if($scope.fpk.jsLoadStat) $scope.fpk.jsLoadStat(); 
            $scope.fpk.jsRefreshDo($scope);
            console.info($scope.fpk.manager_filter)
          },500);
          //$scope.setX($scope.client.id, client_back[0]);


        });

     }

   }
   $scope.jsDoCancel = function() {
    console.info(angular.copy( $scope.backup_copy ));
    $scope.do = angular.copy( $scope.backup_copy );
   }
   $scope.jsDelDo = function() {
          if( confirm("Вы действительно хотите удалить дело №"+$scope.do.id+"?") ) {
              myApi.deleteDo($scope, $scope.do.id).then(function(value){
                console.info(value);
                if(value.rows.affectedRows>0) {
                  $scope.fpk.jsRefreshClients();
                  if($scope.fpk.jsLoadStat) $scope.fpk.jsLoadStat();
                }
                else alert("Не могу удилить дело.");
              }); 
          }
   }

}




