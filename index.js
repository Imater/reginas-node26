var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	qs = require('querystring'),
	io = require('socket.io').listen(server);

var mysql      = require('mysql');


//connection.connect();	
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'See6thoh',
  database : 'h116'
});

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
});

io.sockets.on('connection', function(socket) {
	socket.on('createNote', function(data) {
		socket.broadcast.emit('onNoteCreated', data);
	});

	socket.on('updateNote', function(data) {
		socket.broadcast.emit('onNoteUpdated', data);
	});

	socket.on('moveNote', function(data){
		socket.broadcast.emit('onNoteMoved', data);
	});

	socket.on('deleteNote', function(data){
		socket.broadcast.emit('onNoteDeleted', data);
	});
});

database = exports;

app.get("/api/v1/user_:user_id/time_:lasttime/:action", function(request, response) {
  database.findAllContinents(request,function(err, results) {
    if (err)
      throw err; // or return an error message, or something
    else
      response.send(results); // as a demo, we'll send back the results to the client;
                         // if you pass an object to 'res.send()', it will send
                         // a JSON-response.
  });
});

exports.findAllMessages = function(request,response) {
	var user_id = request.query.user_id;
    connection.query('SELECT * FROM `tree` WHERE user_id = ? AND del="" LIMIT 60000', [user_id] , function (err, rows, fields) {
		    response.send(rows);
  	});	
}

exports.findMessageById = function(request,response) {
	var user_id = request.query.user_id;
    connection.query('SELECT * FROM `4_chat` WHERE id = ? AND user_id = ?', [request.params.id, user_id] , function (err, rows, fields) {
		    response.send(rows);
  	});	
}

exports.newMessage = function(request,response) {
	var user_id = request.query.user_id;
	var body = '';
	request.on('data', function(data){
		body += data;
		if (body.length > 1e6) { 
                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                request.connection.destroy();
        }		
	});
	request.on('end', function(data){
		var post_data = JSON.parse(body);
	    connection.query('INSERT INTO `4_chat` SET text = ?, user_id = ?, to_user_id = ?, change_time = ?', [post_data.text, post_data.user_id, post_data.to_user_id, post_data.change_time ] , function (err, rows, fields) {
			    //response.send(rows);
			    var new_id = rows.insertId;

			    console.info(post_data.lastTime);
			    connection.query('SELECT * FROM `4_chat` WHERE id = ? OR ((user_id = ? OR to_user_id = ?) AND (change_time> ?)) ', [new_id, post_data.user_id, post_data.user_id, post_data.lastTime] , function (err, rows, fields) {
					    response.send(rows);
				});	


	  	});	
	});

}


app.get('/api/v1/message', database.findAllMessages );
app.get('/api/v1/message/:id', database.findMessageById );

app.post('/api/v1/message', database.newMessage );

app.put('/api/v1/message/:id', database.findMessageById );

app.delete('/api/v1/message/:id', database.findMessageById );




app.configure(function() {
    app.use(express.static(__dirname + '/app'));
});


exports.findAllContinents = function(request,cb) {
  var query = request.query;
  var params = request.params;
  console.info("request = ",query, "params = ",params);
  if(!query.t) query.t = 0;

  if(params.action=="save_message") {
  			  connection.query('SELECT * FROM `4_chat` WHERE user_id=? OR to_user_id=?', [params.user_id,params.user_id] , function (err, rows, fields) {
		    // close connection first
		    //closeConnection(connection);
		    // done: call callback with results
		    //    connection.end();
			//находим поле, где перечислены все друзья текущего пользователя

		    cb(err, rows);

  });
  }

  if(params.action=="users") {
		  connection.query('SELECT * FROM `4_users`', [params.lasttime] , function (err, rows, fields) {
		    // close connection first
		    //closeConnection(connection);
		    // done: call callback with results
		    //    connection.end();
			//находим поле, где перечислены все друзья текущего пользователя
			var myfrends = "";
			for ( var key in rows ) {
			    if ( Object.prototype.hasOwnProperty.call(rows, key) ) {
			        var el = rows[key];
			        if(el.id == params.user_id) myfrends = el.frends;
			    }
			};
			
			//проставляем поле - является ли этот человек нашим другом
			for ( var key in rows ) {
			    if ( Object.prototype.hasOwnProperty.call(rows, key) ) {
			        var el = rows[key];
			        if(myfrends.indexOf(el.id) != -1) el.is_my_frend = true;
			        else el.is_my_frend = false;
			    }
			};		

		    cb(err, rows);
		  });
  }

  if(params.action=="chats") {
		  connection.query('SELECT * FROM `4_chat` WHERE user_id=? OR to_user_id=?', [params.user_id,params.user_id] , function (err, rows, fields) {
		    // close connection first
		    //closeConnection(connection);
		    // done: call callback with results
		    //    connection.end();
			//находим поле, где перечислены все друзья текущего пользователя

		    cb(err, rows);
		  });
  }



};

server.listen(1337);


