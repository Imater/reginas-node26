angular.module('ui.redactor.multi', [])
  .value('uiRedactorConfig', {})
  .directive('uiRedactorMulti', ['uiRedactorConfig', function (uiRedactorConfig) {
    uiRedactorConfig = uiRedactorConfig || {};
    var generatedIds = 0;
    return {
      require: '?ngModel',
      link: function (scope, elm, attrs, ngModel) {
        var expression, options, tinyInstance, tt,
          updateView = function () {
            var html = elm.html();
            //ngModel.$setViewValue( html );
            //scope.note.changetime = jsNow();
            if (!scope.$$phase) {
              clearTimeout(tt);
              tt = setTimeout(function() { scope.$apply(); }, 80);
            }
          };

        scope.jsWatch = function() {
          console.info("watch");
        }

        scope.$on('$destroy', function() {
        });

        // generate an ID if not present
        if (!attrs.id) {
          attrs.$set('id', 'uiRedactor' + generatedIds++);
        }

        if (attrs.uiRedactor) {
          expression = scope.$eval(attrs.uiRedactor);
        } else {
          expression = {};
        }
        options = {
          // Update model when calling setContent (such as from the source editor popup)
            lang: "ru",
            keyupCallback: function(html) {
              updateView();
            },
            pasteAfterCallback: function(html) {
              updateView();
              return html;
            },
            textareaKeydownCallback: function(html) {
              updateView();
            },
            imageUploadCallback: function(html) {
              updateView();
            },
            fileUploadCallback: function(html) {
              updateView();
            },
            imageUploadCallback: function(html) {
              updateView();
            },
            blurCallback: function(html) {
              updateView();
            },

          height: 800
        };
        // extend options with initial uiTinymceConfig and options from directive attribute value
        angular.extend(options, uiRedactorConfig, expression);



/*        ngModel.$render = function() {
          if (!tinyInstance) {
            tinyInstance = $("#"+attrs.id).redactor(options);
          }
          if (tinyInstance) {
            var html = ngModel.$viewValue;
            tinyInstance.redactor("set",html || '', false);
          }
        };
*/      }
    };
  }]);