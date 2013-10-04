if( /reginas/.test(window.location.hostname) ) var add = ":8880"
else add = "";

var oauth2server = "http://"+window.location.hostname+add+"/";


function jsLogin(email1, password) {
	var dfd = new $.Deferred();
	var email = $("#email").val();
	var pass = $("#password").val();

	var md5email = email1?email1:hex_md5(email+'990990');
	var passw = password?password:hex_md5(pass);


var params_get = 'grant_type=password&username='+md5email+
									'&password='+passw+
									'&client_id=4tree_web'+
									'&client_secret=4tree_passw'+
									'&secret='+Math.random();
									

	$.ajax({
	    url: oauth2server+"oauth2/token.php",
	    type: "POST",
	    dataType: "json",
	    jsonp: false,
	    cache: false,
	    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	    data: params_get,
	    processData: false,
	    cache: true,
	    success: function (data) {
	        console.log("success");
	        localStorage.setItem( "oauth2", JSON.stringify(data) );
	        dfd.resolve(data);

	    },
	    abort: function (data) {
	        console.log("abort");
	        dfd.resolve(false);
	    },
	    error: function (data) {
	        console.log("error");
	        dfd.resolve(false);
	    }
	});

return dfd.promise();
}




function jsGetToken($scope) {
	var dfd = new $.Deferred();

	$scope.fpk.init.done(function(){ 

		var oauth2 = localStorage.getItem( "oauth2" );
		if(oauth2) {
			data = JSON.parse(oauth2);
			
			
			var dif = jsNow() - (data.start_time + data.expires_in*1000);
			
			//проверяем, просрочен ли Token
			if( dif > -10000 ) { 
				jsRefreshToken().done(function(data){
					console.info("Token устарел! Получил новый. "+data.access_token);
					dfd.resolve(data.access_token);
				});
			} else {
				//console.info("Token свежий :"+data.access_token);			
				dfd.resolve( data.access_token );
			}
			
		} else {
		     //window.location.href = "./login.php?dont_have_token";
		     window.location.hash = "#/user/login";
		}
		
	});
	
	return dfd.promise();
}




function jsRefreshToken() {
	var dfd = new $.Deferred();

	//Проверка токена
	//Request Access Token
	
	console.info("Start_refresh_token");

	var oauth2 = localStorage.getItem( "oauth2" );

	if( oauth2 ) {
				var oauth2data = JSON.parse(oauth2);

var params_get = 'grant_type=refresh_token'+
									'&client_id=4tree_web'+
									'&client_secret=4tree_passw'+
									'&refresh_token='+oauth2data.refresh_token;

	$.ajax({
	    url: oauth2server+"oauth2/token.php",
	    type: "POST",
	    dataType: "json",
	    jsonp: false,
	    cache: false,
	    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	    data: params_get,
	    processData: false,
	    cache: true,
	    success: function (data) {
	        console.log("success");
//	        console.info(data);
			data.start_time = jsNow();
	        localStorage.setItem( "oauth2", JSON.stringify(data) );
	        dfd.resolve(data);
	    },
	    abort: function (data) {
	        console.log(data);
	        console.log("abort");
	    },
	    error: function (data) {
	        console.log("error");
	        console.info(data.responseText);
	        //window.location.href = "../login.php?refresh_token_expired"+data.responseText+":"+oauth2data.refresh_token;
	    }
	});


	} else {
		//window.location.href="./login.php";
		//Нужно залогиниться!
	}
	return dfd.promise();
}



function jsGetMyFirstToken() {

	//Проверка токена
	//Request Access Token

	var oauth2 = localStorage.getItem( "oauth2" );

	if( oauth2 ) {
				var oauth2data = JSON.parse(oauth2);

			var params_get = 'access_token='+oauth2data.access_token+'&secret='+Math.random();

				$.ajax({
				    url: oauth2server+"oauth2/resource.php",
				    type: "GET",
				    dataType: "text",
				    jsonp: false,
				    cache: false,
				    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
				    data: params_get,
				    processData: false,
				    cache: true,
				    success: function (data) {
				        console.log("success");
				    },
				    abort: function (data) {
				        console.log(data);
				        console.log("abort");
				    },
				    error: function (data) {
				        console.log("error");
				        console.info(data.responseText);


				    }
				});
	}
}