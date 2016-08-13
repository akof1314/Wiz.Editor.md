
(function() {

    var factory = function (exports) {

        var $            = jQuery;
        var pluginName   = "outline-dialog";

        var langs = {
            "zh-cn" : {
                dialog : {
                    outline : {
                        title    : "内容目录"
                    },
                }
            }
        };

        exports.fn.outlineDialog = function() {
        	var _this       = this;
            var cm          = this.cm;
            var editor      = this.editor;
            var settings    = this.settings;
            var path        = settings.path + "../plugins/" + pluginName +"/";
            var classPrefix = this.classPrefix;
            var dialogName  = classPrefix + pluginName, dialog;

            $.extend(true, this.lang, langs[this.lang.name]);

            var lang        = this.lang;
            var dialogLang  = lang.dialog.outline;

            var dialogContent = [
                "<div class=\"markdown-body editormd-preview-container\" id=\"outline-toc-container\" previewcontainer=\"false\" style=\"padding: 0px 0;height: 418px;overflow: hidden;overflow-y: auto;\">",
                "</div>"
            ].join("\n");

            if (editor.find("." + dialogName).length > 0)
            {
                dialog = editor.find("." + dialogName);

                dialog.show();
            }
            else
            {
                dialog = this.createDialog({
                    name       : dialogName,
                    title      : dialogLang.title,
                    width      : 330,
                    height     : 500,
                    mask       : false,
                    drag       : false,
                    closed     : false,
                    content    : dialogContent,
                    lockScreen : false,
                    footer     : false,
                    buttons    : false
                });

                var dialogPosition = function(){
                	var offset = $('.fa-list').offset();
		            var leftPos = offset.left  - dialog.width();
                	if (leftPos < 0)
                	{
                		leftPos = 0;
                	}
		            dialog.css({
		                top  : (offset.top + 26) + "px",
	            		left : (leftPos) + "px"
		            });
		        };

		        dialogPosition();

		        $(window).resize(dialogPosition);

                $(document).mouseup(function(e) {
	                if($(e.target).parents("." + dialogName).length == 0)
			        {
			            $("." + dialogName).hide();
			        }
	            });
	            
	            var preview = this.preview;
	            var codeMirror = this.codeMirror;
	            var mouseOrTouch = editormd.mouseOrTouch;
	            var dialogBody = $("#outline-toc-container");
	            
	            var previewBindScroll = function() {

	                dialogBody.bind(mouseOrTouch("click", "touchend"), function(event) {

	                    var height    = preview.height();
	                    var scrollTop = preview.scrollTop();
	                    //var percent   = (scrollTop / preview.get(0).scrollHeight);
	                    console.info(scrollTop);
	                    //console.info(percent);	                    
	                });
	            };
	
	            var previewUnbindScroll = function() {
	                dialogBody.unbind(mouseOrTouch("click", "touchend"));
	            };
	            
	            dialogBody.bind({
					mouseover  : previewBindScroll,
					mouseout   : previewUnbindScroll,
					touchstart : previewBindScroll,
					touchend   : previewUnbindScroll
				});
            }

            var markdownToC = [];
            var previewContainer = this.previewContainer;
            previewContainer.find(":header").each(function(){
				var hd = $(this);
				var txt = hd.text();
				var escapedText = txt.toLowerCase().replace(/[^\w]+/g, "-");

				var toc = {
	                text  : txt,
	                level : hd.get(0).tagName.substring(1),
	                slug  : escapedText
	            };
	            markdownToC.push(toc);
			});

			var tocContainer = $("#outline-toc-container");
            editormd.markdownToCRenderer(markdownToC, tocContainer, false, 1);
        };
    };

    // CommonJS/Node.js
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object")
    {
        module.exports = factory;
    }
    else if (typeof define === "function")  // AMD/CMD/Sea.js
    {
        if (define.amd) { // for Require.js

            define(["editormd"], function(editormd) {
                factory(editormd);
            });

        } else { // for Sea.js
            define(function(require) {
                var editormd = require("./../../editormd");
                factory(editormd);
            });
        }
    }
    else
    {
        factory(window.editormd);
    }

})();
