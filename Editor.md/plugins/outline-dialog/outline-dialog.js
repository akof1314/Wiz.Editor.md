
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
            }

            var markdownToC = [];
            var previewContainer = this.previewContainer;
            previewContainer.find(":header").each(function(){
				var hd = $(this);
				var txt = hd.find('a').attr("name");
				var escapedText = txt.toLowerCase().replace(/[^\w]+/g, "-");
                var line = hd.attr('data-source-line');

				var toc = {
	                text  : txt,
	                level : hd.get(0).tagName.substring(1),
	                slug  : escapedText,
                    lineIdx : line
	            };
	            markdownToC.push(toc);
			});

			var tocContainer = $("#outline-toc-container");
            editormd.markdownToCRenderer(markdownToC, tocContainer, false, 1);
            this.bindTocScrollEvent(tocContainer);
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
