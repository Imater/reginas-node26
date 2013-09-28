//#fpk/clients

myApp.controller('clientsCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {







 $scope.$parent.leftmenu = { active:1,
                items : [
                  {id:0, title:"В работе", group_by: "manager", 
                   filter: {no_out: true, no_dg: true, no_vd:true}},

                  {id:1, title:"Договора", group_by: "manager", 
                   filter: {no_out: true, dg: true, no_vd:true}},

                  {id:2, title:"Выданы", group_by: "vd", 
                   filter: {no_out: true, no_dg: false, vd:true}},

                  {id:3, title:"Кредиты", group_by: "creditmanager", 
                   filter: {no_out: true, no_dg: true, no_vd:true, credit: true}},

                  {id:4, title:"Out", group_by: "manager", 
                   filter: {out: true}},

                  {id:5, title:"Администратор", group_by: "manager"}
                  ]
                };

  $scope.jsLoadStat = function() {
    if($scope.brand) {
        myApi.getStat($scope).then(function(result){
            $scope.$parent.stat = result;
        });    
    }
  }

  $scope.jsLoadStat();

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
          query.limit.start = LIST_LENGTH*$scope.clients_current_i;
          query.limit.end = LIST_LENGTH;


          myApi.getClient( $scope, query ).then(function(result){
            angular.forEach(result, function(value, key){
              if($scope.clients) $scope.clients.push( value );  
            });
            

            $scope.clients_current_i += 1;

          });
   };


  var tm_search;
  $scope.startSearch = function(searchstring) {
    clearTimeout(tm_search);
    tm_search = setTimeout(function(){
      if(searchstring.length>3) {
          myApi.searchString($scope, searchstring).then(function(result){
            $scope.clients = result;
          });
      }
    },1000);
  }



  
});









myApp.directive("clientList", function ($compile, myApi) {
  return {
//    template: '{{local_clients}} {{local_clients.length}} hi!', 
    templateUrl: 'views/client_list.html',
    restrict: 'A',
    scope: {
      local_clients: "=myAttr",
      distinct: "=myDistinct"
    },
    link: function ($scope, elm, attrs, clients) {
        $scope.models = $scope.$parent.models;
        $scope.models_array = $scope.$parent.models_array;
        $scope.car_status = $scope.$parent.car_status;
        $scope.car_status_array = $scope.$parent.car_status_array //глобальные статусы

        $scope.clientsgroupby = $scope.$parent.clientsgroupby //глобальные статусы
        console.info("...",$scope.clientsgroupby);

        $scope.do_types = $scope.$parent.do_types;
        $scope.do_types_array = $scope.$parent.do_types_array;

        $scope.jsLoadStat = $scope.$parent.jsLoadStat;
        $scope.stat = $scope.$parent.stat;

        $scope.models_array_show = _.filter($scope.$parent.models_array, function(el){ return ( (el.brand == $scope.$parent.brand) && (el.show == 1)); });


         var indexedTeams = [];       

         $scope.clientsToFilter = function() {
                indexedTeams = [];

                //console.info("make_group", $scope.clientsgroupby);

                answer = _.filter($scope.local_clients, function(client){

                  if( $scope.clientsgroupby == 'vd' ) {
                    if(client.vd && indexedTeams.indexOf(client.vd.substr(0,7))==-1) {
                      indexedTeams.push(client.vd.substr(0,7));
                      return true;
                    }

                  } else {
                    if(indexedTeams.indexOf(client[$scope.clientsgroupby])==-1) {
                      indexedTeams.push(client[$scope.clientsgroupby]);
                      return true;
                    }

                  }


                });

                return answer;
         }        


        //фильтр для выбора уникальных групп менеджеров или дат
         $scope.jsGetDistinctTitle = function(distinct) {
            var group_by = $scope.clientsgroupby;
            var answer = distinct[group_by];
            if(group_by == "vd") {
              answer = answer.substr(0,7);
              var an = answer.split("-");
              answer = an[1]+"-"+an[0];
            }
            return answer;
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
            if(value.affectedRows>0) client._edit = false;
            else alert("Не могу отправить данные на сервер");
          });
        }


        $scope.jsFilterClients111 = function(distinct) {
          return function(item) {
              
              var fieldname = $scope.clientsgroupby ? $scope.clientsgroupby:"manager";

              var compare
               = true;
              if( $scope.$parent.leftmenu.active == 2) {

                compare = compare && 
                    (item.vd.substr(0,7)==distinct.vd.substr(0,7));

              } else if( $scope.$parent.leftmenu.active == 3) {
                compare = compare && 
                    (item.creditmanager==distinct.creditmanager);
              } else if(distinct) compare = (item.manager == distinct.manager);
              if(compare) return true;
              else return false;
            }
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

          myApi.addDo(scope, do_type_title, client_id).then(function(result){
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

   $scope.models = $scope.$parent.models;
   $scope.models_array = $scope.$parent.models_array;
   $scope.car_status = $scope.$parent.car_status;
   $scope.car_status_array = $scope.$parent.car_status_array;

   $scope.do_types_array = $scope.$parent.do_types_array;

   $scope.jsLoadStat = $scope.$parent.jsLoadStat;
   $scope.stat = $scope.$parent.stat;


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
          setTimeout(function(){ if($scope.jsLoadStat) $scope.jsLoadStat(); },500);
          //$scope.setX($scope.client.id, client_back[0]);


        });

     }

   }
   $scope.jsDoCancel = function() {
    console.info(angular.copy( $scope.backup_copy ));
    $scope.do = angular.copy( $scope.backup_copy );
   }

}




