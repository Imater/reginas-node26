//#/login

myApp.controller('loginCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment, oAuth2) {

 var user_last_email = localStorage.getItem("user_last_email");


 if($routeSegment.startsWith('user')) {
  localStorage.removeItem("oauth2");
 }

 $scope.reg_user = {
 	email: user_last_email?user_last_email:"",
 	email_ok: false,
 	password: "",
 	password_ok: false,
 	password2: "",
 	password2_ok: false,
 	password_login: "",
 	brand: 1,
 	fio: "",
 	fio_ok: false,
 	phone: "",
 	phone_ok: false,
 	users_group: 6
}

 $scope.$watch('reg_user', function(nVal){
 	if( (/@/.test( $scope.reg_user.email )) && ($scope.reg_user.email.length>5) && (/\./.test( $scope.reg_user.email ))) {
 		$scope.reg_user.email_ok = true;
 	} else {
 		$scope.reg_user.email_ok = false; 		
 	}
 	if( ($scope.reg_user.password == $scope.reg_user.password2) && ($scope.reg_user.password.length>3) ) {
 		$scope.reg_user.password_ok = true;
 		$scope.reg_user.password2_ok = true;
 	} else {
 		$scope.reg_user.password_ok = false;
 		$scope.reg_user.password2_ok = false;
 	}

 	if( ($scope.reg_user.fio.length>5) ) {
 		$scope.reg_user.fio_ok = true;
 	} else {
 		$scope.reg_user.fio_ok = false;
 	}

 	if( ($scope.reg_user.phone.length==11) ) {
 		$scope.reg_user.phone_ok = true;
 	} else {
 		$scope.reg_user.phone_ok = false;
 	}



 }, true);

 $scope.jsKeyEnter = function(event) {
 	if(event.charCode==13) {
 		$scope.jsLoginNow();
 	}

 }

 $scope.jsRegCheck = function() {
 	if(
 	   $scope.reg_user.fio_ok &&
 	   $scope.reg_user.password_ok &&
 	   $scope.reg_user.email_ok) {
 	  	return false;	
 	} else {
 		return true;
 	}
 	
 }

 $scope.jsRegNew = function() {
 	myApi.regNewUser($scope).then(function(answer){
    alert("Вы успешно зарегистрировались. Теперь вводите пароль и входите.");
    window.location.hash = "#/user/login";
  });
 };


 $scope.jsLoginNow = function() {
 	
    oAuth2.jsLogin($scope, hex_md5($scope.reg_user.email.toLowerCase()+'990990'), hex_md5($scope.reg_user.password_login) ).done( function(answer){ 
      	localStorage.setItem("user_last_email",$scope.reg_user.email);
        //$scope.fpk.jsRefreshUserInfo();
        //$scope.init_first();
        $scope.init().done(function(){
          window.location.hash = "#/fpk/clients";  
        });
        
        console.info(answer);
    }).fail(function(){
      bootstrap_alert.warning("Пароль или логин содержат ошибку"); 
    });

 };

 $scope.jsFilterUsersGroup = function() {
 	return function(group) {
 		return (group.show == 1);
 	}
 }

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
    $scope.models = answer;
    $scope.brands = answer2;
    $scope.users_group = answer3;
    $scope.users_groups = data.users_group;
 });


});