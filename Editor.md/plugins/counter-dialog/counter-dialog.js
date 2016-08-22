
(function() {

    var factory = function (exports) {

        var $            = jQuery;
        var pluginName   = "counter-dialog";

        var langs = {
            "zh-cn" : {
                dialog : {
                    counterDlg : {
                        title    : "文章信息"
                    },
                }
            }
        };

        exports.fn.counterDialog = function() {
        	var _this       = this;
            var cm          = this.cm;
            var editor      = this.editor;
            var settings    = this.settings;
            var path        = settings.path + "../plugins/" + pluginName +"/";
            var classPrefix = this.classPrefix;
            var dialogName  = classPrefix + pluginName, dialog;

            $.extend(true, this.lang, langs[this.lang.name]);

            var lang        = this.lang;
            var dialogLang  = lang.dialog.counterDlg;

            var dialogContent = [
                "<div class=\"editormd-form\" id=\"counter-container\" style=\"padding: 0px 0;height: 63px;overflow: hidden;overflow-y: auto;\">",
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
                    width      : 260,
                    height     : 145,
                    mask       : false,
                    drag       : false,
                    closed     : false,
                    content    : dialogContent,
                    lockScreen : false,
                    footer     : false,
                    buttons    : false
                });

                var dialogPosition = function(){
                	var offset = $('.fa-th-large').offset();
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

            var wholeContent = cm.getValue();
            var numChars = wholeContent.length;

	        wholeContent = wholeContent.replace(/(^\s*)|(\s*$)/gi,"");
	        wholeContent = wholeContent.replace(/[ ]{2,}/gi," ");
	        wholeContent = wholeContent.replace(/\n /,"\n");
	        wholeContent = wholeContent.split(' ');

	        var numWords = wholeContent.length;
	        var numNoSpace = wholeContent.join('').length;

	        var timeCreated = "";
	        var timeModified = "";
	        var objDocument = $.proxy(settings.ongetObjDocument, this)();
	        var objCommon = $.proxy(settings.ongetObjCommon, this)();
	        if (objDocument != null && objCommon != null)
	        {
	        	var dtCreated = new Date(objDocument.DateCreated);
	        	timeCreated = objCommon.ToLocalDateString(dtCreated, false) + " " + objCommon.ToLocalTimeString(dtCreated);
	        	var dtModified = new Date(objDocument.DateModified);
	        	timeModified = objCommon.ToLocalDateString(dtModified, false) + " " + objCommon.ToLocalTimeString(dtModified);
	        }

	        var dialogContent2 = [
                "<label\">文章字数：" + numNoSpace,
                "</label><br/>",
                "<label\">创建时间：" + timeCreated,
                "</label><br/>",
                "<label\">修改时间：" + timeModified,
                "</label><br/>",
            ].join("\n");
	        var counterContainer = $("#counter-container");
	        counterContainer.html(dialogContent2);
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
