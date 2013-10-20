//Все функции для Api Rest
var $ = require('jquery');
var _ = require('underscore');

exports.findCalendar = function(request,response) {
	var dfdArray = [];

	var user_id = request.query.user_id;
	var start_date = request.query.start_date;
	var end_date = request.query.end_date;
	var brand = request.query.brand;
	var manager_id = request.query.manager;

	var calendar_do_type = request.query.calendar_do_type;
	checked_sql = ' AND 1_do.checked = "0000-00-00 00:00:00" ';

	var insert_sql = " true AND ";
	if(manager_id>0) insert_sql = "true AND 1_do.manager_id = '"+manager_id+"' AND ";

	if(calendar_do_type == "vd") {
		insert_sql += " 1_do.`type` = 'Выдача' AND ";
		checked_sql = "";
	} else if(calendar_do_type == "tst") {
		insert_sql += " 1_do.`type` = 'Тест-драйв' AND ";
		checked_sql = "";
	} else if(calendar_do_type == "credit") {
		insert_sql += " 1_do.`type` = 'Кредит' AND ";
		checked_sql = "";
	}


	var answer = [];

	if(calendar_do_type == "vd") {
		function f1(){
			var dfd = new $.Deferred();

			var month = (new Date).getMonth(); // January
			var d = new Date( (new Date).getFullYear(), month + 1, 0);
			var last_day = tomysql(d);

		    pool.query('SELECT 1_clients.id client, 1_clients.manager_id, 1_do.type, CONCAT("Вероятность выдачи: ",1_clients.icon2) text, 1_models.short, "0000-00-00 00:00:00" checked,  "2013-10-31 00:00:00" date2, 1_clients.fio FROM 1_clients LEFT JOIN 1_models ON 1_models.id = 1_clients.model LEFT JOIN 1_users ON 1_clients.manager_id = 1_users.id LEFT JOIN 1_do ON 1_do.client = 1_clients.id AND 1_do.type="Выдача" WHERE 1_clients.brand = ? AND 1_clients.icon2>2 AND 1_clients.vd="0000-00-00 00:00:00" ORDER by 1_clients.icon2', [ brand ] , function (err, clients, fields) {
		    	clients = _.filter(clients, function(cl){ console.info(cl['type']); return !cl['type'] })
			    dfd.resolve(clients);
	    	});

			return dfd.promise();
		}		
		dfdArray.push(f1());
	}

	function f2(){
		var dfd = new $.Deferred();
		   pool.query('SELECT 1_do.*, 1_clients.fio, 1_clients.icon2, 1_models.short, 1_users.fio man FROM 1_do LEFT JOIN 1_clients ON 1_do.client = 1_clients.id LEFT JOIN 1_models ON 1_models.id =1_clients.model LEFT JOIN 1_users ON 1_do.manager_id = 1_users.id WHERE '+insert_sql+' 1_do.brand = ? AND ((1_do.date2>= ? AND 1_do.date2<= ?) OR (icon2>2 AND vd="0000-00-00 00:00:00") ) '+checked_sql+'', [ brand, start_date, end_date] , function (err, rows, fields) {

		    		rows = correct_dates(rows);
				    dfd.resolve(rows);

		  	});
  		return dfd.promise();
  	};

  	dfdArray.push(f2());

  	$.when.apply(null, dfdArray)
  		.pipe(function(){
    		return $.map(arguments, function(item){return item});
		})
		.then(function(p1){
	    response.send(p1);
  	});
}