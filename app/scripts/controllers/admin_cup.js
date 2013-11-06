//#fpk/admin_cup

myApp.controller('adminCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {

 	$scope.fpk.leftmenu = { active:1,
                items : [
                  {id:10, title:"Учёт трафика", href: "/fpk/admin_cup", segment: "s1.admin_cup"}
                ]

                };

    //$scope.fpk.init1();

    $("#edit_admin_cup").on("click",function(){
        $("td").attr("contenteditable", "true");
    });

    $scope.show_more = false;

    $scope.jsTriggerMore = function() {
        $scope.show_more=!$scope.show_more;
    }

    $scope.jsEffectDay = function(model) {
        if(model.zv+model.vz == 0) return '';
        return parseInt(100*(model.zv_manager+model.vz_manager)/(model.zv+model.vz))+"%";
    }

    $scope.jsEffectMonth = function(model) {
        //model.zv_manager_month+model.vz_manager_month

        if(model.zv_month+model.vz_month == 0) return '';
        return parseInt(100*(model.zv_manager_month+model.vz_manager_month)/(model.zv_month+model.vz_month))+"%";
    }

    $scope.jsEffectDayTest = function(model) {
        if(model.vz == 0) return '';
        return parseInt(100*(model.tst_manager)/(model.vz))+"%";
    }

    $scope.jsEffectMonthTest = function(model) {
        //model.zv_manager_month+model.vz_manager_month

        if(model.vz_month == 0) return '';
        return parseInt(100*(model.tst_manager_month)/(model.vz_month))+"%";
    }

    $scope.jsEffectDayDg = function(model) {
        if(model.vz+model.zv == 0) return '';
        return parseInt(100*(model.dg)/(model.vz + model.zv))+"%";
    }

    $scope.jsEffectMonthDg = function(model) {
        //model.zv_manager_month+model.vz_manager_month

        if(model.vz_month + model.zv_month == 0) return '';
        return parseInt(100*(model.dg_month)/(model.vz_month+model.zv_month))+"%";
    }

    $scope.jsEffectDayVd = function(model) {
        if(model.zv+model.vz == 0) return '';
        return parseInt(100*(model.vd)/(model.vz + model.zv))+"%";
    }

    $scope.jsEffectMonthVd = function(model) {
        //model.zv_manager_month+model.vz_manager_month

        if(model.vz_month+model.zv_month == 0) return '';
        return parseInt(100*(model.vd_month)/(model.vz_month+model.zv_month))+"%";
    }

    $scope.jsDoTypeText = function(type) {
        if(type == "zv") return "Звонок";
        if(type == "vz") return "Визит первичный";
        if(type == "vz2") return "Визит вторичный";
        if(type == "tst") return "Тест-драйв";
    }

    $scope.jsEditAdminDo = function(mydo) {
          if( $scope.fpk.the_user.rights[0].can_edit_admin != 1 ) {
            alert("У вас нет прав редактировать трафик. Обратитесь к администратору или руководителю.");
            return true;
          }

        $scope.edit_mydo = mydo;
        $scope.cup_new_show=true;
    }

    $scope.jsLoadAdmin = function(){
        var dfd = $.Deferred();
        $scope.fpk.models_array_show = _.filter($scope.fpk.models_array, function(el){ return ( (el.brand == $scope.fpk.brand) && (el.show == 1)); });

        myApi.jsGetManagerCupAdmin($scope).then(function(admin){
            $scope.admin = admin.admin;
//            $scope.admin_models = admin.admin_models;
  //          $scope.admin_commercials = admin.admin_commercials;
            //alert(admin.admin_models.length);
            dfd.resolve();
        })        
        return dfd.promise();
    }


    $scope.jsLoadAdminReport = function(){
        var dfd = $.Deferred();
        $scope.fpk.models_array_show = _.filter($scope.fpk.models_array, function(el){ return ( (el.brand == $scope.fpk.brand) && (el.show == 1)); });

        myApi.jsGetManagerCupAdminReport($scope).then(function(admin){
            $scope.admin_models = admin.admin_models;
            $scope.admin_commercials = admin.admin_commercials;
            $scope.admin_users = admin.admin_users;
            //alert(admin.admin_models.length);
            dfd.resolve();
        })        
        return dfd.promise();
    }

    $scope.jsSaveAdmin = function(edit_mydo){


          var changes = {};
          $.each(edit_mydo, function(key,value){
             //console.info(key, value, _.isArray(value) );
             if( !(_.isArray(value)) && !(/^\$/.test(key)) && !(/^\_/.test(key)) && !(/^na/.test(key)) ) {
                changes[key] = value; 
             }
             
          });

          console.info("changes = ", changes);

          
          myApi.saveAdmin($scope, changes).then(function(value){
            if(value.affectedRows>0) {
              $scope.cup_new_show=false;
              $scope.jsLoadAdmin();              
            }
            else alert("Не могу отправить данные на сервер");
          });


    }

    $scope.jsLoadAdmin();

    $scope.$watchCollection("[fpk.brand, fpk.today_date]",function(){
        $scope.jsLoadAdmin();
        if($scope.admin_models) $scope.jsLoadAdminReport();
    })

    $scope.jsSign = function(a, b) {
        answer = "";
        if( !a && !b ) return " ";
        if(a>b) {
            answer = ">";
        } else if (a==b) {
            answer = "=";
        } else if (a<b) {
            answer = "<";
        }
        return answer;
    }

    $scope.jsAddAdminDo = function(manager_id, type_do) {
          if( $scope.fpk.the_user.rights[0].can_edit_admin != 1 ) {
            alert("У вас нет прав добавлять трафик. Обратитесь к администратору или руководителю.");
            return true;
          }
          myApi.addAdmin($scope, manager_id, type_do).then(function(answer){
            var insertId = answer.insertId;
            $scope.jsLoadAdmin().then(function(){

                $.each($scope.admin, function(i, el){
                    $.each(el.mydo, function(j, mydo) {
                        if(mydo.id==insertId) {
                            $scope.edit_mydo = mydo;
                            el._visible = true;
                        }
                    })
                });
                $scope.cup_new_show=true;                
            });
          });
    }

    $scope.jsDelAdmin = function(mydo_id) {
        if(confirm("Действительно удалить действие №"+mydo_id+"?"))
          myApi.deleteAdmin($scope, mydo_id).then(function(answer){
            $scope.jsLoadAdmin().then(function(){
            $scope.cup_new_show=false;
            });
          });
    }

    $scope.jsCloseAdminDo = function() {
    	$scope.cup_new_show=false;
    }


});