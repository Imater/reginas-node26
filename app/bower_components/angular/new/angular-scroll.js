/* ng-infinite-scroll - v1.0.0 - 2013-02-23 */
var mod;

mod = angular.module('infinite-scroll', []);

mod.directive('infiniteScroll', [
  '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
    return {
      link: function(scope, elem, attrs) {
        var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
        $window = angular.element($window);
        scrollDistance = 0;
        if (attrs.infiniteScrollDistance != null) {
          scope.$watch(attrs.infiniteScrollDistance, function(value) {
            return scrollDistance = parseInt(value, 10);
          });
        }
        scrollEnabled = true;
        checkWhenEnabled = false;
        if (attrs.infiniteScrollDisabled != null) {
          scope.$watch(attrs.infiniteScrollDisabled, function(value) {
            scrollEnabled = !value;
            if (scrollEnabled && checkWhenEnabled) {
              checkWhenEnabled = false;
              return handler();
            }
          });
        }
        var tm;
        handler = function() {
          var elementBottom, remaining, shouldScroll, windowBottom;
          windowBottom = $window.height() + elem.scrollTop();
          elementBottom = elem.offset().top + elem.height();
          remaining = elementBottom - windowBottom;

          shouldScroll = remaining <= $window.height() * scrollDistance;

          var dif = (elem.find("div").height() - elem.scrollTop()) - elem.height();
          shouldScroll = dif < parseInt(attrs.infiniteScrollDistance);

          //console.info("dif = ", dif);

          if (shouldScroll && scrollEnabled) {
            clearTimeout(tm);
            if ($rootScope.$$phase) {
              tm = setTimeout(function(){
                return scope.$eval(attrs.infiniteScroll);
              },100);
              
            } else {
              tm = setTimeout(function(){
                return scope.$apply(attrs.infiniteScroll);
              },100);
            }
          } else if (shouldScroll) {
            return checkWhenEnabled = true;
          }
        };
        elem.on('scroll', handler);
        scope.$on('$destroy', function() {
          return elem.off('scroll', handler);
        });
        return $timeout((function() {
          if (attrs.infiniteScrollImmediateCheck) {
            if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
              return handler();
            }
          } else {
            return handler();
          }
        }), 0);
      }
    };
  }
]);