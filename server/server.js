var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
var $ = require('jquery');
var worker, workerAll = [];

if (cluster.isMaster) {

 // we create a HTTP server, but we do not use listen
  // that way, we have a socket.io server that doesn't accept connections
  var server = require('http').createServer();
  var io = require('socket.io').listen(server);
  var fs = require('fs');


var RedisStore = require('socket.io/lib/stores/redis');
var redis = require('socket.io/node_modules/redis');


var io = require('socket.io').listen(server, {log:false});

io.set('store', new RedisStore({
    redisPub: redis.createClient(),
    redisSub: redis.createClient(),
    redisClient: redis.createClient()
  }));

/*setInterval(function() {
    // all workers will receive this in Redis, and emit
    io.sockets.emit('data', 'payload');
  }, 1000);
*/
  // Fork workers.

  var workers = {};

  console.info("numCpus", numCPUs);
  //numCPUs = 1;
  for (var i = 0; i < numCPUs; i++) {
    worker = cluster.fork();
    workerAll.push(worker);
    workers[worker.pid] = worker;

	worker.on('message', function(msg) {
      // we only want to intercept messages that have a chat property
      if (msg) {
      	//оповещаем все процессоры 
        $.each(workerAll, function(i, work){
	        work.send( msg );
        });
      }
    });

  }


    var killWorkers = function(reason){
        return function(reason) {
            console.log('Killing because we received ' + reason);
            _.each(workers, function(w){
                w.kill();
                console.log('Killed worker ' + w.pid);
            });
            console.log('Shutting down master process');
            process.exit(1);
        };
    };

   process.on('uncaughtException', killWorkers('uncaughtException'));
   process.on('exit', killWorkers('exit'));

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
//    worker = cluster.fork();
    //workerAll.push(worker);
    killWorkers('exit');
  });

  cluster.on('fork', function(worker, address) {
    console.info(worker.id);
  });

} else {





////////////////////////////////////////////////////////////////////

var express = require('express'),
  app = express(),
  fs = require("fs"),
  server = require('http').createServer(app),
  qs = require('querystring');

var RedisStore = require('socket.io/lib/stores/redis');
var redis = require('socket.io/node_modules/redis');


var io = require('socket.io').listen(server, {log:false});

io.set('store', new RedisStore({
    redisPub: redis.createClient(),
    redisSub: redis.createClient(),
    redisClient: redis.createClient()
  }));


var NO_DATE = '0000-00-00 00:00:00';
var mysql      = require('mysql');
var md5 = require('MD5');
global.stat_cache = {};
global.stat_cache_cup = {};
var _ = require('underscore');

var restApi = require("./rest-api.js");

global.isProduction = false;
require("./isProduction.js");


var Pool = require('mysql-simple-pool');


if(!isProduction) console.info("Development mode");

global.pool = new Pool(100, {
  host     : '127.0.0.1',
  user     : 'root',
  password : 'See6thoh',
  database : 'h116'
});

mysqlconfig = {
  host     : '127.0.0.1',
  user     : 'root',
  password : 'See6thoh',
  database : 'h116'
};
//connection.connect(); 
var connection = mysql.createConnection(mysqlconfig);

var mdb, collection;

var MongoClient = require('mongodb').MongoClient, format = require('util').format;    

  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if(err) throw err;

    global.mdb = db;
    global.collection = global.mdb.collection('my_cache');   

  });


/*app.configure(function() {*/

app.configure(function(){
  
  app.use(express.compress());
  app.use(function(req, res, next) {


    res.setHeader("Access-Control-Allow-Origin", "*");
    if(/\.(png|jpg|jpeg|woff|gif)/ig.test(req.url)) {
      res.setHeader("Cache-Control", "public, max-age=17280000");
    } else if( /bower_components/ig.test(req.url) && !(/localhost/.test(req.headers.host)) ) {
      res.setHeader("Cache-Control", "public, max-age=280000");     
    } else if( /\.(js|css|html|json)/.test(req.url) && !(/localhost/.test(req.headers.host)) ) {
      res.setHeader("Cache-Control", "public, max-age=0");      
    } else {
      res.setHeader("Cache-Control", "public, max-age=0");      
    }

    res.setHeader("PROCESSOR", cluster.worker.id);      

    return next();
  });
//  app.use(express.static(__dirname + '/public'));
  //app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

/*    app.use(express.static(__dirname + '/public'));
    app.header("Access-Control-Allow-Origin", "*");
});*/

app.use(express.bodyParser());




  //центр пересылки сообщений по сокету
  process.on('message', function(msg) {

    if(msg.message_type) {
    	if(msg.message_type == "loadstat") {
	 	  	//global.report.loadstat();
	 	  	io.sockets.emit('loadstat', {brand: msg.brand});
    	} else if(msg.message_type == "chat") {
	 	  	//global.report.sendMessage( msg.chat ); //отправка алерта
	 	  	io.sockets.emit('sendmessage', {data: msg.chat});

    	}
    }

  });	



/*s3.createBucket({Bucket: 'upload.4tree.ru'}, function() {
  var params = {Bucket: 'upload.4tree.ru', Key: 'myKey', Body: 'Hello!'};
  s3.putObject(params, function(err, data) {
    if (err)
      console.log(err)
    else
      console.log("Successfully uploaded data to myBucket/myKey");
  });
});
*/
var the_socket;


function Report(socket) {
  //Обрабатываем данные синхронизации
  var tm_emit;
/*  this.sendMessage = function(text){
      socket.emit( 'sendmessage', {data: text} ); 
  }
  this.loadstat = function(user_id){
    clearTimeout(tm_emit);
    tm_emit = setTimeout(function(){
      //_sqllog({manager: user_id?user_id:"", text:"broadcast.emit( 'loadstat' )"});
      socket.emit( 'loadstat' );

    },5);
  }
*/  this.sync_answer = function(data, user_id) {
    var dfdArray = [];
    var rows = {};
    if(!user_id) {
      socket.emit( 'sync_answer', {err: "Token invalid..."} );
      return false;
    };
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
          if (el_server.user_id == user_id) {
            collection.update({id: el_server.id, user_id: user_id },{ $set: el_client }, function(err,rows){
              if(rows) console.info("Сохранил - "+el_server.id);
            }); 
          } else {
            console.info("Чужая запись, не сохраняю. Пользователь: "+el_server.user_id);

          }



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

/*  pool.query('SELECT * FROM `tree` WHERE id = ? LIMIT 1', [id], function (err, rows, fields) {
    dfd.resolve(rows);
    }); 
*/
  return dfd.promise();
}


io.sockets.on('connection', function(socket) {
  global.report = new Report(socket);

  socket.on('createNote', function(data) {
    socket.broadcast.emit('onNoteCreated', data);
  });


  socket.on('sync', function(data) {
    jsCheckToken(data.token, response).done(function(user_id){
        global.report.sync_answer(data, user_id);
    });
    
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

//отправкой SMS занимается только один процессор (сервер)
if(cluster.worker.id == 1) {
	setInterval(function(){ 
	  database.checkSMS();
	}, 60000);
}

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
    pool.query('SELECT * FROM `tree` WHERE user_id = ? AND del="" LIMIT 60000', [user_id] , function (err, rows, fields) {
        console.info( ( (new Date()).getTime() ) -tm);
        response.send(rows);
    }); 
}
*/

function jsCheckToken(token, response) {
  var dfd = new $.Deferred();

  //console.info("check_token");
    pool.query('SELECT *, NOW() FROM `oauth_access_tokens` WHERE access_token = ? AND expires >= DATE_ADD(NOW(), INTERVAL 0 HOUR) ', [token] , function (err, rows, fields) {

        if(rows && rows[0] && rows[0].user_id) {
          dfd.resolve( parseInt( rows[0].user_id ) );

          pool.query('UPDATE 1_users SET lastvizit = NOW() WHERE id= ? ', [rows[0].user_id] , function (err, rows, fields) {
          });

        } else {
          dfd.fail("Token invalid");
          response.send(401);
          console.info("Token invalid");
        }
    }); 
    return dfd.promise();

}

exports.findAllMessages = function(request,response) {
  jsCheckToken(request.query.token, response).done(function(user_id){
    if(user_id) {
        var collection = mdb.collection('myalldata');   

        var tm = ( (new Date()).getTime() );
      
        collection.find({user_id:user_id, del:0}).toArray(function (err, rows, fields) {
          //console.info( ( (new Date()).getTime() ) -tm);
        response.send(rows);
        }); 

    } else {
      response.send("Error. Token is not valid...");  
    }
  });
}



exports.findMessageById = function(request,response) {
  var user_id = request.query.user_id;
    pool.query('SELECT * FROM `4_chat` WHERE id = ? AND user_id = ?', [request.params.id, user_id] , function (err, rows, fields) {
        response.send(rows);
    }); 
}


exports.findDoById = function(request,response) {
  var user_id = request.query.user_id;
    pool.query('SELECT *, date2 _date2 FROM `1_do` WHERE client = ? ORDER by date2 DESC, id DESC', [request.params.id] , function (err, rows, fields) {
        rows = correct_dates(rows);
        response.send(rows);
    }); 
}



exports.getDo = function(request,response) {
  var user_id = request.query.user_id;
  var brand = request.query.brand;
  var manager_id = request.query.manager;

  var left_menu = request.query.left_menu;


  var insert_sql2 = '';
  if(left_menu==3) {
    insert_sql2 = ' AND 1_do.type = "Кредит" '; 
  } else if (left_menu==5) {
    insert_sql2 = ' AND 1_do.type = "Трейд-ин" '; 
  } else {

  }
  
  jsCheckToken(request.query.token, response).done(function(user_id){
    var insert_sql = "";
    if(manager_id>0) insert_sql = "1_do.manager_id = '"+manager_id+"' AND ";
    var query = 'SELECT 1_do.*, 1_clients.id, 1_clients.fio, 1_models.short, 1_users.fio man FROM 1_do LEFT JOIN 1_clients ON 1_do.client = 1_clients.id LEFT JOIN 1_models ON 1_models.id =1_clients.model  LEFT JOIN 1_users ON 1_do.manager_id = 1_users.id WHERE '+insert_sql+' 1_do.brand = ? AND 1_do.date2<= DATE_ADD(NOW(), INTERVAL 15 DAY) AND 1_do.checked = "0000-00-00 00:00:00" '+insert_sql2+' ORDER by date2';
      pool.query(query, [ brand ] , function (err, rows, fields) {
          rows = correct_dates(rows);
          response.send(rows);
      }); 
  });
}



connection.config.queryFormat = function (query, values) {
  if (!values) return query;
  return query.replace(/\:(\w+)/g, function (txt, key) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key]);
    }
    return txt;
  }.bind(this));
};


    connection.config.queryFormat = function (query, values) {
      if (!values) return query;
      return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
          return this.escape(values[key]);
        }
        return txt;
      }.bind(this));
    };


exports.searchString = function(request,response) {
  var user_id = request.query.user_id;
  var brand = request.query.brand;
  var search = request.query.search;

  //console.info("HI:",request.query);

  pool.query("SELECT DISTINCT(client) FROM 1_do WHERE brand = '"+brand+"' AND (text LIKE '%"+search+"%' OR comment LIKE '%"+search+"%') LIMIT 2000", 
    function (err, clients) {

    var ids = "(";
    $.each(clients, function(i, cl){
      ids += cl.client+",";
    });
    ids += " -1)";

    var sr = ("%"+search+"%");

      pool.query('SELECT * FROM `1_clients` WHERE id IN '+ids+' OR (brand = ? AND `out`="0000-00-00 00:00:00" AND '+
                '(fio like ? OR '+
                'phone1 like ? OR '+
                'phone2 like ? OR '+
                'phone3 like ? OR '+
                'phone4 like ? OR '+
                'vin like ? OR '+
                'comment like ? OR '+
                'adress like ?'+
                ')) LIMIT 2000', [brand, sr, sr, sr, sr, sr, sr, sr, sr] , function (err, rows, fields) {
          rows = correct_dates(rows);
          //console.info(err);
          response.send(rows);
      }); 

  });

}

exports.getAutocomplete = function(request,response) {

//  var user_id = request.query.user_id;
  var brand = request.query.brand;
  var search = request.query.searchtext;


  //console.info("HI:",request.query, search);

    var sr = (search+"%");

      pool.query('SELECT phone1, phone2, phone3, phone4, 1_clients.fio, 1_users.fio manager, 1_models.short FROM `1_clients` LEFT JOIN `1_users` ON 1_users.id = 1_clients.manager_id LEFT JOIN `1_models` ON 1_models.id = 1_clients.model WHERE (1_clients.brand = ? AND `out`="0000-00-00 00:00:00" AND '+
                '(1_clients.fio like ? OR '+
                'phone1 like ? OR '+
                'phone2 like ? OR '+
                'phone3 like ? OR '+
                'phone4 like ?'+
                ')) LIMIT 20', [brand, sr, sr, sr, sr, sr] , function (err, rows, fields) {
          rows = correct_dates(rows);
          //console.info(err);
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
      pool.query('INSERT INTO `4_chat` SET text = ?, user_id = ?, to_user_id = ?, change_time = ?', [post_data.text, post_data.user_id, post_data.to_user_id, post_data.change_time ] , function (err, rows, fields) {
          //response.send(rows);
          var new_id = rows.insertId;

          //console.info(post_data.lastTime);
          pool.query('SELECT * FROM `4_chat` WHERE id = ? OR ((user_id = ? OR to_user_id = ?) AND (change_time> ?)) ', [new_id, post_data.user_id, post_data.user_id, post_data.lastTime] , function (err, rows, fields) {
              response.send(rows);
        }); 


      }); 
  });

}




exports.saveFile = function(request, response) {

  //console.info(request.files);

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

        });


  var answer = {"filelink":"http://z6.d.sdska.ru/2-z6-7d6a8c21-213d-494b-a6b8-f71e9f761512.jpg",
          "filename":"File.jpg"};




  response.send(answer);
}


function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}
//Перевожу дату new Date в mySQL формат
global.tomysql = function(dat) {
  //dat = new Date(dat);
  if(dat == "0000-00-00 00:00:00") return dat;
    return dat.getFullYear() + "-" + twoDigits(1 + dat.getMonth()) + "-" + twoDigits(dat.getDate()) + " " + twoDigits(dat.getHours()) + ":" + twoDigits(dat.getMinutes()) + ":" + twoDigits(dat.getSeconds());
};

function frommysql(mysql_string)
{ 
   if(mysql_string == "") return false;
   
   if(typeof mysql_string === 'string')
   {
      var t = mysql_string.split(/[- :]/);

      //when t[3], t[4] and t[5] are missing they defaults to zero
      return new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);          
   }

   return null;   
}


exports.loadAllFromMySQL = function(request, response) {
//дописывает ноль к цифре

    

    pool.query('SELECT * FROM `tree`', function (err, rows, fields) {

    $.each(rows, function(i, el){
      //console.info("d",toMysql(el.date1));
      el.date1 = toMysql( el.date1 );
      el.date2 = toMysql( el.date2 );
      el.did = toMysql( el.did );
      el.adddate = toMysql( el.adddate );
      //el.date1
        collection.insert(el, function(err, docs) {
        response.send(docs);  
      });
    });
      //response.send(r);
    }); 
}


exports.loadAllBig = function(request, response) {
    

    pool.query('SELECT * FROM `1_clients` WHERE brand=1', function (err, rows, fields) {

      response.send(rows);
    }); 
}

global.correct_dates = function( rows, no_zero_dates ) {
  var fields = ['date', 'zv', 'vz', 'tst', 'dg', 'vd', 'out', 'checked', 'changed', 'created', 'date1', 'date2', 'hostcheck', 'remind', 'na_date', 'now_time', 'remind_time'];

  if(!rows) return rows;


  $.each(rows, function(j,el){
    $.each(fields, function(i, field){
      if(el[field]) {
        if((no_zero_dates) && (el[field]==NO_DATE) ) {
          el[field] = "";
        } else {
          el[field] = tomysql(el[field]); 
        }
        
      }
    });
  });

    return rows;
}




function jsNow() {
  return (new Date).getTime();
}

function jsMakeClientFilter(filter, manager_id) {
  var f_filter = filter.brand ? "brand = "+parseInt(filter.brand)+" AND ":"";

  f_filter += filter.no_out ? '`out` = "'+NO_DATE+'" AND ' : '';
  f_filter += filter.out ? '`out` != "'+NO_DATE+'" AND ' : '';

  f_filter += filter.no_vd ? '`vd` = "'+NO_DATE+'" AND ' : '';
  f_filter += filter.vd ? '`vd` != "'+NO_DATE+'" AND ' : '';

  f_filter += filter.no_dg ? '`dg` = "'+NO_DATE+'" AND ' : '';
  f_filter += filter.dg ? '`dg` != "'+NO_DATE+'" AND ' : '';

  f_filter += filter.bu ? '`bu` != "'+NO_DATE+'" AND ' : '';

  f_filter += (manager_id>0) ? ' manager_id = "'+manager_id+'" AND ' : '';

  f_filter += filter.credit ? '`creditmanager` LIKE "Кредит -%" AND ' : '';


  return f_filter;
}


exports.findAllClientsIds = function(request, response) {
  var manager = request.query.manager;
  var ids = request.query.ids;

  var myquery = "SELECT * FROM 1_clients WHERE id IN ("+ids+") ORDER by manager_id";

  jsCheckToken(request.query.token, response).done(function(user_id){

      pool.query(myquery, function (err, rows, fields) {
        rows = correct_dates( rows );
        response.send(rows);
      }); 
  });

}

exports.findAllClients = function(request, response) {

  var filter = request.query.filter ? JSON.parse(request.query.filter):{};
  var manager = request.query.manager;

  f_filter = jsMakeClientFilter(filter, manager);

  if(filter.group_by == "model") filter.group_by = "model` DESC, `manager_id";

  if(filter.group_by == "icon") filter.group_by = "icon` DESC, `manager_id";

  if(filter.group_by == "icon2") filter.group_by = "icon2` DESC, `model";

  var f_limit = filter.limit ? ' LIMIT '+filter.limit.start+','+filter.limit.end : ' LIMIT 100';

  var desc = "";
  if( ["vd","out","icon","icon2"].indexOf(filter.group_by)!=-1 ) desc=" DESC";

  var f_order = filter.group_by ? ' ORDER BY `'+filter.group_by+'` '+desc+', `date` DESC' : '';


  var myquery = 'SELECT * FROM `1_clients` WHERE ' + f_filter + " true " + f_order + f_limit;

//  console.info("MANAGER",manager, f_filter);

  //console.info("query = ", myquery);

  jsCheckToken(request.query.token, response).done(function(user_id){
      pool.query(myquery, function (err, rows, fields) {
        rows = correct_dates( rows );
        response.send(rows);
      }); 
  });

}

//Добавление нового клиента с делами
exports.addNewClient = function(request, response) {

  var add_do_array = request.query.add_do_array;
  var brand_id = request.query.brand;
  var manager_id = request.query.manager;


 jsCheckToken(request.query.token, response).done(function(user_id){

  if( !(manager_id>0) ) manager_id = user_id;

  var values = {
    fio: "Клиент " + jsGetHourMinutes( (new Date) ),
    date: tomysql( (new Date) ),
    brand: brand_id,
    manager_id: manager_id,
    model: -1,
    creditmanager: 'Неизвестно'
  };

  query = "INSERT INTO 1_clients SET ?";
  //console.info("Добавляю новго клиента", brand_id, manager_id, add_do_array, values);

    pool.query(query, values, function (err, rows, fields) {
      var insert_id = rows.insertId;
      if(insert_id) {
        var dfdArray = [];
        if(add_do_array) {
        $.each(add_do_array, function(i, do_type){
          if(do_type!='false') dfdArray.push( jsAddDoToClient(insert_id, do_type, brand_id, user_id, manager_id, i) );
        });
        }
        $.when.apply(null, dfdArray).then(function(){
          jsUpdateClient(insert_id).then(function(){
            response.send({insert_id: insert_id});
          });
          
        })
      }
      //console.info("ADDED rows = ", rows, err);
    }); 
  });
}

function jsAddDoToClient(client_id, do_type, brand_id, user_id, manager_id, i) {
  var dfd = new $.Deferred();

  var now = (new Date( (new Date).getTime()+i*60000 ));
  var time_now = tomysql( now );

  var text, type;
  //console.info("do_type", do_type);
  if(do_type == "vz") {
    text = "Визит "+jsGetHourMinutes( now );
    type = "Визит";
  } else if (do_type == "zv") {
    text = "Звонок "+jsGetHourMinutes( now );
    type = "Звонок";
  } else if (do_type == "tst") {
    text = "Тест-драйв "+jsGetHourMinutes( now );
    type = "Тест-драйв";
  } else if (do_type == "out") {
    text = "OUT "+jsGetHourMinutes( now );
    type = "OUT";
  }

  var values = {
    client: client_id,
    brand: brand_id,
    manager_id: manager_id,
    date1: time_now,
    date2: time_now,
    checked: time_now,
    created: time_now,
    changed: time_now,
    text: text,
    type: type,
    host_id: user_id


  };

  query = "INSERT INTO 1_do SET ?";
    pool.query(query, values, function (err, rows, fields) {
      dfd.resolve(rows);
      //console.info("Добавил дело: ",rows,err);
    });

  return dfd.promise();
}


exports.findClient = function(request, response) {

  var manager = request.query.manager;
  var client_id = request.params.id;

  var myquery = 'SELECT * FROM `1_clients` WHERE id = ? LIMIT 1';

  //console.info("query = ", myquery);

    pool.query(myquery, [client_id], function (err, rows, fields) {
      pool.query('SELECT *, date2 _date2 FROM `1_do` WHERE client = ? ORDER by date2 DESC, id DESC', [client_id], function (err, does, fields) {
        if(rows.length) {
        does = correct_dates( does );
        rows = correct_dates( rows );
        rows[0].do = does;
        response.send(rows);
        }
      });
    }); 

}

//поиск клиентов по типу дела
exports.findClientDoType = function(request, response) {

  var brand_id = request.query.brand;
  var today = request.query.today;
  var type_do = request.query.type_do;

  if(type_do == "vd_plan") {
    var insert_sql = 'icon2 > 0 AND brand="'+brand_id+'" AND vd = "0000-00-00 00:00:00" ORDER by `icon2` DESC, model';
  } else {
    var insert_sql = '`'+type_do+'` LIKE "'+today+'%" AND brand="'+brand_id+'" ORDER by `'+type_do+'` DESC';
  }

  if(type_do == "out"){
    var insert_sql = '`'+type_do+'` LIKE "'+today+'%" AND dg != "0000-00-00 00:00:00" AND brand="'+brand_id+'" ORDER by `'+type_do+'` DESC';
  }

  var myquery = 'SELECT * FROM `1_clients` WHERE '+insert_sql+' LIMIT 5000';

  if(type_do == "tst") {
    myquery = "SELECT 1_clients.* FROM `1_do` LEFT JOIN 1_clients ON 1_clients.id = 1_do.client WHERE 1_do.date2 LIKE '"+today+"%' AND 1_do.brand = "+brand_id+" AND 1_do.type = 'Тест-драйв' AND checked != '0000-00-00 00:00:00'";


  }

  //console.info("query = ", myquery);

  jsCheckToken(request.query.token, response).done(function(user_id){
      pool.query(myquery, function (err, rows, fields) {
          rows = correct_dates( rows );
          response.send(rows);
      }); 
  });

}



exports.loadStat = function(request, response) {


  //var filter = request.query.filters ? JSON.parse(request.query.filters):{};

   var filter = { active:1,
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

  var dfdArray = [];
  var answer = {};

  var brand_id = request.query.brand;
  var today = request.query.today;
  var manager_id = request.query.manager;
  //console.info("manager_stat", manager_id);
  var cache_id = md5(brand_id + manager_id + today);


  global.collection.find({ type: "loadStat", cache_id: cache_id }).toArray( function(err, the_cache){

	  if( the_cache.length ) {
	    response.send( the_cache[0]["mydata"] ); //статистика кешируется нижняя и левая
	    //console.info("info_from_cache", cache_id);
	    //console.info("Stat from cache "+cache_id+", brand = ", brand_id,global.stat_cache);
	  } else {

	    if(manager_id>0) {
	      var manager_sql = " manager_id = '"+manager_id+"' AND "
	    } else {
	      var manager_sql = "";     
	    }
	  if(filter.items)
	    $.each(filter.items, function(i, el){
	      if(el.filter) {
	        el.filter.brand = request.query.brand;
	        f_filter = jsMakeClientFilter(el.filter); 


	        var myquery = 'SELECT count(*) cnt FROM `1_clients` WHERE ' + manager_sql + f_filter + " true ";      
	        //console.info(myquery);

	        var dfd = (function(){
	          var dfd = $.Deferred();

	            pool.query(myquery, function (err, rows, fields) {
	            answer[ el.id ] = rows[0].cnt;
	            dfd.resolve();
	          });       
	          return dfd.promise();
	        })(); 

	        dfdArray.push( dfd );
	      }
	    }); 

	    var result = [];
	    dfdArray.push( jsLoadStatSMS("dg", brand_id, today, result) );
	    dfdArray.push( jsLoadStatSMS("vd", brand_id, today, result) );
	    dfdArray.push( jsLoadStatSMS("vd_plan", brand_id, today, result) );
	    dfdArray.push( jsLoadStatSMS("out", brand_id, today, result) );
	    dfdArray.push( jsLoadStatSMS("zv", brand_id, today, result) );
	    dfdArray.push( jsLoadStatSMS("vz", brand_id, today, result) );
	    dfdArray.push( jsLoadStatSMS("tst", brand_id, today, result) );

	    $.when.apply(null, dfdArray).then(function(){
	      answer = {left_stat: answer, sms: result};
		  global.collection.update({cache_id: cache_id}, {type: "loadStat", brand: brand_id, cache_id: cache_id, mydata: answer, time: jsNow()}, { upsert: true }, function(err, docs){
		 	  global.collection.count(function(err, count) {
		      });    	
		  });



	      response.send(answer);  
	    })
	  };

  });
  
}

var jsLoadStatSMS = function(type, brand_id, today, result) {
  var dfd = $.Deferred();
  var tmp = today.split("-");
  var today_month = tmp[0]+"-"+tmp[1];

  if (type=="vd_plan") {
    var val = {type: type, icon: "1vidacha.png", day: 0, month: 0, title: "Запланированные выдачи", order: 2};
    myquery = "SELECT icon2 FROM `1_clients` WHERE `icon2`>2 AND vd='0000-00-00 00:00:00' AND `out`='0000-00-00 00:00:00' AND brand = ? ";
    pool.query(myquery, [brand_id], function (err, rows, fields) {
      val["plan"] = { plan5: 0, plan4: 0, plan3: 0 };
      $.each(rows, function(i, cl){
        if( cl.icon2 == 3 ) val.plan.plan3 += 1;
        if( cl.icon2 == 4 ) val.plan.plan4 += 1;
        if( cl.icon2 == 5 ) val.plan.plan5 += 1;
      });
      result.push( val );
      dfd.resolve();
    });
  } else if (type=="tst") {
    if(type=="tst") var val = {type: type, icon: "1test-drive.png", day: 0, month: 0, title: "Тестдрайвы", order: 6};
    myquery = "SELECT count(*) cnt FROM `1_do` WHERE type='Тест-драйв' AND date2 LIKE '"+today_month+"%' AND checked != '0000-00-00 00:00:00' AND brand = ? ";
    pool.query(myquery, [brand_id], function (err, rows_month, fields) {
	    myquery = "SELECT count(*) cnt FROM `1_do` WHERE type='Тест-драйв' AND date2 LIKE '"+today+"%' AND checked != '0000-00-00 00:00:00' AND brand = ? ";
	    pool.query(myquery, [brand_id], function (err, rows_day, fields) {
		      val.day = rows_day[0].cnt;
		      val.month = rows_month[0].cnt;;
		      result.push( val );
		      dfd.resolve();
		});
    });
  } else {
    if(type=="dg") var val = {type: type, icon: "1dogovor.png", day: 0, month: 0, title: "Договора", order: 0};
    if(type=="vd") var val = {type: type, icon: "1vidacha.png", day: 0, month: 0, title: "Выдачи", order: 1};
    if(type=="out") var val = {type: type, icon: "1out.png", day: 0, month: 0, title: "Расторжения", order: 3};
    if(type=="zv") var val = {type: type, icon: "1zvonok.png", day: 0, month: 0, title: "Звонки первичные", order: 4};
    if(type=="vz") var val = {type: type, icon: "1vizit.png", day: 0, month: 0, title: "Визиты первичные", order: 5};

    if(type=="out") {
      var insert_sql = ' dg != "0000-00-00 00:00:00" AND';
    } else {
      var insert_sql = ' ';
    }

    myquery = "SELECT count(*) cnt FROM `1_clients` WHERE "+insert_sql+" `"+type+"` LIKE '"+today_month+"%' AND brand = ? ";
    pool.query(myquery, [brand_id], function (err, rows_month, fields) {
      myquery = "SELECT count(*) cnt FROM `1_clients` WHERE "+insert_sql+" `"+type+"` LIKE '"+today+"%' AND brand = ? ";
      pool.query(myquery, [brand_id], function (err, rows_day, fields) {
        val["month"] = rows_month[0].cnt;
        val["day"] = rows_day[0].cnt;
        result.push( val );
        dfd.resolve();
      });
    });
  }

  return dfd.promise();
}

exports.jsGetReiting = function(request, response) {

  var brand = request.query.brand;
  var today = request.query.today+"%";
  var today_date = request.query.today;

  var now = tomysql( (new Date) );
  var current_time = now.split(" ")[1];

  var today_year = now.split("-")[0]+"%";

  var today_date_sql = request.query.today+" "+current_time;

  var start_today = request.query.start_today+"%";
  var start_today_date = request.query.start_today;

  var start_today_date_sql = request.query.start_today+" "+current_time;

    var answer = [];

    function jsFindCost(client, models) {
      var model = _.find(models, function(model) { return (model.id == client.model) });

    var cost = 600000;
    if(client.cost>250000) {
      cost = client.cost;
      if(cost>2500000) cost = 2500000;
    } else if (model && model.cost) {
      cost = model.cost;
    }
    return cost;

    }

    function jsIncrement(managers, manager_id, field_name, cost) {
      var cup_element = _.find(managers, function(el){ return el.manager_id == manager_id; });
      if(cup_element) {
        if(cup_element[ field_name ]=="") cup_element[ field_name ] = 0;
        cup_element[ field_name ] += cost?cost:1;
      }
    }

    pool.query('SELECT * FROM `1_users` WHERE brand = ? AND user_group IN (5,6,14) ORDER by id', [brand], function (err, users, fields) {
      pool.query('SELECT * FROM `1_models` WHERE brand = ?', [brand], function (err, models, fields) {
        pool.query('SELECT * FROM `1_clients` WHERE brand = ? AND zv LIKE ? OR vz LIKE ? OR tst LIKE ?', [brand, today_year, today_year, today_year], function (err, clients, fields) {
          clients = correct_dates(clients,"date_null");
          var dfdArray = [];

          $.each(users, function(i, user){ //делаем пустой ответ
            answer.push( {
                  manager:user.fio,
                  manager_id:user.id,

                  vd_count: 0,
                  dg_count: 0,
                  tst_count: 0,
                  vz_count: 0,
                  rastorg_count: 0,
                  no_na_count: 0,

                  vd_sum: 0,
                  dg_sum: 0,
                  tst_sum: 0,
                  vz_sum: 0,
                  rastorg_sum: 0,
                  no_na_sum: 0,

                  vd_ids: '',
                  dg_ids: '',
                  tst_ids: '',
                  vz_ids: '',
                  rastorg_ids: '',
                  no_na_ids: '',

                  reiting_sum: 0
              } );
          });
          
          $.each(clients, function(i, client){
            //console.info(client.out);
            if( (client.vd >= start_today_date_sql) && 
              (client.vd <= today_date_sql) && 
              (client.out=='') ) {
              jsIncrement(answer, client.manager_id, "vd_count");
              var cost = jsFindCost(client, models);
              jsIncrement(answer, client.manager_id, "vd_sum", cost);
              jsIncrement(answer, client.manager_id, "vd_ids", ","+client.id);

              jsIncrement(answer, client.manager_id, "reiting_sum", cost);
            }

            if( (client.dg >= start_today_date_sql) && 
              (client.dg <= today_date_sql) && 
              (client.out=='') ) {
              jsIncrement(answer, client.manager_id, "dg_count");
              var cost = jsFindCost(client, models);
              jsIncrement(answer, client.manager_id, "dg_sum", cost);
              jsIncrement(answer, client.manager_id, "dg_ids", ","+client.id);

              jsIncrement(answer, client.manager_id, "reiting_sum", cost/2);
            }

            if( (client.tst >= start_today_date_sql) && 
              (client.tst <= today_date_sql) 
              && (client.out=='') ) {
              jsIncrement(answer, client.manager_id, "tst_count");
              var cost = jsFindCost(client, models);
              jsIncrement(answer, client.manager_id, "tst_sum", cost);
              jsIncrement(answer, client.manager_id, "tst_ids", ","+client.id);

              jsIncrement(answer, client.manager_id, "reiting_sum", cost/5);
            }

            if( (client.vz >= start_today_date_sql) && 
              (client.vz <= today_date_sql) 
              && (client.out=='') ) {
              jsIncrement(answer, client.manager_id, "vz_count");
              var cost = jsFindCost(client, models);
              jsIncrement(answer, client.manager_id, "vz_sum", cost);
              jsIncrement(answer, client.manager_id, "vz_ids", ","+client.id);

              jsIncrement(answer, client.manager_id, "reiting_sum", cost/10);
            }


            if( (client.out >= start_today_date_sql) && 
              (client.out <= today_date_sql) &&
              (client.out!='') && (client.dg!='') ) {
              jsIncrement(answer, client.manager_id, "rastorg_count");
              var cost = jsFindCost(client, models);
              jsIncrement(answer, client.manager_id, "rastorg_sum", cost);
              jsIncrement(answer, client.manager_id, "rastorg_ids", ","+client.id);
              jsIncrement(answer, client.manager_id, "reiting_sum", -cost/3);
            }

            if( (client.na_date=='') && (client.out=='') ) {
              //console.info("na", client);
              jsIncrement(answer, client.manager_id, "no_na_count");
              var cost = jsFindCost(client, models);
              jsIncrement(answer, client.manager_id, "no_na_sum", cost);
              jsIncrement(answer, client.manager_id, "no_na_ids", ","+client.id);
              jsIncrement(answer, client.manager_id, "reiting_sum", -cost/5);
            }


          });

          response.send(answer);
        }); 
    });
    });
  
}




exports.jsGetManagerCupAdmin = function(request, response) {

  var brand = request.query.brand;
  var today = request.query.today+"%";
  var today_date = request.query.today;
  var today_month1 = request.query.today.split("-");
  today_month1 = today_month1[0]+"-"+today_month1[1];
  var today_month = today_month1 + "%";

    var admin = [];


    function jsAdminIncrement(managers, manager_id, field_name, date1) {


        if( date1.indexOf(today_month1)!=-1 ) {
        var cup_element = _.find(admin, function(el){ return el.manager_id == manager_id; });
        if(cup_element) {
          if(cup_element[ field_name+"_month" ]=="") cup_element[ field_name+"_month" ] = 0;
          cup_element[ field_name+"_month" ] += 1;
        } else {
        }
        } 

      if (date1.indexOf(today_date)!=-1) {
        var cup_element = _.find(admin, function(el){ return el.manager_id == manager_id; });
        if(cup_element) {
          if(cup_element[ field_name ]=="") cup_element[ field_name ] = 0;
          cup_element[ field_name ] += 1;
          return true;
        } else {
          return false;
        }
      }

    }



      pool.query('SELECT * FROM `1_users` WHERE brand = ? AND user_group IN (5,6,3,14) ORDER by id', [brand], function (err, users, fields) {
        pool.query('SELECT * FROM `1_doadmin` WHERE brand = ? AND date1 LIKE ? ORDER by date1 DESC', [brand, today_month], function (err, do_admin, fields) {
          pool.query('SELECT * FROM `1_clients` WHERE brand = ? AND (zv LIKE ? OR vz LIKE ? OR tst LIKE ?)', [brand, today_month, today_month, today_month], function (err, clients, fields) {
            do_admin = correct_dates(do_admin);
            clients = correct_dates(clients);
            users.push({id:-2, fio: "Не менеджер"});
            users.push({id:-1, fio: "Неохваченный трафик"});
            users.push({id:-4, fio: "Отказ_от_общения"});
            users.push({id:-3, fio: "Итого_по_менеджерам"});
            users.push({id:-5, fio: "Общий трафик:"});
            var dfdArray = [];

            $.each(users, function(i, user){ //делаем пустой ответ, потом будем увеличивать нули по мере прохождения

              admin.push( {
                    manager:user.fio,
                    manager_id:user.id,

                    zv_admin: "",
                    zv_manager: "",

                    vz_admin: "",
                    vz_manager: "",

                    vz2_admin: "",

                    tst_admin: "",
                    tst_manager: "",

                    mydo: []
                } );
            });
            
            $.each(do_admin, function(i, mydo){ 
              if(mydo.type=='zv') { 
                jsAdminIncrement(users, mydo.manager_id, "zv_admin", mydo.date1);

                if(mydo.manager_id > 0) jsAdminIncrement(users, -3, "zv_admin", mydo.date1);
                if(mydo.manager_id != -3) jsAdminIncrement(users, -5, "zv_admin", mydo.date1);
              }
              if(mydo.type=='vz') {
                jsAdminIncrement(users, mydo.manager_id, "vz_admin", mydo.date1);
                if(mydo.manager_id > 0) jsAdminIncrement(users, -3, "vz_admin", mydo.date1);
                if(mydo.manager_id != -3) jsAdminIncrement(users, -5, "vz_admin", mydo.date1);
              }
              if(mydo.type=='tst') {
                jsAdminIncrement(users, mydo.manager_id, "tst_admin", mydo.date1);
                if(mydo.manager_id > 0) jsAdminIncrement(users, -3, "tst_admin", mydo.date1);
              }
              if(mydo.type=='vz2') {
                jsAdminIncrement(users, mydo.manager_id, "vz2_admin", mydo.date1);
                if(mydo.manager_id != -3) jsAdminIncrement(users, -3, "vz2_admin", mydo.date1);
                if(mydo.manager_id != -3) jsAdminIncrement(users, -5, "vz2_admin", mydo.date1);
              }

              if(mydo.date1.indexOf(today_date)!=-1) {
              var cup_element = _.find(admin, function(el){ return el.manager_id == mydo.manager_id; });   
              if(cup_element) cup_element.mydo.push( mydo );
            }

            });

            $.each(clients, function(i, client){
              //console.info(client.id);


                if( client.zv.indexOf(today_month1)!=-1 ) {
                  //console.info("!!!",client.model, client);

                  if(jsAdminIncrement(users, client.manager_id, "zv_manager", client.zv)) {
                     jsAdminIncrement(users, -3, "zv_manager", client.zv);  
                     jsAdminIncrement(users, -5, "zv_manager", client.zv);  
                  }
                  
                }
                if( client.vz.indexOf(today_month1)!=-1 ) {

                  if( jsAdminIncrement(users, client.manager_id, "vz_manager", client.vz) ) {
                    jsAdminIncrement(users, -3, "vz_manager", client.vz);
                    jsAdminIncrement(users, -5, "vz_manager", client.vz);
                  }
                  
                }
                if( client.tst.indexOf(today_month1)!=-1 ) {
                  
                  if( jsAdminIncrement(users, client.manager_id, "tst_manager", client.tst) ) {
                    jsAdminIncrement(users, -3, "tst_manager", client.tst); 
                  }
                  
                  //console.info(client.tst, client.manager_id);
                }
            });

            response.send({admin:admin});
          }); 
        });
      });
  
}


exports.jsGetManagerCupAdminReport = function(request, response) {

  var brand = request.query.brand;
  var today = request.query.today+"%";
  var today_date = request.query.today;
  var today_month1 = request.query.today.split("-");
  today_month1 = today_month1[0]+"-"+today_month1[1];
  var today_month = today_month1 + "%";

    var admin = [];

    function hasContacts(client) {
      if( client && (client.phone1 || 
        client.phone2 ||
        client.phone3 ||
        client.phone4 ||
        client.email
        ) ) {
        return true;
      } else {
        return false;
      }
    }

    function jsAdminIncrement(managers, manager_id, field_name, date1) {


        if( date1.indexOf(today_month1)!=-1 ) {
        var cup_element = _.find(admin, function(el){ return el.manager_id == manager_id; });
        if(cup_element) {
          if(cup_element[ field_name+"_month" ]=="") cup_element[ field_name+"_month" ] = 0;
          cup_element[ field_name+"_month" ] += 1;
        } else {
        }
        } 

      if (date1.indexOf(today_date)!=-1) {
        var cup_element = _.find(admin, function(el){ return el.manager_id == manager_id; });
        if(cup_element) {
          if(cup_element[ field_name ]=="") cup_element[ field_name ] = 0;
          cup_element[ field_name ] += 1;
          return true;
        } else {
          return false;
        }
      }

    }

    function jsAdminIncrementModel(models, model_id, field_name, date1, client_id) {
      

    if( date1 && (date1.indexOf(today_month1)!=-1) ) {
      var cup_element = _.find(models, function(el){ return el.model_id == model_id; });

      if(cup_element) {
        if(cup_element[ field_name+"_month" ]=="") cup_element[ field_name+"_month" ] = 0;
        cup_element[ field_name+"_month" ] += 1;

        if(client_id) {
          if(!cup_element[ "ids_"+field_name+"_month" ]) cup_element[ "ids_"+field_name+"_month" ] = "0";
          cup_element[ "ids_"+field_name+"_month" ] += ","+client_id;
        }

      } else {
        jsAdminIncrementModel(models, -2, field_name+"_month", undefined, client_id);
      }
    }

    if (!date1 || (date1.indexOf(today_date)!=-1) ) {
      var cup_element = _.find(models, function(el){ return el.model_id == model_id; });

      if(cup_element) {
        if(cup_element[ field_name ]=="") cup_element[ field_name ] = 0;
        cup_element[ field_name ] += 1;
        if(client_id) {
          if(!cup_element[ "ids_"+field_name ]) cup_element[ "ids_"+field_name ] = "0";
          cup_element[ "ids_"+field_name ] += ","+client_id;
        }

        return true;
      } else {
        jsAdminIncrementModel(models, -2, field_name, undefined, client_id);
        return false;
      }
    }

    }

    function jsAdminIncrementCommercial(commercials, commercial_id, field_name, date1, client_id) {

    if( date1 && (date1.indexOf(today_month1)!=-1) ) {
      var cup_element = _.find(commercials, function(el){ return el.commercial_id == commercial_id; });
      if(cup_element) {
        if(cup_element[ field_name+"_month" ]=="") cup_element[ field_name+"_month" ] = 0;
        cup_element[ field_name+"_month" ] += 1;
        if(client_id) {
          if(!cup_element[ "ids_"+field_name+"_month" ]) cup_element[ "ids_"+field_name+"_month" ] = "0";
          cup_element[ "ids_"+field_name+"_month" ] += ","+client_id;
        }

      } else {
        jsAdminIncrementCommercial(commercials, -2, field_name+"_month")        
      }
    }

    if( !date1 || (date1.indexOf(today_date)!=-1) ) {
      var cup_element = _.find(commercials, function(el){ return el.commercial_id == commercial_id; });
      if(cup_element) {
        if(cup_element[ field_name ]=="") cup_element[ field_name ] = 0;
        cup_element[ field_name ] += 1;
        if(client_id) {
          if(!cup_element[ "ids_"+field_name ]) cup_element[ "ids_"+field_name ] = "0";
          cup_element[ "ids_"+field_name ] += ","+client_id;
        }
        return true;
      } else {
        jsAdminIncrementCommercial(commercials, -2, field_name)       
        return false;
      }
    }
    }


    function jsAdminIncrementUser(users, user_id, field_name, date1, client_id) {

    if( date1 && (date1.indexOf(today_month1)!=-1) ) {
      var cup_element = _.find(users, function(el){ return el.user_id == user_id; });
      if(cup_element) {
        if(cup_element[ field_name+"_month" ]=="") cup_element[ field_name+"_month" ] = 0;
        cup_element[ field_name+"_month" ] += 1;
        if(client_id) {
          if(!cup_element[ "ids_"+field_name+"_month" ]) cup_element[ "ids_"+field_name+"_month" ] = "0";
          cup_element[ "ids_"+field_name+"_month" ] += ","+client_id;
        }
      } else {
        jsAdminIncrementUser(users, -2, field_name+"_month");       
      }
    }

    if( !date1 || (date1.indexOf(today_date)!=-1) ) {
      var cup_element = _.find(users, function(el){ return el.user_id == user_id; });
      if(cup_element) {
        if(cup_element[ field_name ]=="") cup_element[ field_name ] = 0;
        cup_element[ field_name ] += 1;
        if(client_id) {
          if(!cup_element[ "ids_"+field_name ]) cup_element[ "ids_"+field_name ] = "0";
          cup_element[ "ids_"+field_name ] += ","+client_id;
        }
        return true;
      } else {
        jsAdminIncrementUser(users, -2, field_name);        
        return false;
      }
    }
    }


    var admin_models = [];
    var admin_commercials = [];
    var admin_users = [];

    pool.query('SELECT * FROM `1_commercials` ORDER by title', [brand], function (err, commercials, fields) {
    pool.query('SELECT * FROM `1_models` WHERE brand = ? AND `show`=1 ORDER by model', [brand], function (err, models, fields) {
      //console.info("err",err)
      pool.query('SELECT * FROM `1_users` WHERE brand = ? AND user_group IN (5,6,3,14) ORDER by id', [brand], function (err, users, fields) {
        pool.query('SELECT * FROM `1_doadmin` WHERE brand = ? AND date1 LIKE ? ORDER by date1 DESC', [brand, today_month], function (err, do_admin, fields) {
          pool.query('SELECT * FROM `1_clients` WHERE brand = ? AND (zv LIKE ? OR vz LIKE ? OR tst LIKE ? OR dg LIKE ? OR vd LIKE ?)', [brand, today_month, today_month, today_month, today_month, today_month], function (err, clients, fields) {
          pool.query('SELECT 1_clients.*, 1_do.manager_id manager_id2, 1_do.date2 tst, 1_test.model_id tstmodel FROM `1_do` LEFT JOIN 1_clients ON 1_do.client=1_clients.id LEFT JOIN 1_test ON 1_do.test_model_id = 1_test.id WHERE 1_do.brand = ? AND 1_do.date2 LIKE ? AND 1_do.checked !="0000-00-00 00:00:00" AND 1_do.type="Тест-драйв" ', [brand, today_month], function (err, clients_tst, fields) {
            do_admin = correct_dates(do_admin);
            clients = correct_dates(clients);
            clients_tst = correct_dates(clients_tst);
            users.push({id:-2, fio: "Не менеджер"});
            users.push({id:-1, fio: "Неохваченный трафик"});
            users.push({id:-4, fio: "Отказ_от_общения"});
            users.push({id:-3, fio: "Итого_по_менеджерам"});
            users.push({id:-5, fio: "Общий трафик:"});
            var dfdArray = [];
            models.push({'id':"-2", 'short':"Не указана:"});
            models.push({'id':"-5", 'short':"Итого:"});
            $.each(models, function(i, model){
              admin_models.push({model_id: model.id, model: model.short, zv: 0, vz: 0, tst: 0, zv_manager: 0, vz_manager: 0, tst_manager: 0, vz2_admin: 0, contacts:  0, out: 0, zv_month: 0, vz_month: 0, tst_month: 0, zv_manager_month: 0, vz_manager_month: 0, tst_manager_month: 0, vz2_admin_month: 0, contacts_month:  0, out_month: 0, dg:0, dg_month:0, vd:0, vd_month:0});

            });

            commercials.push({id:-2, title:"Не указано:"});
            commercials.push({id:-5, title:"Итого:"});
            $.each(commercials, function(i, commercial){
              admin_commercials.push({commercial_id: commercial.id, commercial: commercial.title, zv: 0, vz: 0, tst: 0, zv_manager: 0, vz_manager: 0, tst_manager: 0, vz2_admin: 0, contacts:  0, out: 0, zv_month: 0, vz_month: 0, tst_month: 0, zv_manager_month: 0, vz_manager_month: 0, tst_manager_month: 0, vz2_admin_month: 0, contacts_month:  0, out_month: 0, dg:0, dg_month:0, vd:0, vd_month:0});

            });



            $.each(users, function(i, user){ //делаем пустой ответ, потом будем увеличивать нули по мере прохождения

              admin_users.push({user_id: user.id, fio: user.fio, zv: 0, vz: 0, tst: 0, zv_manager: 0, vz_manager: 0, tst_manager: 0, vz2_admin: 0, contacts:  0, out: 0, zv_month: 0, vz_month: 0, tst_month: 0, zv_manager_month: 0, vz_manager_month: 0, tst_manager_month: 0, vz2_admin_month: 0, contacts_month:  0, out_month: 0, dg:0, dg_month:0, vd:0, vd_month:0});


              admin.push( {
                    manager:user.fio,
                    manager_id:user.id,

                    zv_admin: "",
                    zv_manager: "",

                    vz_admin: "",
                    vz_manager: "",

                    vz2_admin: "",

                    tst_admin: "",
                    tst_manager: "",

                    mydo: []
                } );
            });
            
            $.each(do_admin, function(i, mydo){ 


              if(mydo.type=='zv') { 
                jsAdminIncrement(users, mydo.manager_id, "zv_admin", mydo.date1);
                jsAdminIncrementModel(admin_models, mydo.model, "zv", mydo.date1);
                jsAdminIncrementModel(admin_models, -5, "zv", mydo.date1);

                jsAdminIncrementCommercial(admin_commercials, mydo.commercial, "zv", mydo.date1);
                jsAdminIncrementCommercial(admin_commercials, -5, "zv", mydo.date1);

                jsAdminIncrementUser(admin_users, mydo.manager_id, "zv", mydo.date1);
                jsAdminIncrementUser(admin_users, -5, "zv", mydo.date1);

                if(mydo.manager_id > 0) jsAdminIncrement(users, -3, "zv_admin", mydo.date1);
                if(mydo.manager_id != -3) jsAdminIncrement(users, -5, "zv_admin", mydo.date1);
              }
              if(mydo.type=='vz') {
                jsAdminIncrement(users, mydo.manager_id, "vz_admin", mydo.date1);
                jsAdminIncrementCommercial(admin_commercials, mydo.commercial, "vz", mydo.date1);
                jsAdminIncrementCommercial(admin_commercials, -5, "vz", mydo.date1);

                jsAdminIncrementUser(admin_users, mydo.manager_id, "vz", mydo.date1);
                jsAdminIncrementUser(admin_users, -5, "vz", mydo.date1);

                jsAdminIncrementModel(admin_models, mydo.model, "vz", mydo.date1);
                jsAdminIncrementModel(admin_models, -5, "vz", mydo.date1);
                if(mydo.manager_id > 0) jsAdminIncrement(users, -3, "vz_admin", mydo.date1);
                if(mydo.manager_id != -3) jsAdminIncrement(users, -5, "vz_admin", mydo.date1);
              }
              if(mydo.type=='tst') {
                jsAdminIncrement(users, mydo.manager_id, "tst_admin", mydo.date1);
                jsAdminIncrementCommercial(admin_commercials, mydo.commercial, "tst", mydo.date1);
                jsAdminIncrementCommercial(admin_commercials, -5, "tst", mydo.date1);

                jsAdminIncrementUser(admin_users, mydo.manager_id, "tst", mydo.date1);
                jsAdminIncrementUser(admin_users, -5, "tst", mydo.date1);

                jsAdminIncrementModel(admin_models, mydo.model, "tst", mydo.date1);
                jsAdminIncrementModel(admin_models, -5, "tst", mydo.date1);
                if(mydo.manager_id > 0) jsAdminIncrement(users, -3, "tst_admin", mydo.date1);
              }
              if(mydo.type=='vz2') {
                jsAdminIncrement(users, mydo.manager_id, "vz2_admin", mydo.date1);
                jsAdminIncrementCommercial(admin_commercials, mydo.commercial, "vz2_admin", mydo.date1);
                jsAdminIncrementCommercial(admin_commercials, -5, "vz2_admin", mydo.date1);

                jsAdminIncrementUser(admin_users, mydo.manager_id, "vz2_admin", mydo.date1);
                jsAdminIncrementUser(admin_users, -5, "vz2_admin", mydo.date1);

                jsAdminIncrementModel(admin_models, mydo.model, "vz2_admin", mydo.date1)
                jsAdminIncrementModel(admin_models, -5, "vz2_admin", mydo.date1);
                if(mydo.manager_id != -3) jsAdminIncrement(users, -3, "vz2_admin", mydo.date1);
                if(mydo.manager_id != -3) jsAdminIncrement(users, -5, "vz2_admin", mydo.date1);
              }

              if(mydo.date1.indexOf(today_date)!=-1) {
              var cup_element = _.find(admin, function(el){ return el.manager_id == mydo.manager_id; });   
              if(cup_element) cup_element.mydo.push( mydo );
            }

            });

            $.each(clients_tst, function(i, client){
                if( client.tst.indexOf(today_month1)!=-1 ) {
                  jsAdminIncrementCommercial(admin_commercials, client.commercial_id, "tst_manager", client.tst, client.id)
                  jsAdminIncrementCommercial(admin_commercials, -5, "tst_manager", client.tst, client.id);
                  jsAdminIncrementModel(admin_models, ((client.tstmodel>0)?client.tstmodel:client.model), "tst_manager", client.tst, client.id);
                  jsAdminIncrementModel(admin_models, -5, "tst_manager", client.tst, client.id);

                  jsAdminIncrementUser(admin_users, client.manager_id2, "tst_manager", client.tst, client.id);
                  jsAdminIncrementUser(admin_users, -5, "tst_manager", client.tst, client.id);

                  
                  if( jsAdminIncrement(users, client.manager_id, "tst_manager", client.tst, client.id) ) {
                    jsAdminIncrement(users, -3, "tst_manager", client.tst, client.id); 
                  }
                  
                  //console.info(client.tst, client.manager_id);
                }

            });

            $.each(clients, function(i, client){
              //console.info(client.id);



                if( ( client.zv.indexOf(today_month1)!=-1 ) || ( client.vz.indexOf(today_month1)!=-1 )) {

                  if( hasContacts(client) ) {
                    jsAdminIncrementModel(admin_models, client.model, "contacts", client.vz?client.vz:client.zv, client.id);
                    jsAdminIncrementModel(admin_models, -5, "contacts", client.vz?client.vz:client.zv, client.id);
                    jsAdminIncrementCommercial(admin_commercials, client.commercial_id, "contacts", client.vz?client.vz:client.zv, client.id);
                    jsAdminIncrementCommercial(admin_commercials, -5, "contacts", client.vz?client.vz:client.zv, client.id);

                    jsAdminIncrementUser(admin_users, client.manager_id, "contacts", client.vz?client.vz:client.zv, client.id);
                    jsAdminIncrementUser(admin_users, -5, "contacts", client.vz?client.vz:client.zv, client.id);


                  } else {
                    jsAdminIncrementModel(admin_models, client.model, "out", client.vz?client.vz:client.zv, client.id);
                    jsAdminIncrementModel(admin_models, -5, "out", client.vz?client.vz:client.zv, client.id);
                    jsAdminIncrementCommercial(admin_commercials, client.commercial_id, "out", client.vz?client.vz:client.zv, client.id);    
                    jsAdminIncrementCommercial(admin_commercials, -5, "out", client.vz?client.vz:client.zv, client.id);

                    jsAdminIncrementUser(admin_users, client.manager_id, "out", client.vz?client.vz:client.zv, client.id);
                    jsAdminIncrementUser(admin_users, -5, "out", client.vz?client.vz:client.zv, client.id);


                  }
                }

                if( client.dg.indexOf(today_month1)!=-1 ) {
                  //console.info("!!!",client.model, client);
                  jsAdminIncrementModel(admin_models, client.model, "dg", client.dg, client.id);
                  jsAdminIncrementModel(admin_models, -5, "dg", client.dg, client.id);
                  jsAdminIncrementCommercial(admin_commercials, client.commercial_id, "dg", client.dg, client.id)
                  jsAdminIncrementCommercial(admin_commercials, -5, "dg", client.dg, client.id)

                  jsAdminIncrementUser(admin_users, client.manager_id, "dg", client.dg, client.id);
                  jsAdminIncrementUser(admin_users, -5, "dg", client.dg, client.id);

                  if(jsAdminIncrement(users, client.manager_id, "dg", client.dg, client.id)) {
                     jsAdminIncrement(users, -3, "dg", client.dg, client.id);  
                     jsAdminIncrement(users, -5, "dg", client.dg, client.id);  
                  }
                  
                }

                if( client.vd.indexOf(today_month1)!=-1 ) {
                  //console.info("!!!",client.model, client);
                  jsAdminIncrementModel(admin_models, client.model, "vd", client.vd, client.id);
                  jsAdminIncrementModel(admin_models, -5, "vd", client.vd, client.id);
                  jsAdminIncrementCommercial(admin_commercials, client.commercial_id, "vd", client.vd, client.id)
                  jsAdminIncrementCommercial(admin_commercials, -5, "vd", client.vd, client.id)

                  jsAdminIncrementUser(admin_users, client.manager_id, "vd", client.vd, client.id);
                  jsAdminIncrementUser(admin_users, -5, "vd", client.vd, client.id);

                  if(jsAdminIncrement(users, client.manager_id, "vd", client.vd, client.id)) {
                     jsAdminIncrement(users, -3, "vd", client.vd, client.id);  
                     jsAdminIncrement(users, -5, "vd", client.vd, client.id);  
                  }
                  
                }



                if( client.zv.indexOf(today_month1)!=-1 ) {
                  //console.info("!!!",client.model, client);
                  jsAdminIncrementModel(admin_models, client.model, "zv_manager", client.zv, client.id);
                  jsAdminIncrementModel(admin_models, -5, "zv_manager", client.zv, client.id);
                  jsAdminIncrementCommercial(admin_commercials, client.commercial_id, "zv_manager", client.zv, client.id)

                  jsAdminIncrementUser(admin_users, client.manager_id, "zv_manager", client.zv, client.id);
                  jsAdminIncrementUser(admin_users, -5, "zv_manager", client.zv, client.id);

                  if(jsAdminIncrement(users, client.manager_id, "zv_manager", client.zv, client.id)) {
                     jsAdminIncrement(users, -3, "zv_manager", client.zv, client.id);  
                     jsAdminIncrement(users, -5, "zv_manager", client.zv, client.id);  
                  }
                  
                }
                if( client.vz.indexOf(today_month1)!=-1 ) {
                  //console.info("!?!",client.model);
                  jsAdminIncrementModel(admin_models, client.model, "vz_manager", client.vz, client.id);
                  jsAdminIncrementModel(admin_models, -5, "vz_manager", client.vz, client.id);

                  jsAdminIncrementCommercial(admin_commercials, client.commercial_id, "vz_manager", client.vz, client.id);
                  jsAdminIncrementCommercial(admin_commercials, -5, "vz_manager", client.vz, client.id);

                  jsAdminIncrementUser(admin_users, client.manager_id, "vz_manager", client.vz, client.id);
                  jsAdminIncrementUser(admin_users, -5, "vz_manager", client.vz, client.id);

                  if( jsAdminIncrement(users, client.manager_id, "vz_manager", client.vz, client.id) ) {
                    jsAdminIncrement(users, -3, "vz_manager", client.vz, client.id);
                    jsAdminIncrement(users, -5, "vz_manager", client.vz, client.id);
                  }
                  
                }
            });

            response.send({admin:admin, admin_models: admin_models, admin_commercials: admin_commercials, admin_users: admin_users});
          }); 
         });
        });
      });
  });
  });
  
}



exports.loadStatDay = function(request, response) {
    var dfdArray = [];
    var answer = [];

  var brand = request.query.brand;
  var today = request.query.today+"%";
  var manager_id = request.query.manager;

  if(manager_id==-1) {
    var manager_sql = "";
  } else {
    var manager_sql = " AND manager_id = '"+manager_id+"' ";    
  }

    //Звонки
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE zv LIKE ? AND brand = ? '+manager_sql+' ORDER by manager_id, model LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"Звонки", order: 0, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );

    //Визиты
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE vz LIKE ? AND brand = ? '+manager_sql+' ORDER by manager_id, model  LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"Визиты", order: 1, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );


    //Тестдрайвы
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE tst LIKE ? AND brand = ? '+manager_sql+' ORDER by manager_id, model  LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"Тест-драйвы", order: 2, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );

    //Договора
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE dg LIKE ? AND brand = ? '+manager_sql+' ORDER by manager_id, model  LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"Договора", order: 3, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );

    //Выдачи
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE vd LIKE ? AND brand = ? '+manager_sql+' ORDER by manager_id, model  LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"Выдачи", order: 4, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );

    //Расторжения
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE `out` LIKE ? AND dg != "0000-00-00 00:00:00" AND brand = ? '+manager_sql+' ORDER by manager_id, model  LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"Расторжения", order: 5, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );

    //OUT
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE `out` LIKE ? AND dg = "0000-00-00 00:00:00" AND brand = ? '+manager_sql+' ORDER by manager_id, model  LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"OUT", order: 6, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );


    $.when.apply(null, dfdArray).then(function(){
      response.send( answer );
    });

}


exports.loadStatAllDay = function(request, response) {
    var dfdArray = [];
    var answer = [];

  var brand = request.query.brand;
  var today = request.query.today+"%";
  var manager_id = request.query.manager;


    var day = {
      month: {days: 31, days_past: 18, days_last: 12},
      plan_month: [ 
        {title: "CBU", plan_month: 67},
        {title: "Solaris", plan_month: 100}, 
        {title: "Итого", plan_month: 167}, 
      ],
      vd_month: [
        {title: "CBU", vd: 19, clients:[100483, 100491]},
        {title: "Solaris", vd: 45, clients:[100491]},
        {title: "Итого", vd: 64, clients:[100491, 100483]}
      ],
      vd_rest_month: [
        {title: "CBU", vd: 48, clients:[100483, 100491]},
        {title: "Solaris", vd: 55, clients:[100491]},
        {title: "Итого", vd: 103, clients:[100491, 100483]}
      ],
      vd_plan_month: [
        {title: "CBU", vd: "6<br>(3 + 2 + 1)", clients:[100483, 100491]},
        {title: "Solaris", vd: "3<br>(2 + 1 + 0)", clients:[100491]},
        {title: "Итого", vd: "9<br>(5 + 3 + 1)", clients:[100491, 100483]}
      ],
      vd_need_rest_for_plan_month: [
        {title: "CBU", vd: 4, clients:[100483, 100491]},
        {title: "Solaris", vd: 2, clients:[100491]},
        {title: "Итого", vd: 9, clients:[100491, 100483]}
      ],
      //Воронка продаж
      voronka_traffic: [
        {title: "CBU", count: "4 (20)", clients:[100483, 100491]},
        {title: "Solaris", count: "2 (35)", clients:[100491]},
        {title: "Итого", count: "6 (55)", clients:[100491, 100483]},
        {title: "% от трафика", count: "100% (100%)", clients:[100491, 100483]},
        {title: "% от контактов", count: "130% (120%)", clients:[100491, 100483]}
      ],
      voronka_contacts: [
        {title: "CBU", count: "14 (120)", clients:[100483, 100491]},
        {title: "Solaris", count: "12 (67)", clients:[100491]},
        {title: "Итого", count: "26 (187)", clients:[100491, 100483]},
        {title: "% от трафика", count: "60% (50%)", clients:[100491, 100483]},
        {title: "% от контактов", count: "50% (45%)", clients:[100491, 100483]}
      ],
      voronka_tst: [
        {title: "CBU", count: "1 (18)", clients:[100483, 100491]},
        {title: "Solaris", count: "8 (23)", clients:[100491]},
        {title: "Итого", count: "9 (41)", clients:[100491, 100483]},
        {title: "% от трафика", count: "45% (40%)", clients:[100491, 100483]},
        {title: "% от контактов", count: "30% (28%)", clients:[100491, 100483]}
      ],
      voronka_dg: [
        {title: "CBU", count: "3 (18)", clients:[100483, 100491]},
        {title: "Solaris", count: "2 (34)", clients:[100491]},
        {title: "Итого", count: "5 (52)", clients:[100491, 100483]},
        {title: "% от трафика", count: "15% (12%)", clients:[100491, 100483]},
        {title: "% от контактов", count: "10% (8%)", clients:[100491, 100483]}
      ],
      voronka_dg_average: [
        {title: "CBU", count: 2.1, clients:[100483, 100491]},
        {title: "Solaris", count: 3.2, clients:[100491]},
        {title: "Итого", count: 5.3, clients:[100491, 100483]}
      ],
      voronka_rastorg: [
        {title: "CBU", count: "1 (8)", clients:[100483, 100491]},
        {title: "Solaris", count: "2 (16)", clients:[100491]},
        {title: "Итого", count: "3 (24)", clients:[100491, 100483]},
        {title: "% от трафика", count: "1% (2%)", clients:[100491, 100483]},
        {title: "% от контактов", count: "0.8% (0.6%)", clients:[100491, 100483]}
      ],
      voronka_vd: [
        {title: "CBU", count: "2 (10)", clients:[100483, 100491]},
        {title: "Solaris", count: "3 (15)", clients:[100491]},
        {title: "Итого", count: "5 (25)", clients:[100491, 100483]},
        {title: "% от трафика", count: "19% (23%)", clients:[100491, 100483]},
        {title: "% от контактов", count: "16% (12%)", clients:[100491, 100483]}
      ],
      voronka_models: [
        {title: "Elantra", 
         dg_all: 18, 
         tst: 1, 
         tst_month: 18, 
         dg_day: 3, 
         dg_month: 10, 
         vd_day: 3, 
         vd_month: 50, 
         plan: 30,
         plan_procent: "92%",
         traffic_day: 20,
         traffic_month: 180,
         phones_day: 50,
         phones_month: 170
        },
        {title: "Solaris", 
         dg_all: 11, 
         tst: 2, 
         tst_month: 24, 
         dg_day: 2, 
         dg_month: 8, 
         vd_day: 1, 
         vd_month: 30, 
         plan: 20,
         plan_procent: "82%",
         traffic_day: 14,
         traffic_month: 160,
         phones_day: 20,
         phones_month: 120
        }
      ],
      voronka_models: [
        {title: "Петров Иван", 
         dg_all: 18, 
         tst: 1, 
         tst_month: 18, 
         dg_day: 3, 
         dg_month: 10, 
         vd_day: 3, 
         vd_month: 50, 
         plan: 30,
         plan_procent: "92%",
         traffic_day: 20,
         traffic_month: 180,
         phones_day: 50,
         phones_month: 170
        },
        {title: "Михайлов Сергей", 
         dg_all: 11, 
         tst: 2, 
         tst_month: 24, 
         dg_day: 2, 
         dg_month: 8, 
         vd_day: 1, 
         vd_month: 30, 
         plan: 20,
         plan_procent: "82%",
         traffic_day: 14,
         traffic_month: 160,
         phones_day: 20,
         phones_month: 120
        }
      ]



    };


  if(manager_id==-1) {
    var manager_sql = "";
  } else {
    var manager_sql = " AND manager_id = '"+manager_id+"' ";    
  }

    //Звонки
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE zv LIKE ? AND brand = ? '+manager_sql+' ORDER by manager_id, model LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"Звонки", order: 0, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );

    //Визиты
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE vz LIKE ? AND brand = ? '+manager_sql+' ORDER by manager_id, model  LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"Визиты", order: 1, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );


    //Тестдрайвы
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE tst LIKE ? AND brand = ? '+manager_sql+' ORDER by manager_id, model  LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"Тест-драйвы", order: 2, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );

    //Договора
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE dg LIKE ? AND brand = ? '+manager_sql+' ORDER by manager_id, model  LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"Договора", order: 3, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );

    //Выдачи
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE vd LIKE ? AND brand = ? '+manager_sql+' ORDER by manager_id, model  LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"Выдачи", order: 4, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );

    //Расторжения
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE `out` LIKE ? AND dg != "0000-00-00 00:00:00" AND brand = ? '+manager_sql+' ORDER by manager_id, model  LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"Расторжения", order: 5, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );

    //OUT
    dfdArray.push( (function(){
      var dfd = $.Deferred();
      pool.query('SELECT * FROM `1_clients` WHERE `out` LIKE ? AND dg = "0000-00-00 00:00:00" AND brand = ? '+manager_sql+' ORDER by manager_id, model  LIMIT 500', [today, brand], function (err, rows, fields) {
        rows = correct_dates(rows);
        answer.push( {title:"OUT", order: 6, clients: rows, counts: rows.length} );
        dfd.resolve();
      });       
      return dfd.promise();
    })() );


    $.when.apply(null, dfdArray).then(function(){
      response.send( day );
    });

}



exports.loadAllBig2 = function(request, response) {
    

    pool.query('SELECT * FROM `1_do` WHERE brand=1', function (err, rows, fields) {

      response.send(rows);
    }); 
}

exports.saveDo = function(request, response) {
  var id = request.params.id;
  var changes = JSON.parse(request.query.changes);
  var client_id = request.query.client_id;

 jsCheckToken(request.query.token, response).done(function(user_id){

  query = "UPDATE 1_do SET ? WHERE id = '"+id+"'";
  //console.info("F = ",query, changes);

    pool.query(query, changes, function (err, rows, fields) {
      jsUpdateClient(client_id).done(function(client_id){
      query = "SELECT * FROM 1_clients WHERE id = '"+client_id+"'";
        pool.query(query, changes, function (err, clients, fields) {
          clients = correct_dates(clients);
          response.send(clients);
        });
      });
    }); 
  });

}

function jsClearCacheByBrand(brand_id) {

      global.collection.remove({type:"loadStat", brand: brand_id}, function(err, data){
      });

      global.collection.remove({type:"cup"}, function(err, data){
      });

}

exports.saveClient = function(request, response) {
  var changes = request.body.changes;
  var client_id = request.query.client_id;
  var brand_id = request.query.brand;

 jsCheckToken(request.query.token, response).done(function(user_id){
  if(changes.cost) changes.cost = changes.cost.toString().replace(" ","").replace(" ","").replace(" ","");
  query = "UPDATE 1_clients SET ? WHERE id = '"+client_id+"'";

    pool.query(query, changes, function (err, rows, fields) {
      console.info(err);
      response.send({affectedRows: rows?rows.affectedRows:""});
      jsClearCacheByBrand( request.query.brand );
    }); 
  });

}

exports.newAdmin = function(request, response) {
  var manager_id = request.query.manager_id;
  var do_type = request.query.do_type;
  var brand = request.query.brand;
  var today = request.query.today;

  var today_datetime = today + " " + tomysql( new Date ).split(" ")[1];

  //console.info("!",manager_id, do_type);

 jsCheckToken(request.query.token, response).done(function(user_id){

  var changes = {
    type: do_type,
    manager_id: manager_id,
    date1: today_datetime,
    brand: brand

  };

  query = "INSERT INTO `1_doadmin` SET ?";

    pool.query(query, changes, function (err, rows, fields) {
      var insert_id = rows.insertId;
      response.send({insertId: insert_id});
      //console.info(err, rows);
    });

  });

}


exports.saveAdmin = function(request, response) {
  var changes = request.body.changes;
  var mydo_id = changes.id;

 jsCheckToken(request.query.token, response).done(function(user_id){

  query = "UPDATE 1_doadmin SET ? WHERE id = '"+mydo_id+"'";

    pool.query(query, changes, function (err, rows, fields) {
      response.send({affectedRows: rows.affectedRows});

    //global.stat_cache = {}; //обнуляем кеш
      jsClearCacheByBrand( request.query.brand );


  //    global.stat_cache = {}; //обнуляем кеш
    }); 
  });

}

exports.newDo = function(request, response) {
  var id = request.params.id;
  var client_id = request.query.client_id;
  var do_type = request.query.do_type;
  var brand_id = request.query.brand;
  var manager_id = request.query.manager;


  //console.info(request.query, brand_id);

 jsCheckToken(request.query.token, response).done(function(user_id){
  if(manager_id == -1) manager_id = user_id;
  query = "INSERT INTO 1_do SET manager_id = ?, client = ?, type = ?, text = ?, brand = ?, date2 = DATE_ADD(NOW(), INTERVAL 5 MINUTE), date1 = DATE_ADD(NOW(), INTERVAL 0 MINUTE), host_id = ? ";

    pool.query(query, [ manager_id, client_id, do_type, do_type, brand_id, user_id ], function (err, rows, fields) {
      var insert_id = rows.insertId;
      response.send({insert_id: insert_id});
      //console.info("ADDED rows = ", rows, err);
    }); 
  });

}

exports.loadModels = function(request, response) {
    
  var brand_id = request.query.brand;


  pool.query('SELECT * FROM `1_organization`',function (err, organizations, fields) {
	  pool.query('SELECT * FROM `1_test` WHERE brand=?',[brand_id], function (err, tests, fields) {
	    pool.query('SELECT * FROM `1_models` ORDER by model', function (err, models, fields) {
	      pool.query('SELECT * FROM `1_brands` ORDER by title', function (err, brands, fields) {
	        pool.query('SELECT * FROM `1_users_group`', function (err, users_group, fields) {
	          response.send({models:models, brands: brands, users_group: users_group, tests: tests, organizations: organizations});
	        });
	      });
	    }); 
	  });
  });

}

exports.newModel = function(request, response) {

 var brand_id = request.query.brand;

 //console.info(brand_id);

 jsCheckToken(request.query.token, response).done(function(user_id){
    pool.query('INSERT INTO `1_models` SET `brand` = ?, `model` = "Новая модель", `cost` = 0, `show` = 1, `short` = "Новая"',[brand_id], function (err, rows, fields) {
    response.send({rows:rows, err: err});
    }); 
  });

}

exports.saveModel = function(request, response) {

 var brand_id = request.query.brand;
 var model_id = request.query.model_id;
 var changes = request.body.changes;

 //console.info("Сохраняю",brand_id, changes);

 jsCheckToken(request.query.token, response).done(function(user_id){
   $.each(changes, function(i, ch){
      pool.query('UPDATE `1_models` SET ? WHERE id = "'+ch.id+'"',[ch], function (err, rows, fields) {
      response.send({rows:rows, err: err});
      }); 
   });

  });

}


exports.deleteModel = function(request, response) {

 var brand_id = request.query.brand;
 var del_id = request.query.del_id;

 jsCheckToken(request.query.token, response).done(function(user_id){
    pool.query('SELECT count(*) cnt FROM `1_clients` WHERE model = ?',[del_id], function (err, rows, fields) {
      if(rows[0].cnt>0) {
        response.send({rows:rows, err: err}); 
      } else {
      pool.query('DELETE FROM `1_models` WHERE id = ?',[del_id], function (err, rows, fields) {
        response.send({rows:rows, err: err});
      });
      
      }
    }); 
  });

}

exports.newTest = function(request, response) {

 var brand_id = request.query.brand;

 //console.info(brand_id);

 jsCheckToken(request.query.token, response).done(function(user_id){
    pool.query('INSERT INTO `1_test` SET `brand` = ?',[brand_id], function (err, rows, fields) {
    response.send({rows:rows, err: err});
    }); 
  });

}

exports.saveTest = function(request, response) {

 var brand_id = request.query.brand;
 var changes = request.body.test;

 //console.info("Сохраняю",brand_id, changes);

 jsCheckToken(request.query.token, response).done(function(user_id){
      pool.query('UPDATE `1_test` SET ? WHERE id = "'+changes.id+'"',[changes], function (err, rows, fields) {
      response.send({rows:rows, err: err});
   });

  });

}

exports.deleteTest = function(request, response) {

 var brand_id = request.query.brand;
 var test_id = request.query.id;

 jsCheckToken(request.query.token, response).done(function(user_id){
    pool.query('SELECT count(*) cnt FROM `1_do` WHERE test_model_id = ?',[test_id], function (err, mydo, fields) {
      if( mydo && (mydo[0].cnt==0) ) {
	      pool.query('DELETE FROM `1_test` WHERE id = ?',[test_id], function (err, rows, fields) {
	        response.send({rows:rows, err: err});
	      });
  	  }
    });
  });

}

exports.deleteOrganizations = function(request, response) {

 var brand_id = request.query.brand;
 var test_id = request.query.id;

 jsCheckToken(request.query.token, response).done(function(user_id){
    pool.query('SELECT count(*) cnt FROM `1_test` WHERE organization = ?',[test_id], function (err, mydo, fields) {
      if( mydo && (mydo[0].cnt==0) ) {
	      pool.query('DELETE FROM `1_organization` WHERE id = ?',[test_id], function (err, rows, fields) {
	        response.send({rows:rows, err: err});
	      });
  	  }
    });
  });

}

exports.newOrganizations = function(request, response) {

 var brand_id = request.query.brand;

 //console.info(brand_id);

 jsCheckToken(request.query.token, response).done(function(user_id){
    pool.query('INSERT INTO `1_organization` SET `city` = ?',['Челябинск'], function (err, rows, fields) {
    response.send({rows:rows, err: err});
    }); 
  });

}

exports.saveOrganizations = function(request, response) {


 var brand_id = request.query.brand;
 var changes = request.body.test;

 //console.info("Сохраняю",brand_id, changes);

 jsCheckToken(request.query.token, response).done(function(user_id){
      pool.query('UPDATE `1_organization` SET ? WHERE id = "'+changes.id+'"',[changes], function (err, rows, fields) {
      response.send({rows:rows, err: err});
   });

  });

}



exports.removeClient = function(request, response) {

 var client_id = request.query.client_id;

 //console.info(client_id);

 jsCheckToken(request.query.token, response).done(function(user_id){
    pool.query('DELETE FROM 1_do WHERE client = ?',[client_id], function (err, rows, fields) {
      pool.query('DELETE FROM `1_clients` WHERE id = ?',[client_id], function (err, rows, fields) {
        response.send({rows:rows, err: err});
        //console.info({rows:rows, err: err});
      //global.stat_cache = {}; //обнуляем кеш
        jsClearCacheByBrand( request.query.brand );

        setTimeout(function(){
            process.send({ message_type: "loadstat", brand: request.query.brand });
        },5);

      });
    }); 
  });

}

exports.deleteAdmin = function(request, response) {

 var brand_id = request.query.brand;
 var mydo_id = request.query.mydo_id;

 jsCheckToken(request.query.token, response).done(function(user_id){
    pool.query('DELETE FROM `1_doadmin` WHERE id = ?',[mydo_id], function (err, rows, fields) {
      response.send({rows:rows, err: err});

    //global.stat_cache = {}; //обнуляем кеш
    jsClearCacheByBrand( request.query.brand );

    setTimeout(function(){
            process.send({ message_type: "loadstat", brand: request.query.brand });

    },5);

    });
  });

}

exports.removeDo = function(request, response) {

 var do_id = request.query.do_id;
 if(!do_id) {
  response.send({error:"error"});
  return false;
 }

 jsCheckToken(request.query.token, response).done(function(user_id){
  pool.query('SELECT client FROM 1_do WHERE id = ? LIMIT 1',[do_id], function (err, clients, fields) {
    pool.query('DELETE FROM 1_do WHERE id = ? LIMIT 1',[do_id], function (err, rows, fields) {
      jsUpdateClient(clients[0]?clients[0].client:0).then(function(){
        response.send({rows:rows, err: err});
        //console.info({rows:rows, err: err});        
      });
    }); 
   });
  });

}


exports.loadStatAll = function(request, response) {
    pool.query('SELECT id, brand, model, creditmanager, zv, vz, tst, dg, vd, `out`, status, commercial, manager FROM `1_clients`', function (err, rows, fields) {
      rows = correct_dates(rows, "no_zero_date");
      response.send(rows);
    });   
}

exports.loadStatCup = function(request, response) {
  var today = request.query.today_date;
  var today_date = today?today:"2013-07-16";
  var today_month = today_date.substr(0,7);

  var brand_id = request.query.brand;
  var cache_id = md5(JSON.stringify(request.query) + brand_id);

  global.collection.find({ type: "cup", cache_id: cache_id }).toArray( function(err, the_cache){

	  if( the_cache.length ) {
	    response.send( the_cache[0]["mydata"] ); //статистика кешируется нижняя и левая
	    //console.info("info_from_cache_CUP", cache_id);
	    //console.info("Stat from cache "+cache_id+", brand = ", brand_id,global.stat_cache);
	  } else {


	  pool.query('SELECT * FROM `1_plan` WHERE `month` = "'+today_month+'"', function (err, plans, fields) {
	      //console.info(plans);
	    pool.query('SELECT * FROM `1_brands` WHERE `Show` = 1 ORDER by brand_group, title', function (err, brands, fields) {
	      brands.push({id: -1, title: "Итого №1", brand_group: 1, logo: "logo-seyho.png"});
	      brands.push({id: -2, title: "Итого №2", brand_group: 2, logo: "logo-seyho.png"});
	      brands.push({id: -3, title: "Итого №3", brand_group: 3, logo: "logo-seyho.png"});
	      brands.push({id: 0, title: "Итого", brand_group: 4,logo: "logo-seyho.png"});

	      $.each(brands, function(i, brand){
	      var plan = _.find(plans, function(el){ return el.brand == brand.id; });
	        brand.cup = { 
	              dogovor: 0,
	              dogovor_month: 0,

	              vidacha: 0,
	              vidacha_month: 0,

	              out: 0,
	              out_month: 0,

	              zvonok: 0,
	              zvonok_month: 0,

	              zvonok_admin: 0,
	              zvonok_month_admin: 0,


	              vizit: 0,
	              vizit_month: 0,

	              vizit_admin: 0,
	              vizit_month_admin: 0,

	              test: 0,
	              test_month: 0,

	              plan: plan?plan.plan:0,

	              prognoz_5: 0,
	              prognoz_4: 0,
	              prognoz_3: 0

	              };
	      });

	      function jsCupIncrement(brands, brand_id, field_name) {
	      var cup_element = _.find(brands, function(el){ return el.id == brand_id; });
	      if(cup_element) cup_element.cup[field_name] += 1;

	      var cup_element = _.find(brands, function(el){ return el.id == -cup_element.brand_group; });
	      if(cup_element) cup_element.cup[field_name] += 1;

	      var cup_element = _.find(brands, function(el){ return el.id == 0; });
	      if(cup_element) cup_element.cup[field_name] += 1;

	      }

	      function jsFindBrandGroup(brand_id) {
	      var cup_element = _.find(brands, function(el){ return el.id == brand_id; });

	      }

	    pool.query('SELECT * FROM 1_doadmin WHERE date1 LIKE ?', [today_month+"%"], function (err, do_admin, fields){
	      do_admin = correct_dates(do_admin);
	        pool.query('SELECT id, brand, zv, vz, tst, dg, vd, `out`, icon2 FROM `1_clients` WHERE'+
	          ' zv LIKE "'+today_month+'%" OR vz LIKE "'+today_month+'%" OR tst LIKE "'+today_month+'%" OR dg LIKE "'+today_month+'%" OR vd LIKE "'+today_month+'%" OR `out` LIKE "'+today_month+'%" OR (icon2 > 2 AND vd = "0000-00-00 00:00:00")',  function (err, cars, fields) {

          pool.query('SELECT 1_clients.*, 1_do.brand brand, 1_do.manager_id manager_id2, 1_do.date2 tst, 1_test.model_id tstmodel FROM `1_do` LEFT JOIN 1_clients ON 1_do.client=1_clients.id LEFT JOIN 1_test ON 1_do.test_model_id = 1_test.id WHERE 1_do.date2 LIKE ? AND 1_do.checked !="0000-00-00 00:00:00" AND 1_do.type="Тест-драйв" ', [ today_month+"%"], function (err, cars_tst, fields) {


	            cars = correct_dates(cars,"zero_date");
              cars_tst = correct_dates(cars_tst,"zero_date");
	            //console.info("cars",cars);

	            $.each(do_admin, function(i, do_adm){
	              //Звонки
	              if( (do_adm['type']=="zv") &&
	                (do_adm.date1.indexOf(today_month)!=-1) ) {
	                jsCupIncrement(brands, do_adm.brand, "zvonok_month_admin");
	                if( (do_adm.date1.indexOf(today_date)!=-1) ) {
	                  jsCupIncrement(brands, do_adm.brand, "zvonok_admin");
	                }
	              }
	              //Визиты
	              if( (do_adm['type']=="vz") &&
	                (do_adm.date1.indexOf(today_month)!=-1) ) {
	                jsCupIncrement(brands, do_adm.brand, "vizit_month_admin");
	                if( (do_adm.date1.indexOf(today_date)!=-1) ) {
	                  jsCupIncrement(brands, do_adm.brand, "vizit_admin");
	                }
	              }

	            });
              $.each(cars_tst, function(i, car){
                //Тесты
                if( (car.tst!="") && 
                  (car.tst.indexOf(today_month)!=-1) ) {
                  jsCupIncrement(brands, car.brand, "test_month");
                  if( (car.tst.indexOf(today_date)!=-1) ) {
                    jsCupIncrement(brands, car.brand, "test");
                  }
                }
              });

	            $.each(cars, function(i, car){

	              //Договора
	              if( (car.dg!="") &&
	                (car.dg.indexOf(today_month)!=-1) ) {
	                jsCupIncrement(brands, car.brand, "dogovor_month");
	                if( (car.dg.indexOf(today_date)!=-1) ) {
	                  jsCupIncrement(brands, car.brand, "dogovor");
	                }
	              }

	              //Выдачи
	              if( (car.vd!="") &&
	                (car.vd.indexOf(today_month)!=-1) ) {
	                jsCupIncrement(brands, car.brand, "vidacha_month");
	                if( (car.vd.indexOf(today_date)!=-1) ) {
	                  jsCupIncrement(brands, car.brand, "vidacha");
	                }
	              }

	              //Расторжения
	              if( (car.dg!="") && (car.out!="") && (car.vd=="") &&
	                (car.out.indexOf(today_month)!=-1) ) {
	                jsCupIncrement(brands, car.brand, "out_month");
	                if( (car.out.indexOf(today_date)!=-1) ) {
	                  jsCupIncrement(brands, car.brand, "out");
	                }
	              }

	              //Звонки (первичные)
	              if( (car.zv!="") && 
	                (car.zv.indexOf(today_month)!=-1) ) {
	                jsCupIncrement(brands, car.brand, "zvonok_month");
	                if( (car.zv.indexOf(today_date)!=-1) ) {
	                  jsCupIncrement(brands, car.brand, "zvonok");
	                }
	              }

	              //Визиты (первичные)
	              if( (car.vz!="") && 
	                (car.vz.indexOf(today_month)!=-1) ) {
	                jsCupIncrement(brands, car.brand, "vizit_month");
	                if( (car.vz.indexOf(today_date)!=-1) ) {
	                  jsCupIncrement(brands, car.brand, "vizit");
	                }
	              }


	              //Прогнозы продаж icon
	              if( (car.icon2>2) && (car.dg!="") && (car.vd=="") ) {
	                if((car.icon2==5)) jsCupIncrement(brands, car.brand, "prognoz_5");
	                if((car.icon2==4)) jsCupIncrement(brands, car.brand, "prognoz_4");
	                if((car.icon2==3)) jsCupIncrement(brands, car.brand, "prognoz_3");
	              }

	            });


	        brands = _.sortBy(brands, function(br){ return (br.brand_group) });

	            answer = {brands: brands, cars: ""};

	        //console.info(answer);

	            //global.stat_cache_cup[ cache_id ] = answer;

				  global.collection.update({cache_id: cache_id}, {type: "cup", brand: brand_id, cache_id: cache_id, mydata: answer, time: jsNow()}, { upsert: true }, function(err, docs){
				 	  global.collection.count(function(err, count) {
				      });    	
				  });


	            response.send(answer);
	        });

	    });

	      
	    }); //1_brands
     });
	  }); //1_plan  
	 } //else cache
    });
}

exports.loadStatCupCars = function(request, response) {
  var today = request.query.today_date;
  var today_date = today?today:"2013-07-16";
  var today_month = today_date.substr(0,7);

  var do_type = request.query.do_type;
  var brand_id = request.query.brand;

  var myorder = "model,manager_id";

  var filter = " true ";


  if(do_type=="dg") {
    filter = ' dg LIKE "'+today_date+'%"';
  }

  if(do_type=="vd") {
    filter = ' vd LIKE "'+today_date+'%"';
  }

  if(do_type=="out") {
    filter = ' dg != "'+NO_DATE+'" AND `out` LIKE "'+today_date+'%"';
  }

  if(do_type=="zv") {
    filter = ' `zv` LIKE "'+today_date+'%"';
  }

  if(do_type=="vz") {
    filter = ' `vz` LIKE "'+today_date+'%"';
  }

  if(do_type=="tst") {
    filter = ' `tst` LIKE "'+today_date+'%"';
  }

  if(do_type=="prognoz") {
    filter = ' vd = "'+NO_DATE+'" AND `out` = "'+NO_DATE+'" AND icon2 >= 3 ';
    var myorder = "icon2 DESC";
  }

 if( filter == " true ") {
  response.send();
  return true;
 }


  var query = 'SELECT * FROM `1_clients` WHERE '+filter+' AND brand="'+brand_id+'" ORDER by '+myorder;

  if(do_type == "tst") {

   query = 'SELECT 1_clients.*, 1_do.manager_id manager_id2, 1_do.date2 tst, 1_test.model_id tstmodel FROM `1_do` LEFT JOIN 1_clients ON 1_do.client=1_clients.id LEFT JOIN 1_test ON 1_do.test_model_id = 1_test.id WHERE 1_do.brand = "'+brand_id+'" AND 1_do.date2 LIKE "'+today_date+'%" AND 1_do.checked !="0000-00-00 00:00:00" AND 1_do.type="Тест-драйв" ORDER by 1_clients.model';
  }


  //console.info(do_type, query); 


  pool.query(query, function (err, cars, fields) {
      cars = correct_dates(cars);
      response.send(cars);
  });
}

function jsUpdateClient(client_id) {
  var dfd = $.Deferred();

  if(!client_id) {
    dfd.resolve();
    return dfd.promise();
  }


 pool.query('SELECT * FROM `1_clients` WHERE 1_clients.id=?',[client_id], function (err, the_client, fields) {
    pool.query('SELECT * FROM `1_do` WHERE client=? ORDER by date2',[client_id], function (err, client_do, fields) {
        client_do = correct_dates(client_do, "no_zero_dates");

        var answer = {
               zv:"0000-00-00 00:00:00",
               vz:"0000-00-00 00:00:00",
               tst:"0000-00-00 00:00:00",
               dg:"0000-00-00 00:00:00",
               vd:"0000-00-00 00:00:00",
               out:"0000-00-00 00:00:00",
               bu:"0000-00-00 00:00:00",
               na_id:"",
               na_date:"0000-00-00 00:00:00",
               na_title:"",
               na_type:"",
               out_reason:""
               }


        var first_action = false;
        $.each(client_do, function(i,mydo){

        if( (mydo.checked=="") && (answer.na_id=="") ) {
          answer.na_id = mydo.id;
          answer.na_date = mydo.date2;
          answer.na_title = mydo.text;
          answer.na_type = mydo.type;
        }

          if(mydo.type == "Визит") {
            if(!first_action && mydo.checked!="") {
              answer.vz = mydo.date2;
              first_action = true;
            }
          }

          if(mydo.type == "Тест-драйв") {
            if(mydo.checked!="") {
              if(answer.tst==NO_DATE) {
                answer.tst = mydo.date2;
              }
              if(!first_action) {
                answer.vz = mydo.date2;
                first_action = true;
              }
            }
          }

          if(mydo.type == "Договор") {
            if(mydo.checked!="") {
              if(answer.dg==NO_DATE) {
                answer.dg = mydo.date2;
              }
              if(!first_action) {
                answer.vz = mydo.date2;
                first_action = true;
              }
            }
          }

          if(mydo.type == "Звонок") {
            if(!first_action && mydo.checked!="") {
              answer.zv = mydo.date2;
              first_action = true;
            }
          }

          if(mydo.type == "Кредит") {
            if(!first_action && mydo.checked!="") {
              answer.zv = mydo.date2;
              first_action = true;
            }
          }

          if(mydo.type == "OUT") {
            if(mydo.checked!="") {
              if(answer.out==NO_DATE) {
                answer.out = mydo.date2;
                answer.out_reason = mydo.text;
                answer.bu = "";
              }
              if(!first_action) {
                answer.vz = mydo.date2;
                first_action = true;
              }
            }
          }

          if(mydo.type == "Выдача") {
            if(mydo.checked!="") {
              if(answer.vd==NO_DATE) {
                answer.vd = mydo.date2;
                answer.bu = "";
              }
              if(!first_action) {
                answer.vz = mydo.date2;
                first_action = true;
              }
            }
          }

          if(mydo.type == "Трейд-ин") {
            if( (answer.vd == "0000-00-00 00:00:00") && (answer.out=="0000-00-00 00:00:00") ) {
              answer.bu = mydo.date2;
            }
          }


        });

      query = "UPDATE 1_clients SET ? WHERE id = '"+client_id+"'";

        pool.query(query, answer, function (err, rows, fields) {

          dfd.resolve( client_id );
          //console.info("client_id="+client_id+" OK: ", rows.affectedRows);
    //    global.stat_cache = {}; //обнуляем кеш
        if(the_client[0]) jsClearCacheByBrand( the_client[0].brand );

        setTimeout(function(){
            process.send({ message_type: "loadstat", brand: the_client[0].brand });

        },5);
          
        }); 


        
    });
  });
return dfd.promise();
 
}

exports.updateClient = function(request, response) {
  var client_id = request.params.id;
  var dfdArray = [];
  var dfd = $.Deferred();

  dfdArray.push(dfd);
  pool.query('SELECT id FROM `1_clients` LIMIT 3000000',[client_id], function (err, clients, fields) {
     $.each(clients, function(i, cl){
    dfdArray.push( jsUpdateClient(cl.id) );     
    dfd.resolve();
     });

      
  });

  $.when.apply(null, dfdArray).done(function(){
    response.send("ok");
    //console.info("ok");
  });
}

exports.regNewUser = function(request, response) {
  var reg_user = request.body.reg_user;
  //console.info(reg_user);

  pool.query('SELECT count(*) cnt FROM `1_users` WHERE email = ?',[reg_user.email], function (err, exist_users, fields) {
    //console.info(exist_users);
    if(exist_users[0].cnt>0) { //если такой пользователь уже есть
      //console.info("user_exists");
      response.send("user_exists");
    } else {

      var new_fields = {
        fio: reg_user.fio,
        user_group: reg_user.users_group,
        email: reg_user.email,
        md5email: reg_user.md5email,
        password: reg_user.password,
        brand: reg_user.brand,
        active: 0,
        md5password: reg_user.password,
        phone: reg_user.phone

      };

      pool.query('INSERT INTO `1_users` SET ?',[new_fields], function (err, rows, fields) {
        //console.info(rows);
        response.send(rows);
        jsSendMail( "Новый пользователь: "+reg_user.fio+", brand="+reg_user.brand+", №"+reg_user.users_group, JSON.stringify(new_fields) );
      });
    }
  });


}

function _sqllog(params) {

  params.date1 = params.date1?params.date1: tomysql( new Date );
  params.ip = params.request?(params.request.connection.remoteAddress+ " : " +params.request.headers['user-agent']):"";
  if(params.request) delete params.request;

  pool.query('INSERT INTO `1_log` SET ?',[params], function (err, rows, fields) {
    //console.info(err, rows);
  }); 

}

//Проверяем откуда мы зашли, изнутри сети или снаружи
function jsIsInside(params){
  var ip = params.request.connection.remoteAddress;
  if( (params.user[0].user_group == 1) || //учредитель
    (params.user[0].user_group == 2) || //директор
    (params.user[0].user_group == 3) || //руководитель отдела продаж
    (params.user[0].user_group == 10) || //админ системы
    (/192.168.200/.test(ip)) ||
    (/62.165.38/.test(ip)) ||
    (/79.134.19/.test(ip)) || //магнитка
    (/5.79.218/.test(ip)) ||
    (/127.0.0.1/.test(ip)) ||
    (/37.1/.test(ip)) ) {
    return true;
  } else {
    return false;
  }
}


exports.saveFullUserInfo = function(request, response) {
 var brand_id = request.query.brand;
 var changes = JSON.parse( request.query.changes );

 console.info("Сохраняю:::::",brand_id, changes, changes.id);

 jsCheckToken(request.query.token, response).done(function(user_id){
      pool.query('UPDATE `1_users` SET ? WHERE id = "'+changes.id+'"',[changes], function (err, rows, fields) {
      	response.send({rows:rows, err: err});
   	  });

  });

}


exports.loadFullUserInfo = function(request, response) {


  var brand = request.query.brand;
  var user_id1 = request.query.user_id;
  

 jsCheckToken(request.query.token, response).done(function(user_id){

  pool.query('SELECT * FROM `1_users` WHERE id = ? LIMIT 1',[user_id1], function (err, user, fields) {    
  		  var user_one = user[0];
  		  delete user_one.password;
  		  delete user_one.md5email;
  		  delete user_one.md5password;
  		  delete user_one.lastvizit;
  		  delete user_one.brands;
          response.send({user: user_one});
  });


 });

}


exports.loadOrganizations = function(request, response) {


  var brand = request.query.brand;
  

 jsCheckToken(request.query.token, response).done(function(user_id){

  pool.query('SELECT * FROM `1_organization`', function (err, organizations, fields) {    
          response.send({organizations: organizations});
  });


 });

}


exports.loadUserInfo = function(request, response) {


  var brand = request.query.brand;
  

 jsCheckToken(request.query.token, response).done(function(user_id){
  _sqllog({manager: user_id, request: request, text:"Запрос информации loadUserInfo"});
  //console.info("USER_ID:", user_id);
  pool.query('SELECT active, id, brand, email, fio, message_on, user_group, phone, brands FROM `1_users` WHERE id = ? LIMIT 1',[user_id], function (err, user, fields) {    
    pool.query('SELECT active, id, brand, fio, message_on, user_group, phone FROM `1_users` ORDER BY brand, fio', function (err, users, fields) {
      pool.query('SELECT * FROM `1_commercials`', function (err, commercials, fields) {
          pool.query('SELECT * FROM `1_users_group`', function (err, users_group, fields) {
            //response.send({models:models, brands: brands, users_group: users_group });

            var isInsideVar = jsIsInside({request: request, user: user});

          response.send({user: user, users: users, commercials: commercials, users_group: users_group, isInside: isInsideVar});
          });
      });
    });
  });


 });
}


exports.loadXLS = function(request, response) {
  answer = {hi: "hello" };
  var parseXlsx = require('excel');

  parseXlsx('1.xlsx', function(err, data) {
      if(err) throw err;
      // data is an array of arrays
      response.send( data );
  });
  
}

exports.parseManagers = function(request, response) {

  pool.query('SELECT id, fio, brand FROM `1_users`', function (err, sql_users, fields) {
    var users = {};
    $.each(sql_users, function(i, user){
      if(!users[user.brand]) users[user.brand] = {};
      users[user.brand][user.fio] = user;
    });


    pool.query('SELECT id, manager, brand FROM `1_clients`', function (err, clients, fields) {
      count = 0;
      $.each(clients, function(i, client){
        client.brand = parseInt(client.brand);

        if(users[client.brand] && users[client.brand][client.manager]) var manager_id = users[client.brand][client.manager].id;
        else var manager_id = -1;

        var txt_query = "UPDATE 1_clients SET manager_id = '"+manager_id+"' WHERE id='"+client.id+"'; ";
        pool.query(txt_query, function (err, rows, fields) {
            //console.info([err, rows]);
        });

        //console.info("client = ", client.id, client.manager, manager_id );
      });
    }); 

  });
}

exports.parseManagers2 = function(request, response) {

  pool.query('SELECT id, fio, brand FROM `1_users`', function (err, sql_users, fields) {
    var users = {};
    $.each(sql_users, function(i, user){
      if(!users[user.brand]) users[user.brand] = {};
      users[user.brand][user.fio] = user;
    });


    pool.query('SELECT id, manager, brand FROM `1_do`', function (err, clients, fields) {
      count = 0;
      $.each(clients, function(i, client){
        client.brand = parseInt(client.brand);

        if(users[client.brand] && users[client.brand][client.manager]) var manager_id = users[client.brand][client.manager].id;
        else var manager_id = -1;

        var txt_query = "UPDATE 1_do SET manager_id = '"+manager_id+"' WHERE id='"+client.id+"'; ";
        pool.query(txt_query, function (err, rows, fields) {
            //console.info([err, rows]);
        });

        //console.info("client = ", client.id, client.manager, manager_id );
      });
    }); 

  });
}

exports.parseEmail = function(request, response) {
  //console.info("parseEmail");
  pool.query('SELECT * FROM `1_users`', function (err, sql_users, fields) {
    $.each(sql_users, function(i, user){
      var right_md5 = md5( user.email.toLowerCase() + "990990");

      if(user.md5email != right_md5) {
        
        pool.query('UPDATE `1_users` SET md5email="'+right_md5+'" WHERE id="'+user.id+'" LIMIT 1', function (err, row, fields) {
          //console.info(user.email,user.md5email, right_md5, row );
        });
      }

    });
    response.send(sql_users);

  });
}


exports.exportClients = function(request, response) {

  pool.query('SELECT * FROM `1_clients` WHERE brand = 1 OR brand = 13', function (err, clients, fields) {
    var users = {};
    clients = correct_dates(clients);
    var txt1 = "";
    $.each(clients[0], function(key, value){
        if(value==NaN) key = ".";
        if( !_.isFunction(key) ) txt1 += ""+key+";";
    });
    txt1 += "<br>";
    $.each(clients, function(i, client){
      $.each(client, function(key, value){
        if(value==NaN) value = ".";
        if( !_.isFunction(value) ) txt1 += ""+value+";";
      });
      txt1 += "<br>";
    });
      response.send( txt1 );
  });
}


exports.loadStatTable = function(request, response) {

  var brand_id = request.query.brand;

  var cache_id = md5( brand_id + "salt");
  console.info("cache_id"+cache_id);

  global.collection.find({ type: "cup", cache_id: cache_id }).toArray( function(err, the_cache){

	  if( the_cache.length ) {
	    response.send( the_cache[0]["mydata"] ); //статистика кешируется нижняя и левая
	    //console.info("info_from_cache_CUP_GRAPH!!!", cache_id);
	    //console.info("Stat from cache "+cache_id+", brand = ", brand_id,global.stat_cache);
	  } else {


    var answer = {};

    pool.query('SELECT * FROM `1_models` WHERE brand=?',[brand_id], function (err, models, fields) {


      var functions = [
        {
          do_type: "vd",
          do_image: "1vidacha.png",
          do_title: "Выдача",
          value: 0, 
          ids: [],
          the_function: function(car, col){
          var do_type = "vd";
          //console.info(car.fio, col.col);
          var month = (col.col>1)?col.col:'0'+col.col;
          if( (car[do_type]) && (car[do_type].indexOf("-"+month+"-")!=-1) ) {
            return true;
          } else {
            return false;
          }
          
          } 
        },
        {
          do_type: "dg",
          do_image: "1dogovor.png",
          do_title: "Договора",
          value: 0, 
          ids: [],
          the_function: function(car, col){
          var do_type = "dg";
          //console.info(car.fio, col.col);
          var month = (col.col>1)?col.col:'0'+col.col;
          //console.info("DO_MONTH",month, car[do_type]);
          if( (car[do_type]) && (car[do_type].indexOf("-"+month+"-")!=-1) ) {
            return true;
          } else {
            return false;
          }
          
          } 
        },
        {
          do_type: "out",
          do_image: "1out.png",
          do_title: "Расторжения",
          value: 0, 
          ids: [],
          the_function: function(car, col){
          var do_type = "out";
          //console.info(car.fio, col.col);
          var month = (col.col>1)?col.col:'0'+col.col;
          if( (car.dg!="") && (car[do_type]) && (car[do_type].indexOf("-"+month+"-")!=-1) ) {
            return true;
          } else {
            return false;
          }
          
          } 
        },
        {
          do_type: "tst",
          do_image: "1test-drive.png",
          do_title: "Тест-драйвы",
          value: 0, 
          ids: [],
          the_function: function(car, col){
          var do_type = "tst";
          //console.info(car.fio, col.col);
          var month = (col.col>1)?col.col:'0'+col.col;
          if( (car[do_type]) && (car[do_type].indexOf("-"+month+"-")!=-1) ) {
            return true;
          } else {
            return false;
          }
          
          } 
        },
        {
          do_type: "vz",
          do_image: "1vizit.png",
          do_title: "Визиты",
          value: 0, 
          ids: [],
          the_function: function(car, col){
          var do_type = "vz";
          //console.info(car.fio, col.col);
          var month = (col.col>1)?col.col:'0'+col.col;
          if( (car[do_type]) && (car[do_type].indexOf("-"+month+"-")!=-1) ) {
            return true;
          } else {
            return false;
          }
          
          } 
        },
        {
          do_type: "zv",
          do_image: "1zvonok.png",
          do_title: "Звонки",
          value: 0, 
          ids: [],
          the_function: function(car, col){
          var do_type = "zv";
          //console.info(car.fio, col.col);
          var month = (col.col>1)?col.col:'0'+col.col;
          if( (car[do_type]) && (car[do_type].indexOf("-"+month+"-")!=-1) ) {
            return true;
          } else {
            return false;
          }
          
          } 
        }

      ]


      var col_function_month = function(car, col){
        //console.info(car.fio, col.col);
        var month = (col.col>1)?col.col:'0'+col.col;
        if( (car[do_type]) && (car[do_type].indexOf("2013-")!=-1) ) {
          return true;
        } else {
          return false;
        }
        
      };    

      $.each(models, function(i, model){
        var cols = [];
        var fu;
        for(var i=1; i<=12; i+=1) {
/*          if(i==200) {
            fu = col_function_month;
          } else {
            fu = col_function;
          }
*/          cols.push({
                 col:i,
                 do_types: jsClone(functions)
                });
        }
        if(!answer[model.id]) answer[ model.id ] = {cols:cols, model: model.model};     
      });


      //console.info("BRAND:", brand_id);
      pool.query('SELECT * FROM `1_clients` WHERE brand=?',[brand_id], function (err, cars, fields) {
        cars = correct_dates(cars, "no_zero_dates");
        
        $.each(cars, function(k, car){
          if( answer[car.model] ) {
            $.each( answer[car.model].cols, function(l, col){
              $.each(col.do_types, function(k, the_function){
                if(the_function.the_function(car, col)) { 
                  the_function.value += 1;
                  //the_function.ids.push(car.id);
                }
              });
              


            });
          }
        }); //cars  
      
          response.send(answer);

		  global.collection.update({cache_id: cache_id}, {type: "cup", brand: brand_id, cache_id: cache_id, mydata: answer, time: jsNow(), graph: "TRUE"}, { upsert: true }, function(err, docs){
		 	  global.collection.count(function(err, count) {
		      });    	
		  });

        }); //cars
    }); //model
  }
  });
}

exports.sendSMS = function(request, response) {

};

exports.checkSMS = function(request, response) {

  var hour = (new Date).getHours();
  
  if( (hour >= 0) && (hour < 7) ) return false;

  var sms_texts = [];

  var Sms = require('node-smsc').Smsc,
    sms = new Sms('imater', '990990', {sender: 'Reginas-FPK'});

  var query = "SELECT 1_u.fio myhost, DATE_ADD(NOW(), INTERVAL 1_do.sms MINUTE) now_time, date2 remind_time, 1_users.phone, 1_clients.phone1, 1_clients.fio, 1_do.*, 1_models.short  FROM 1_do LEFT JOIN 1_users ON 1_users.id=1_do.manager_id LEFT JOIN 1_clients ON 1_clients.id = 1_do.client LEFT JOIN 1_users 1_u ON 1_u.id = 1_do.host_id AND 1_do.host_id!=1_do.manager_id LEFT JOIN 1_models ON 1_clients.model = 1_models.id WHERE sms>0 AND checked = '0000-00-00 00:00:00' AND sms_send = 0 AND DATE_ADD(NOW(), INTERVAL 1_do.sms MINUTE) > date2";

  pool.query(query, function (err, mydo, fields) {
    mydo = correct_dates(mydo);
    var ids = "";
    if(mydo)
    $.each(mydo, function(i,the_do){
      //var t_time = the_do.remind_time.toString().split(" ")[1];
      //var time1 = t_time[0]+":"+t_time[1];
      var host = "";
      if(the_do.myhost) {
        var host = ". Поручил: "+the_do.myhost.split(" ")[0];
      }

      var time = the_do.remind_time.toString().split(" ")[1].substr(0,5);

      var dots = "";
      if(the_do.text.length>80) dots = "..";

      var text = the_do.type + " "+time+ ". "+ the_do.text.substr(0,80)+dots+ ". "+the_do.fio+" ["+the_do['short']+"] "+the_do.phone1+"" + host;
      sms_texts.push({phone: the_do.phone, text: text});
      ids += the_do.id+",";

    });
    ids += "0";

    if(sms_texts.length) {

      if(isProduction) {
      sms.list(sms_texts, function (err, result) {
          if(result.cnt>0) {
            
            var query = "UPDATE 1_do SET sms_send = 1 WHERE id IN ("+ids+")";
          pool.query(query, function (err, rows, fields) {
            if(rows) {
              jsSendMail("Отправил SMS: "+ids, JSON.stringify(sms_texts));
            }
          });
          }
          
      });
      }       
    }


  });

  

/*var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "fpk.reginas@gmail.com",
        pass: "uuS4foos_VEuuS4foos_VE"
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: "Reginas-FPK ✔ <eugene.leonar@gmail.com>", // sender address
    to: "box.valentina@gmail.com, eugene.leonar@gmail.com", // list of receivers
    subject: "Привет милый Женька! ✔", // Subject line
    text: "Как дела? ✔", // plaintext body
    html: "<h1>Это письмо пришло из Reginas-FPK</h1><b>Я жирный ✔</b><hr><i>А я наклонный</i><br><img src='http://fpk.reginas.ru:8888/images/logo-mini.png'>" // html body
}

// send mail with defined transport object
smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }

    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
});
*/




    
}

function jsSendMail(title, text){

var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "fpk.reginas@gmail.com",
        pass: "uuS4foos_VEuuS4foos_VE"
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: "Reginas-FPK ✔ <fpk.reginas@gmail.com>", // sender address
    to: "fpk.reginas@gmail.com", // list of receivers
    subject: title, // Subject line
    //text: text, // plaintext body
    html: text // html body
}

// send mail with defined transport object
smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }

    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
});



}


exports.loadJsonCup = function(request, response) {

  var brand = request.query.brand;
  var brand_id = request.query.brand;

  var cache_id = md5(brand+"saltJsonCup");

  global.collection.find({ type: "cup", cache_id: cache_id }).toArray( function(err, the_cache){

	  if( the_cache.length ) {
	    response.send( the_cache[0]["mydata"] ); //статистика кешируется нижняя и левая
	    //console.info("info_from_cache graph json", cache_id);
	    //console.info("Stat from cache "+cache_id+", brand = ", brand_id,global.stat_cache);
	  } else {


    console.info(brand);

    var answer = {dg:[],
            vd:[],
           out:[]};

    var sql_insert = "AND brand = "+brand;

    if(brand == 0) sql_insert = "";

    if(brand < 0) sql_insert = "AND 1_brands.brand_group = "+(-brand);

    var query = "SELECT dg, vd, `out` FROM 1_clients LEFT JOIN 1_brands ON 1_clients.brand = 1_brands.id WHERE (dg!='0000-00-00 00:00:00' OR `out`!='0000-00-00 00:00:00' OR vd!='0000-00-00 00:00:00') "+sql_insert;
    pool.query(query, function (err, clients, fields) {

        clients = correct_dates(clients, 'no_zero_dates');

        var distinct_days = {dg:{}, vd: {}, out: {}};


        $.each(clients, function(i,client) {

          if(client.dg >= "2013-10-01") {
            var day = client.dg.split(" ")[0];
            if(!distinct_days.dg[day]) {
              distinct_days.dg[day] = {cnt:0};
            }
            if(!distinct_days.vd[day]) {
              distinct_days.vd[day] = {cnt:0};
            }
            if(!distinct_days.out[day]) {
              distinct_days.out[day] = {cnt:0};
            }
            distinct_days.dg[day].cnt += 1;
            
          }

          if(client.vd >= "2013-10-01") {
            var day = client.vd.split(" ")[0];
            if(!distinct_days.dg[day]) {
              distinct_days.dg[day] = {cnt:0};
            }
            if(!distinct_days.vd[day]) {
              distinct_days.vd[day] = {cnt:0};
            }
            if(!distinct_days.out[day]) {
              distinct_days.out[day] = {cnt:0};
            }
            distinct_days.vd[day].cnt += 1;
            
          }
          

          if( (client.out >= "2013-10-01") && (client.dg!="") ) {
            var day = client.out.split(" ")[0];
            if(!distinct_days.dg[day]) {
              distinct_days.dg[day] = {cnt:0};
            }
            if(!distinct_days.vd[day]) {
              distinct_days.vd[day] = {cnt:0};
            }
            if(!distinct_days.out[day]) {
              distinct_days.out[day] = {cnt:0};
            }
            distinct_days.out[day].cnt += 1;
            
          }

        });

        $.each(distinct_days.dg, function(key, day) {
          answer.dg.push( [frommysql(key+" 23:59:59").getTime()+10000, day.cnt] );
        });

        answer.dg = _.sortBy(answer.dg, function(el){ return el[0] });

        $.each(distinct_days.vd, function(key, day) {
          answer.vd.push( [frommysql(key+" 23:59:59").getTime()+10000, day.cnt] );
        });

        answer.vd = _.sortBy(answer.vd, function(el){ return el[0] });

        $.each(distinct_days.out, function(key, day) {
          answer.out.push( [frommysql(key+" 23:59:59").getTime()+10000, day.cnt] );
        });

        answer.out = _.sortBy(answer.out, function(el){ return el[0] });


      if(!global.stat_cache_cup) {
        global.stat_cache_cup = {};
      }
      response.send(answer);

	  global.collection.update({cache_id: cache_id}, {type: "cup", brand: brand_id, cache_id: cache_id, mydata: answer, time: jsNow()}, { upsert: true }, function(err, docs){
	 	  global.collection.count(function(err, count) {
	      });    	
	  });



    });
  }
 });

};

exports.loadTestDoc = function(request, response) {

	var brand = request.query.brand;
	var client_id = request.query.client_id;
	var do_id = request.query.do_id;
	var brand = request.query.brand;

	var dover = { 
		//number: "АСИ0007490",
		//date: "20.10.2014",
		//manager_fio: "Доменнов Алексей Дмитриевич",
		//manager_license: "74 AA №360349",
		//manager_phone: "890908888883",
		//organization: "ООО Ар Джи Моторс, ИНН 7448091317, 454008, г.Челябинск, Свердловский тракт дом 5, строение 2",
		//bank: "в Отделении №8597 ОАО Сбербанк России, БИК 047501602, кор.счёт 30101810700000000602",
		//rs: "40702810872020105634",
		//passport_seria: "7509",
		//passport_number: 667044,
		//passport_from: "Отделом УФМС России по Челябинской области в металлургическом районе",
		//passport_date: "04.03.2010",
		//model: "G25",
		//color: "серебристый",
		//vin: "SJNFBNJ10U2782797",
		//gos: "O 109 СР 174",
		//gd: "Рыбаков Василий Петрович",
		//gb: "Малофеева Наталья Георгиевна",
		//client_fio: "Лиенев Константин Вячеславович",
		//client_birthday: "12.05.1978",
		//client_adress: "454000, Челябинская область, г.Челябинск, ул. Сталеваров, дом 32, кв.84",
		//client_phone: "89227444440",
		//client_email: "eugene.leonar@gmail.com",
		//client_license: "74 АА №365677",
		//client_pass1: "2902 №555265",
		//client_pass2: "Отделом Внутренних дел Фрезиковского района Калужской области",
		//brand_name: "Skoda",
		//brand_title: "ООО Яромир Авто",
		//brand_importer: "Skoda - ООО 'Ниссан Мэнуфэкчуринг РУС'",
		//brand_adress: "194363, Санкт-Петербург, пос. Парголово, Комендантский пр. д.40"

	 }	
	 dover.number = "АСИ0"+do_id;
	 var today = tomysql( new Date() ).split(" ")[0].split("-");
	 dover.date = today[2]+"."+today[1]+"."+today[0];
	 dover.test_time = tomysql( new Date() ).split(" ")[1];

     pool.query("SELECT *, 1_users.fio manager_fio, 1_users.license manager_license, 1_users.phone manager_phone, 1_users.passport_seria passport_seria, 1_users.passport_number passport_number, 1_users.passport_from passport_from, 1_users.passport_date passport_date FROM 1_do LEFT JOIN 1_users ON 1_do.manager_id=1_users.id WHERE 1_do.id=? LIMIT 1", [do_id], function (err, mydo, fields) {
     	//console.info("!!!", mydo, err);
          pool.query("SELECT * FROM 1_clients WHERE id=? LIMIT 1", [client_id], function (err, clients, fields) {
          	 var the_do = mydo?mydo[0]:0;
		     pool.query("SELECT * FROM 1_test LEFT JOIN 1_models ON 1_models.id=1_test.model_id WHERE 1_test.id=? LIMIT 1", [the_do?the_do.test_model_id:0], function (err, test, fields) {
           if(!test[0]) test[0] = "";
			     pool.query("SELECT * FROM 1_organization WHERE 1_organization.id=? LIMIT 1", [test[0].organization], function (err, organization, fields) {
			     pool.query("SELECT * FROM 1_brands WHERE id=? LIMIT 1", [brand], function (err, brands, fields) {
			          	var client = clients[0];
			          	var the_test = test[0];
			          	var org = organization[0];
			          	var the_brand = brands[0];

			          	//console.info(client, mydo, the_test, organization);


			          	dover.client_fio = client.fio;
			          	dover.client_birthday = (client.birthday!='0000-00-00')?tomysql(new Date(client.birthday)).split(" ")[0]:"_____________";

			          	dover.client_pass1 = client.pas1 + " №" + client.pas2;
			          	dover.client_pass2 = client.pas5 + ", " + client.pas4;

			          	dover.manager_fio = the_do.manager_fio;
			          	dover.manager_license = the_do.manager_license;
			          	dover.manager_phone = the_do.manager_phone;
			          	dover.passport_seria = the_do.passport_seria;
			          	dover.passport_number = the_do.passport_number;
			          	dover.passport_from = the_do.passport_from;
			          	dover.passport_date = the_do.passport_date;



			          	dover.brand_name = the_brand.brandname;
			          	dover.brand_importer = the_brand.brandname;
			          	dover.brand_adress = the_brand.brand_adress?the_brand.brand_adress:"г.Москва";
			          	dover.brand_title = org.title;

			          	dover.city = org.city;


			          	dover.client_fio = client.fio;
			          	//dover.client_birthday = (client.birthday!="0000-00-00")?client.birthday:"";
			          	dover.client_adress = client.client_adress;
			          	dover.client_phone = client.phone1?client.phone1:client.phone2;
			          	dover.client_email = client.email?client.email:"____________";
			          	dover.client_license = client.license;
			          	dover.client_adress = client.client_adress;

			          	dover.vin = the_test.vin;
			          	dover.color = the_test.color;
			          	dover.gos = the_test.gos;
			          	dover.model = the_test.model;

			          	dover.gd = org.gd;
			          	dover.gb = org.gb;
			          	dover.organization = org.title+". ИНН "+org.inn+", КПП "+org.kpp+", "+org.adress;
			          	dover.bank = org.bank;
			          	dover.rs = org.rs;

			          	response.send({dover: dover});
			     });
				});
	         });
          });
     });



	 
}

exports.sendSocketMessage = function(request, response) {
	var text = request.query.text;

    process.send({ message_type:"chat", chat: text });
	response.send(true);

}

////////////////////////////////////////////////////////////////////////////////////////
                                       ////////
////////////////////////////////////////////////////////////////////////////////////////
////////                                                                         ///////
////////////////////////////////////////////////////////////////////////////////////////
////////                                                                         ///////
////////////////////////////////////////////////////////////////////////////////////////
////////                               ////////                                  ///////
////////////////////////////////////////////////////////////////////////////////////////
////////                                                                         ///////
////////////////////////////////////////////////////////////////////////////////////////
////////                                                                         ///////
////////////////////////////////////////////////////////////////////////////////////////
                                       ////////
////////////////////////////////////////////////////////////////////////////////////////



app.get('/migrate', database.loadAllFromMySQL)
app.get('/api/v1/parseManagers', database.parseManagers)

app.get('/api/v1/parseManagers2', database.parseManagers2)


app.get('/api/v1/parseEmail', database.parseEmail)


app.get('/api/v1/test_doc', database.loadTestDoc)

app.get('/api/v1/bigdata', database.loadAllBig)
app.get('/api/v1/bigdata2', database.loadAllBig2)

app.get('/api/v1/client_ids', database.findAllClientsIds );

app.get('/api/v1/json/cup', database.loadJsonCup );

app.get('/api/v1/client', database.findAllClients );
app.get('/api/v1/client/:id', database.findClient );
app.post('/api/v1/client', database.addNewClient );
app.delete('/api/v1/client/:id', database.removeClient );


app.get('/api/v1/do/:id', database.findDoById );
app.get('/api/v1/calendar', restApi.findCalendar );
app.delete('/api/v1/do/:id', database.removeDo );

app.get('/api/v1/stat_table', database.loadStatTable );
app.get('/api/v1/xls', database.loadXLS );

app.get('/api/v1/search', database.searchString );
app.get('/api/v1/autocomplete', database.getAutocomplete );

app.get('/api/v1/client/update/:id', database.updateClient );

app.get('/api/v1/clients_export', database.exportClients );

app.get('/api/v1/organizations', database.loadOrganizations );
app.put('/api/v1/organizations', database.saveOrganizations );
app.post('/api/v1/organizations', database.newOrganizations );
app.delete('/api/v1/organizations', database.deleteOrganizations );



app.get('/api/v1/sms', database.sendSMS );

app.get('/api/v1/socketmessage', database.sendSocketMessage );

app.get('/api/v1/stat', database.loadStat );
app.get('/api/v1/stat/all', database.loadStatAll );
app.get('/api/v1/stat/cup', database.loadStatCup );
app.get('/api/v1/stat/cup/cars', database.loadStatCupCars );

app.get('/api/v1/stat/admin_cup/managers', database.jsGetManagerCupAdmin );
app.get('/api/v1/stat/admin_cup/managers_report', database.jsGetManagerCupAdminReport );

app.get('/api/v1/reiting', database.jsGetReiting );

app.get('/api/v1/stat/cup/day', database.loadStatDay );
app.get('/api/v1/stat/cup/all_day', database.loadStatAllDay );

app.get('/api/v1/models', database.loadModels );
app.get('/api/v1/user/info', database.loadUserInfo );

app.get('/api/v1/user/info/full', database.loadFullUserInfo );
app.put('/api/v1/user/info/full', database.saveFullUserInfo );

app.post('/api/v1/models', database.newModel );
app.put('/api/v1/models', database.saveModel );
app.delete('/api/v1/models', database.deleteModel );

app.post('/api/v1/test', database.newTest );
app.put('/api/v1/test', database.saveTest );
app.delete('/api/v1/test', database.deleteTest );


app.put('/api/v1/do/:id', database.saveDo );
app.put('/api/v1/client/:id', database.saveClient );
app.get('/api/v1/do', database.getDo );

app.put('/api/v1/admin/:id', database.saveAdmin );
app.post('/api/v1/admin', database.newAdmin );
app.delete('/api/v1/admin/:id', database.deleteAdmin );


app.get('/api/v1/do_by_type', database.findClientDoType );


app.post('/api/v1/do', database.newDo );

app.post('/api/v1/user/new', database.regNewUser );


app.get('/api/v1/message', database.findAllMessages );
app.get('/api/v1/message/:id', database.findMessageById );

app.post('/api/v1/message', database.newMessage );

app.post('/api/v1/save_file', database.saveFile )

app.put('/api/v1/message/:id', database.findMessageById );

app.delete('/api/v1/message/:id', database.findMessageById );




app.configure(function() {
  app.use(express.compress());
    //var server_is = "dist";
    var server_is = "app";
    app.use( express.static(__dirname + '/../'+server_is+'/images', {maxAge: 86400000}) );
    app.use( express.static(__dirname + '/../'+server_is+'/images/do_type', {maxAge: 86400000}) );
    app.use( express.static(__dirname + '/../'+server_is) );
});


exports.findAllContinents = function(request,cb) {
  var query = request.query;
  var params = request.params;
  if(!query.t) query.t = 0;

  if(params.action=="save_message") {
          pool.query('SELECT * FROM `4_chat` WHERE user_id=? OR to_user_id=?', [params.user_id,params.user_id] , function (err, rows, fields) {
        // close connection first
        //closeConnection(connection);
        // done: call callback with results
        //    connection.end();
      //находим поле, где перечислены все друзья текущего пользователя

        cb(err, rows);

  });
  }

  if(params.action=="users") {
      pool.query('SELECT * FROM `4_users`', [params.lasttime] , function (err, rows, fields) {
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
      pool.query('SELECT * FROM `4_chat` WHERE user_id=? OR to_user_id=?', [params.user_id,params.user_id] , function (err, rows, fields) {
        // close connection first
        //closeConnection(connection);
        // done: call callback with results
        //    connection.end();
      //находим поле, где перечислены все друзья текущего пользователя

        cb(err, rows);
      });
  }



};

server.listen(8888);

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




function jsClone(element) {
  return $.map(element, function (obj) {
                      return $.extend({}, obj);
    });
}

function jsGetHourMinutes(time_now) {
  var answer = ((time_now.getHours()>9)?(time_now.getHours()):("0"+time_now.getHours()));
  answer += ":"+((time_now.getMinutes()>9)?(time_now.getMinutes()):("0"+time_now.getMinutes()));  
  return answer;
}

///////////////////////////////////////////


























}