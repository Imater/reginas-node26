//Все функции для Api Rest

global.isProduction = true;

exports.findCalendar = function(request,response) {
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

    pool.query('SELECT 1_do.*, 1_clients.fio, 1_clients.icon2, 1_models.short, 1_users.fio man FROM 1_do LEFT JOIN 1_clients ON 1_do.client = 1_clients.id LEFT JOIN 1_models ON 1_models.id =1_clients.model LEFT JOIN 1_users ON 1_do.manager_id = 1_users.id WHERE '+insert_sql+' 1_do.brand = ? AND 1_do.date2>= ? AND 1_do.date2<= ? '+checked_sql, [ brand, start_date, end_date] , function (err, rows, fields) {
    		rows = correct_dates(rows);
		    response.send(rows);
  	});	
}