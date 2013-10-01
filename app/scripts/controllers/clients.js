//#fpk/clients

myApp.controller('clientsCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {




 $scope.$parent.leftmenu = { active:1,
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
                   filter: {out: true}}
                  ]
                };


  if($scope.jsLoadStat) $scope.jsLoadStat();

  if($scope.jsSelectLeftMenu) {
    $scope.jsSelectLeftMenu($scope.leftmenu.items[1], 1);
  }
/*    myApi.getClient({brand:1, no_out: true, no_dg: true, no_vd:true}).then(function(x){
      $scope.clients = x;
    });
*/

   $scope.clients_current_i = 1;



 $scope.myPagingFunction = function() {
          console.info("page_function");
          var query = $scope.clients_query;
          if(!query) return true;
          query.limit.start = LIST_LENGTH*$scope.$parent.clients_current_i;
          query.limit.end = LIST_LENGTH;


          myApi.getClient( $scope, query ).then(function(result){
            angular.forEach(result, function(value, key){
              if($scope.clients) $scope.clients.push( value );  
            });
            $scope.$parent.clients_distincts = $scope.clientsToFilter( $scope.$parent.clients );
            $scope.$parent.clients_by_distinct = $scope.clientsByDistinct( $scope.$parent.clients, $scope.$parent.clients_distincts );

            

            $scope.$parent.clients_current_i += 1;

          });
   };


  var tm_search;
  $scope.startSearch = function(searchstring) {
    clearTimeout(tm_search);
    tm_search = setTimeout(function(){
      if(searchstring.length>3) {
          $scope.$parent.clientsgroupby = "manager";
          myApi.searchString($scope, searchstring).then(function(result){
            $scope.$parent.clients = result;
            $scope.$parent.clients_distincts = $scope.clientsToFilter( $scope.$parent.clients );
            $scope.$parent.clients_by_distinct = $scope.clientsByDistinct( $scope.$parent.clients, $scope.$parent.clients_distincts );

          });
      } else {
        $scope.jsRefreshClients();    
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
      distinct: "=myDistinct",
      clients_by_distinct: "=clientsByDistinct"
    },
    link: function ($scope, elm, attrs, clients) {

 //       $scope.time_now = fpkCtrl.get_time_now();

        $scope.models = $scope.$parent.models;
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

        $scope.models_array_show = _.filter($scope.$parent.models_array, function(el){ return ( (el.brand == $scope.$parent.brand) && (el.show == 1)); });

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
          var index = $scope.distinct[$scope.$parent.clientsgroupby];
          if( ($scope.$parent.clientsgroupby == "vd") || ($scope.$parent.clientsgroupby == "out") ) var index = $scope.distinct[$scope.$parent.clientsgroupby].substr(0,7);
          return $scope.clients_by_distinct[ index ];
        }

        $scope.jsClientDelete = function(client) {
          var client_id = client.id;
          if( confirm("Вы действительно хотите удалить клиента №"+client_id+"? Лучше откажитесь и поставьте ему OUT.") ) {
              myApi.deleteClient($scope, client_id).then(function(value){
                console.info(value);
                if(value.rows.affectedRows>0) {
                  $scope.$parent.jsRefreshClients();
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
            if(value.affectedRows>0) {
              client._edit = false;
              $scope.jsLoadStat();
              $("#myfullcalendar").fullCalendar("refetchEvents");
            }
            else alert("Не могу отправить данные на сервер");
          });
        }


        $scope.jsOpenClient = function(client) {
          if(!client.do) {

            myApi.getDo(client.id).then(function(value){
              client._visible = true;
              client.do = value;
            });


          } else {
              client._visible = !client._visible;
/*            $("li[myid="+client.id+"] .client_inside").slideToggle(200);
*/        } 

          
        }

        $scope.jsAddDo = function(do_type, client) {
          var client_id = client.id;
          var do_type_title = do_type.title;

          myApi.addDo($scope, do_type_title, client_id).then(function(result){
            console.info("ADDED",result);
            var insert_id = result.insert_id;
            myApi.getDo(client.id).then(function(value){
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


function DoCtrl($scope, myApi) { //контроллер дел
   $scope.backup_copy = angular.copy( $scope.do );
   $scope.client = $scope.$parent.client;
   $scope.backup_copy._visible = true;
   $scope.time_now = $scope.$parent.time_now;
   $scope.brand = $scope.$parent.brand;

   $scope.models = $scope.$parent.models;
   $scope.models_array = $scope.$parent.models_array;
   $scope.car_status = $scope.$parent.car_status;
   $scope.car_status_array = $scope.$parent.car_status_array;

   $scope.do_types_array = $scope.$parent.do_types_array;

   $scope.jsLoadStat = $scope.$parent.jsLoadStat;
   $scope.jsRefreshDo = $scope.$parent.jsRefreshDo;
   $scope.stat = $scope.$parent.stat;
   $scope.manager_filter = $scope.$parent.manager_filter;

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
   }

   $scope.setFocusInWhile = function(obj, $event) {
      alert(1);
      console.info($event.target);
      setTimeout(function(){
        $($event.target).focus();
      },5); 
   };


   $scope.jsDoSave = function(elm, scope) {
     var changes = {id: $scope.do.id};
     var changed = false;

     console.info("!",elm, scope);

     $(".do_date2:focus").blur();


     angular.forEach($scope.do, function(value, key){
       if( ($scope.backup_copy[key] != value) && !(/^_/.test(key)) ) {
        changes[key] = value;
        changed = true;
       }
     });

     console.info("DIF = ", changes);

     if(changed) {
        console.info("cl_id=",$scope.client.id);
        myApi.saveDo($scope, changes, $scope.client.id).then(function(client_back){
          $scope.backup_copy = angular.copy( $scope.do );
          $scope.client.na_date = client_back[0].na_date; 
          $("#myfullcalendar").fullCalendar("refetchEvents");

          setTimeout(function(){ if($scope.jsLoadStat) $scope.jsLoadStat(); 
            $scope.jsRefreshDo($scope);
            console.info($scope.manager_filter)
          },500);
          //$scope.setX($scope.client.id, client_back[0]);


        });

     }

   }
   $scope.jsDoCancel = function() {
    console.info(angular.copy( $scope.backup_copy ));
    $scope.do = angular.copy( $scope.backup_copy );
   }

}




