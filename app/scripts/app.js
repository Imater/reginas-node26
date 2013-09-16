'use strict';

function Fuck() {
  alert(1);
}

angular.module('4treeApp', ["ngResource", "ngSanitize", "ngRoute", 'ui.redactor','ui.redactor.multi','ui.calendar'])
  .config(function ($routeProvider, $locationProvider,$compileProvider) {
    $locationProvider.html5Mode(false).hashPrefix('!');


    $routeProvider
      .when('/cards/:parent_id', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        reloadOnSearch: false
      })
      .when('/editor/:parent_id', {
        templateUrl: 'views/multieditor.html',
        controller: 'MainCtrl',
        reloadOnSearch: false
      })
      .otherwise({
        redirectTo: '/cards/1'
      });




  // configure new 'compile' directive by passing a directive
  // factory function. The factory function injects the '$compile'
  $compileProvider.directive('compile', function($compile) {
    // directive factory creates a link function
    return function(scope, element, attrs) {

      scope.$watch(
        function(scope) {
           // watch the 'compile' expression for changes
          return scope.$eval(attrs.compile);
        },
        function(value) {
          // when the 'compile' expression changes
          // assign it into the current DOM
          element.html(value);
 
          // compile the new DOM and link it to the current
          // scope.
          // NOTE: we only compile .childNodes so that
          // we don't get into infinite loop compiling ourselves
          $compile(element.contents())(scope);
        }
      );
    };
  })


});


function strip_tags( str ){ // Strip HTML and PHP tags from a string
  // 
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  if(!str) return "";
  var answer = str.replace(/<\/?[^>]+>/gi, '');

  answer = answer.replace(/\n/gi, '');

  return answer;
}
