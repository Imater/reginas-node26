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
            clearTimeout(scope.up_t);
            scope.up_t = setTimeout(function(){
              var el = $( $('#multi_editor').redactor('getBlock') );

              var par = el.parents(".me_part_editor");

              if(par.length) {
                par.trigger("input");
              } else {
                elm.find(".me_part_editor").trigger("input");
                elm.find(".me_title_header").trigger("input");
              }
            },100);
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
            var id = tinyInstance.attr("id");
            if(id) id = id.replace("uiRedactor","redactor_air_");
            setTimeout(function(){
              $("#"+id).remove();  
            },50);
            
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
        setTimeout(function () {
          //tinymce.init(options);
          $('#'+attrs.id).redactor(options);
          $("#multi_editor").attr("contenteditable","false");
          onResize();
        });


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