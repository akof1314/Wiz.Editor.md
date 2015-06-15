
(function() {

    var factory = function (exports) {

        var $            = jQuery;
        var pluginName   = "options-dialog";

        var langs = {
            "zh-cn" : {
                dialog : {
                    options : {
                        title    : "选项",
                        markdownStyle : "阅读时渲染风格",
                        selectStyle   : ["Editor.md 风格", "为知风格"],
                        tipContent : "*重启为知笔记生效"
                    },
                }
            }
        };

        exports.fn.optionsDialog = function() {
            var _this       = this;
            var cm          = this.cm;
            var editor      = this.editor;
            var settings    = this.settings;
            var path        = settings.path + "../plugins/" + pluginName +"/";
            var classPrefix = this.classPrefix;
            var dialogName  = classPrefix + pluginName, dialog;

            $.extend(true, this.lang, langs[this.lang.name]);

            var lang        = this.lang;
            var dialogLang  = lang.dialog.options;

            var dialogContent = [
                "<div class=\"editormd-form\" style=\"padding: 13px 0;\">",
                "<label style=\"width:110px;\">" + dialogLang.markdownStyle + "</label>",
                "<div class=\"fa-btns\"></div><br/>",
                "</div>"
            ].join("\n");

            if (editor.find("." + dialogName).length > 0)
            {
                dialog = editor.find("." + dialogName);

                this.dialogShowMask(dialog);
                this.dialogLockScreen();
                dialog.show();
            }
            else
            {
                dialog = this.createDialog({
                    name       : dialogName,
                    title      : dialogLang.title,
                    width      : 380,
                    height     : 191,
                    mask       : settings.dialogShowMask,
                    drag       : settings.dialogDraggable,
                    content    : dialogContent,
                    lockScreen : settings.dialogLockScreen,
                    maskStyle  : {
                        opacity         : settings.dialogMaskOpacity,
                        backgroundColor : settings.dialogMaskBgColor
                    },
                    buttons    : {
                        enter : [lang.buttons.enter, function() {
                            var mdStyle  = this.find("[name=\"markdown-style\"]:checked").val().toString();
                            var optionsValue = {
                                MarkdownStyle : mdStyle
                            };
                            $.proxy(settings.onsaveOptions, this)(optionsValue);

                            this.hide().lockScreen(false).hideMask();

                            return false;
                        }],

                        cancel : [lang.buttons.cancel, function() {
                            this.hide().lockScreen(false).hideMask();

                            return false;
                        }]
                    }
                });
            }

            var faBtns = dialog.find(".fa-btns");

            if (faBtns.html() === "")
            {
                var _lang  = dialogLang.selectStyle;
                var values = ["Editor_md", "WizDefault"];

                for (var i = 0; i < 2; i++)
                {
                    var checked = (i === 0) ? " checked=\"checked\"" : "";
                    var btn = "<a href=\"javascript:;\"><label for=\"editormd-table-dialog-radio"+i+"\" >";
                    btn += "<input type=\"radio\" name=\"markdown-style\" id=\"editormd-table-dialog-radio"+i+"\" value=\"" + values[i] + "\"" +checked + " />&nbsp;";
                    btn += _lang[i];
                    btn += "</label></a>";

                    faBtns.append(btn);
                }
            }

            var optionsNowValue = $.proxy(settings.ongetOptions, this)();
            var markdownStyle = optionsNowValue["MarkdownStyle"];
            var markdownStyleChecked = 0;
            if (markdownStyle == "WizDefault") {
                markdownStyleChecked = 1;
            }
            faBtns.find("[name=\"markdown-style\"]:checked").removeAttr("checked");
            faBtns.find("#editormd-table-dialog-radio" + markdownStyleChecked).attr("checked", "checked");
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
