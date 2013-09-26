//#fpk/clients

myApp.controller('calendarCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {

	setTimeout(function(){
		onResize();
	},0);

	  $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        slotMinutes: 15,
        defaultEventMinutes: 60,
        timeFormat: 'H:mm',
        axisFormat: 'H:mm',
        weekends:true,
        selectable: false,
        selectHelper: true,
        viewDisplay: function(view) {
        	setTimeout(function(){
        		onResize();
        	},5);
        },
        defaultView:'agendaWeek', //agendaWeek
        header:{
          left: 'month agendaWeek agendaDay basicWeek basicDay',
          center: 'title',
          right: 'today prev,next'
        },
        eventSources: [{ events: function(start, end, callback) {
            $scope.jsGetEvents(start, end, callback);
           },
           className: 'my_event'
        }],        
        dayClick: $scope.alertEventOnClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize
      }
    };  

  $scope.eventSources = [
  ];   


  $scope.jsGetEvents = function(start, end, callback) {

     var caldata = [];
     start = toMysql(start);
     end = toMysql(end);

     myApi.getDoCalendar($scope, start, end).then(function(events){
	     
	     $.each(events, function(i,el) {
	        if( ((el.date2!="0000-00-00 00:00:00") || (el.date2!="0000-00-00 00:00:00") ) && (el.checked=="0000-00-00 00:00:00") &&
	            ( ( (el.date2>=start) && (el.date2<=end) ) || ((el.date2>=start) && (el.date2<=end)) )) {

	        	var alld = /00:00:00/.test(el.date2);

	            caldata.push(
	               {title: el.text, 
	                start:el.date2, 
	                allDay: alld,
	                end:el.date2
	               } 
	               );                
	          } 
	       });
	     callback(caldata);
	     console.info(caldata);
     });

  }

});