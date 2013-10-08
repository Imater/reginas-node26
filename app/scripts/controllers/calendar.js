//#fpk/clients

myApp.controller('calendarCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment) {


  $scope.fpk.leftmenu = { active:0,
                items : [
                  {id:10, title:"Календарь дел", group_by: "manager", href:"/fpk/calendar"},
                  {id:11, title:"Журнал выдач", group_by: "manager", href:"/fpk/calendar/vd"},
                  {id:12, title:"Журнал тестов", group_by: "manager", href:"/fpk/calendar/tst"}
                  ]
                };

  if(window.location.hash.indexOf("/vd")!=-1) {
    var calendar_do_type = "vd";
    $scope.fpk.leftmenu.active = 1;
  }
  if(window.location.hash.indexOf("/tst")!=-1) {
    var calendar_do_type = "tst";
    $scope.fpk.leftmenu.active = 2;
  }

  $scope.$watch("fpk.leftmenu.active", function(Val, newVal){
    if(Val != newVal) {
        $("#myfullcalendar").fullCalendar("refetchEvents");
    }
  });

  $scope.$routeSegment = $routeSegment;

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
        $(".event_selected").removeClass("event_selected");
        $(this).addClass("event_selected");


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
           }
           //, className: 'my_event'
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
     var calendar_do_type = "all";

     if(window.location.hash.indexOf("/vd")!=-1) {
      var calendar_do_type = "vd";
     }
     if(window.location.hash.indexOf("/tst")!=-1) {
      var calendar_do_type = "tst";
     }

     myApi.getDoCalendar($scope, start, end, calendar_do_type).then(function(events){
	     
	     $.each(events, function(i,el) {
	        if( ((el.date2!="0000-00-00 00:00:00") || (el.date2!="0000-00-00 00:00:00") ) &&
	            ( ( (el.date2>=start) && (el.date2<=end) ) || ((el.date2>=start) && (el.date2<=end)) )) {

	        	var alld = /00:00:00/.test(el.date2);
            var manager = $scope.fpk.jsFindInArray($scope.fpk.managers,"id",el.manager_id)
            if(manager) manager = '['+$scope.fpk.jsFioShort(manager.fio)+']';
            var title = el.text + " ("+$scope.fpk.jsFioShort(el.fio, true) + " - " + el.short+" "+manager+ ")";
            var do_class="event_did";
            if( (el.checked=="0000-00-00 00:00:00") ) do_class = "event_not_did";
            if( (el.icon2>4) ) { 
              do_class = "event_not_did_confirm";
              title = "(Подтв.) "+title;
            }
            if( el.date2 < toMysql( (new Date ) ) ) do_class += " event_past";

	            caldata.push(
	               {title: title, 
	                start:el.date2, 
	                allDay: alld,
	                end:el.date2,
                  myid: el.id,
                  className: do_class,
                  client_id: el.client
	               } 
	               );                
	          } 
	       });
       setTimeout(function(){ onResize(); },500);
	     callback(caldata);
	     //console.info(caldata);
     });

  }

});