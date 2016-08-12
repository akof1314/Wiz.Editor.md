
(function() {

    var factory = function (exports) {

        var $            = jQuery;
        var pluginName   = "outline-dialog";

        var langs = {
            "zh-cn" : {
                dialog : {
                    options : {
                        title    : "选项",
                        readTitle    : "阅读",
                        editTitle    : "编辑",
                        markdownStyle : "渲染风格",
                        selectStyle   : ["Editor.md 风格", "为知风格"],
                        readTheme     : "主题风格",
                        editToolbarButton : "工具栏按钮",
                        toolbarButtonStyle   : ["default", "lite"],
                        editToolbarTheme : "工具栏主题",
                        editEditorTheme  : "编辑区主题",
                        editPreviewTheme : "预览区主题",
                        tipContent : "*重启为知笔记生效",
                        featuresOnOff : "功能",
                        emojiSupport : "Emoji表情",
                        selectFeatures : ["开", "关"],
                    },
                }
            }
        };

        exports.fn.outlineDialog = function() {
        	console.info(232323);
        	var objApp = window.external;
        	var pluginPath = objApp.GetPluginPathByScriptFileName("WizOutline.js");
		    var bookmarksListHtmlFileName = pluginPath + "Outline.htm";
		    //
		    var offset = $('.pull-right').offset();
		    console.info(offset);
		    var X = offset.top;
			var Y = offset.left;
		    objApp.Window.ShowSelectorWindow(bookmarksListHtmlFileName, X, Y, 300, 500, "");
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
