var express = require('express'),
	app = express(),
	fs = require("fs"),
	server = require('http').createServer(app),
	qs = require('querystring'),
	io = require('socket.io').listen(server, {log:false});

var mysql      = require('mysql');


//connection.connect();	
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'See6thoh',
  database : 'h116'
});

var $ = require('jquery');

var mdb, collection;
var MongoClient = require('mongodb').MongoClient, format = require('util').format;    

  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if(err) throw err;

    mdb = db;
    collection = mdb.collection('myalldata');
    collection_mail = mdb.collection('mymail');
  });


app.configure(function() {
    app.use(express.static(__dirname + '/public'));
});

app.use(express.bodyParser());


var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config-s3.json');

var s3 = new AWS.S3();


s3.createBucket({Bucket: 'upload.4tree.ru'}, function() {
  var params = {Bucket: 'upload.4tree.ru', Key: 'myKey', Body: 'Hello!'};
  s3.putObject(params, function(err, data) {
    if (err)
      console.log(err)
    else
      console.log("Successfully uploaded data to myBucket/myKey");
  });
});

var the_socket;


function Report(socket) {
	//Обрабатываем данные синхронизации
	this.sync_answer = function(data) {

		var dfdArray = [];
		var rows = {};
		$.each(data.notes, function(i,el) {
			dfdArray.push( jsFindById(el.id).done(function(row){
				rows[el.id] = row;
			}) );
		});

		the_socket = socket;
		$.when.apply( null, dfdArray ).then(function(){
			//в rows теперь все данные из базы для изменённых заметок
			//перебираем элементы, которые изменились позже базы
			var dfdArray = [];
			$.each(data.notes, function(i, el_client){
				var el_server = rows[el_client.id][0];
				
				if(el_client.changetime > el_server.changetime) {
					//сохраняем данные в базе сервера
					collection.update({id: el_server.id},{ $set: el_client }, function(err,rows){
						if(rows) console.info("Сохранил - "+el_server.id);
					});	



				} else {
					//сохранять нельзя, данные уже изменились другим клиентом. Только бекап.
					console.info("Данные в базе свежее, чем присланные: ", el_server.id);
		
				}

			});
			the_socket.emit( 'sync_answer', {data: rows} );
		});

	} //sync_answer
}

//нахожу одну заметку в базе
function jsFindById(id) {
	var dfd = $.Deferred();

    collection.find({id:id}).toArray(function (err, rows, fields) {
		//response.send(rows);
		dfd.resolve(rows);
  	});	

/*	connection.query('SELECT * FROM `tree` WHERE id = ? LIMIT 1', [id], function (err, rows, fields) {
		dfd.resolve(rows);
  	});	
*/
	return dfd.promise();
}

io.sockets.on('connection', function(socket) {

	report = new Report(socket);

	socket.on('createNote', function(data) {
		socket.broadcast.emit('onNoteCreated', data);
	});


	socket.on('sync', function(data) {
		report.sync_answer(data);		
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

io.set('log level', 3); // reduce logging


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

/*exports.findAllMessages = function(request,response) {
	var user_id = request.query.user_id;
    var tm = ( (new Date()).getTime() );
    connection.query('SELECT * FROM `tree` WHERE user_id = ? AND del="" LIMIT 60000', [user_id] , function (err, rows, fields) {
		    console.info( ( (new Date()).getTime() ) -tm);
		    response.send(rows);
  	});	
}
*/

exports.findAllMessages = function(request,response) {
	var user_id = parseInt( request.query.user_id );
    var collection = mdb.collection('myalldata');

    var tm = ( (new Date()).getTime() );
    collection.find({user_id:user_id, del:0}).toArray(function (err, rows, fields) {
	    console.info( ( (new Date()).getTime() ) -tm);
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




exports.saveFile = function(request, response) {

	console.info(request.files);

        var path = request.files.file.path;
        fs.readFile(path, function(err, file_buffer){
        	var expire_date = ( new Date() );
        	expire_date.setDate( (new Date()).getDate() + 365*2 );

        	var file_name = "myKey1234.png";

            var params = {
            	ACL: 'public-read',
                Bucket: 'upload.4tree.ru',
                Key: file_name,
                ContentType: request.files.file.type,
                Expires: expire_date,
                Body: file_buffer
            };

            s3.putObject(params, function (perr, pres) {
                if (perr) {
                    console.log("Error uploading data: ", perr);
                } else {
                    console.log("Successfully uploaded data to myBucket/myKey");
                }
            });
        });


	var answer = {"filelink":"http://z6.d.sdska.ru/2-z6-7d6a8c21-213d-494b-a6b8-f71e9f761512.jpg",
				  "filename":"File.jpg"};




	response.send(answer);
}


exports.loadAllFromMySQL = function(request, response) {

    

    connection.query('SELECT * FROM `tree`', function (err, rows, fields) {

		$.each(rows, function(i, el){
			console.info(el);
		    collection.insert(el, function(err, docs) {
			response.send(docs);	
		});
	  	//response.send(r);
  	});	


});
}


app.get('/migrate', database.loadAllFromMySQL)

app.get('/api/v1/message', database.findAllMessages );
app.get('/api/v1/message/:id', database.findMessageById );

app.post('/api/v1/message', database.newMessage );

app.post('/api/v1/save_file', database.saveFile )

app.put('/api/v1/message/:id', database.findMessageById );

app.delete('/api/v1/message/:id', database.findMessageById );




app.configure(function() {
    app.use(express.static(__dirname + '/../app'));
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

var Imap = require('imap'),
    inspect = require('util').inspect;
var MailParser = require("mailparser").MailParser;


var MailListener = require("mail-listener");

var mailListener = new MailListener({
  username: "4tree",
  password: "uuS4foos_VE",
  host: "mail.4tree.ru",
  port: 993, // imap port
  secure: false, // use secure connection
  mailbox: "INBOX", // mailbox to monitor
  markSeen: false, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: true // use it only if you want to get all unread email on lib start. Default is `false`
});

var notifier = require('mail-notifier');

var imap = {
  username: "4tree@4tree.ru",
  password: "uuS4foos_VE",
  host: "mail.4tree.ru",
  port: 993, // imap port
  secure: true // use secure connection
};

notifier(imap).on('mail',function(mail){

	console.info(mail, mail.attachments[0].content);

s3.createBucket({Bucket: 'upload.4tree.ru'}, function() {
  $.each(mail.attachments, function(i,el){
	  var params = {Bucket: 'upload.4tree.ru', Key: el.fileName, Body: el.content,ContentType: el.contentType, ACL: 'public-read'};
	  s3.putObject(params, function(err, data) {
	  	//the_socket.broadcast.emit('EMAIL', data);
	    if (err)
	      console.log(err)
	    else 
	      console.log("Successfully uploaded data: "+el.fileName);
	  });

  });
});

	console.info("------------");
	collection_mail.insert({mail: mail}, function(){});
}).start();


