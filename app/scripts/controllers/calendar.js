//#fpk/clients

myApp.controller('calendarCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {


$scope.fpk.leftmenu = { active:1,
                items : [
                  {id:0, title:"Календарь дел", group_by: "manager", href:"/fpk/calendar"}
                  ]
                };



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
        firstHour: 9,
        selectable: false,
        selectHelper: true,
        eventClick: function(calEvent, jsEvent, view) {

//        alert('Event: ' + calEvent.title);
        console.info("calEvent = ",calEvent);

        myApi.getClientFull($scope, calEvent.client_id).then(function(client){
          console.info("client = ", client);
          $scope.fpk.one_client = client;
          $scope.fpk.show_one_client = true;

          $scope.fpk.one_client[0]._visible = true;
          $.each($scope.fpk.one_client[0].do, function(i, mydo){
            if(mydo.id == calEvent.myid) mydo._visible = true;
          });
        });
//        alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
//        alert('View: ' + view.name);

        // change the border color just for fun
        $(this).css('border-color', 'red');

        },
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
            var manager = $scope.fpk.jsFindInArray($scope.fpk.managers,"id",el.manager_id)
            if(manager) manager = '['+$scope.fpk.jsFioShort(manager.fio)+']';
            var title = el.text + " ("+$scope.fpk.jsFioShort(el.fio, true) + " - " + el.short+" "+manager+ ")";
	            caldata.push(
	               {title: title, 
	                start:el.date2, 
	                allDay: alld,
	                end:el.date2,
                  myid: el.id,
                  client_id: el.client
	               } 
	               );                
	          } 
	       });
	     callback(caldata);
	     console.info(caldata);
     });

  }

});