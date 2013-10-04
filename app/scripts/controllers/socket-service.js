myApp.factory('socket', function($rootScope) {
	var socket = io.connect();

  var globalEvent = "*";
  socket.$emit = function (name) {
      if(!this.$events) return false;
      for(var i=0;i<2;++i){
          if(i==0 && name==globalEvent) continue;
          var args = Array.prototype.slice.call(arguments, 1-i);
          var handler = this.$events[i==0?name:globalEvent];
          if(!handler) handler = [];
          if ('function' == typeof handler) handler.apply(this, args);
          else if (io.util.isArray(handler)) {
              var listeners = handler.slice();
              for (var i=0, l=listeners.length; i<l; i++)
                  listeners[i].apply(this, args);
          } else return false;
      }
      return true;
  };
  socket.on(globalEvent,function(event){
      var args = Array.prototype.slice.call(arguments, 1);
      console.log("Global Event = "+event+"; Arguments = "+JSON.stringify(args));
  });

	return {
		on: function(eventName, callback) {
			socket.on('disconect', function(){
				console.info("server off");
			});
      socket.on('connect', function(){
        console.info("Server connected.");
      });
      socket.on('EMAIL', function(){
        alert("NEW MAIL");
        console.info("NEW EMAIL.");
      });
			socket.on(eventName, function() {
				var args = arguments;
				//console.info("on=",socket, eventName);
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if(callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});
