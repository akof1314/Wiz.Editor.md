
(function() {

    var factory = function (exports) {

        var $            = jQuery;
        var pluginName   = "options-dialog";

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
                        keymapModes : "键盘模式",
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
                "<div class=\"editormd-form\" style=\"padding: 13px 0;height: 352px;overflow: hidden;overflow-y: auto;\">",
                "<h4 style=\"margin: 0 0px 10px;\">" + dialogLang.readTitle + "</h4>",
                "<label style=\"width:94px;\">" + dialogLang.markdownStyle + "</label>",
                "<div class=\"fa-btns\" id=\"read-preview-area-markdown-style\"></div><br/>",
                "<label style=\"width:94px;\">" + dialogLang.readTheme + "</label>",
                "<select id=\"read-preview-area-theme-select\"style=\"width:245px;margin:3px 0 0 0;\"></select><br/>",
                "<h4 style=\"margin: 0 0px 10px;\">" + dialogLang.featuresOnOff + "</h4>",
                "<label style=\"width:94px;\">" + dialogLang.keymapModes + "</label>",
                "<select id=\"edit-toolbar-area-keymapmodes-select\"style=\"width:245px;margin:3px 0 0 0;\"></select><br/>",
                "<label style=\"width:94px;\">" + dialogLang.emojiSupport + "</label>",
                "<div class=\"fa-btns\" id=\"edit-emoji-support\"></div><br/>",
                "<h4 style=\"margin: 10px 0px 10px;\">" + dialogLang.editTitle + "</h4>",
                "<label style=\"width:94px;\">" + dialogLang.editToolbarButton + "</label>",
                "<select id=\"edit-toolbar-area-button-select\"style=\"width:245px;margin:3px 0 0 0;\"></select><br/>",
                "<label style=\"width:94px;\">" + dialogLang.editToolbarTheme + "</label>",
                "<select id=\"edit-toolbar-area-theme-select\"style=\"width:245px;margin:3px 0 0 0;\"></select><br/>",
                "<label style=\"width:94px;\">" + dialogLang.editEditorTheme + "</label>",
                "<select id=\"edit-editor-area-theme-select\"style=\"width:245px;margin:3px 0 0 0;\"></select><br/>",
                "<label style=\"width:94px;\">" + dialogLang.editPreviewTheme + "</label>",
                "<select id=\"edit-preview-area-theme-select\"style=\"width:245px;margin:3px 0 0 0;\"></select><br/>",
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
                    width      : 400,
                    height     : 473,
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
                            var optionsValue = {
                                MarkdownStyle : this.find("[name=\"markdown-style\"]:checked").val().toString(),
                                ReadTheme : this.find("#read-preview-area-theme-select").val(),
                                EditToolbarButton : this.find("#edit-toolbar-area-button-select").val(),
                                EditToolbarTheme : this.find("#edit-toolbar-area-theme-select").val(),
                                EditEditorTheme : this.find("#edit-editor-area-theme-select").val(),
                                EditPreviewTheme : this.find("#edit-preview-area-theme-select").val(),
                                EmojiSupport : this.find("[name=\"emojiSupport\"]:checked").val().toString(),
                                KeymapMode : this.find("#edit-toolbar-area-keymapmodes-select").val(),
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

            var faBtns = dialog.find("#read-preview-area-markdown-style");
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

            var faEmojiBtns = dialog.find("#edit-emoji-support");
            if (faEmojiBtns.html() === "")
            {
                var _lang  = dialogLang.selectFeatures;
                var values = ["1", "0"];

                for (var i = 0; i < 2; i++)
                {
                    var checked = (i === 0) ? " checked=\"checked\"" : "";
                    var btn = "<a href=\"javascript:;\"><label for=\"editormd-emoji-radio"+i+"\" >";
                    btn += "<input type=\"radio\" name=\"emojiSupport\" id=\"editormd-emoji-radio"+i+"\" value=\"" + values[i] + "\"" +checked + " />&nbsp;";
                    btn += _lang[i];
                    btn += "</label></a>";

                    faEmojiBtns.append(btn);
                }
            }

            var optionsNowValue = $.proxy(settings.ongetOptions, this)();
            var markdownStyle = optionsNowValue["MarkdownStyle"];
            var markdownStyleChecked = 1;
            if (markdownStyle == "Editor_md") {
                markdownStyleChecked = 0;
            }
            faBtns.find("[name=\"markdown-style\"]:checked").removeAttr("checked");
            faBtns.find("input#editormd-table-dialog-radio" + markdownStyleChecked).attr("checked", "checked").click();

            var emojiSupport = optionsNowValue["EmojiSupport"];
            var emojiSupportChecked = 0;
            if (emojiSupport == "0") {
                emojiSupportChecked = 1;
            }
            faEmojiBtns.find("[name=\"emojiSupport\"]:checked").removeAttr("checked");
            faEmojiBtns.find("input#editormd-emoji-radio" + emojiSupportChecked).attr("checked", "checked").click();

            function themeSelect(id, themes, curValue)
            {
                var select = dialog.find(id);

                if (select.html() === "")
                {
                    for (var i = 0, len = themes.length; i < len; i ++)
                    {
                        var theme    = themes[i];
                        var selected = (i == 0) ? " selected=\"selected\"" : "";

                        select.append("<option value=\"" + theme + "\"" + selected + ">" + theme + "</option>");
                    }
                }

                if (curValue != null)
                {
                    select.val(curValue);
                }
                return select;
            }

            themeSelect("#read-preview-area-theme-select", editormd.previewThemes, optionsNowValue["ReadTheme"]);
            themeSelect("#edit-toolbar-area-button-select", dialogLang.toolbarButtonStyle, optionsNowValue["EditToolbarButton"]);
            themeSelect("#edit-toolbar-area-theme-select", editormd.themes, optionsNowValue["EditToolbarTheme"]);
            themeSelect("#edit-editor-area-theme-select", editormd.editorThemes, optionsNowValue["EditEditorTheme"]);
            themeSelect("#edit-preview-area-theme-select", editormd.previewThemes, optionsNowValue["EditPreviewTheme"]);
            themeSelect("#edit-toolbar-area-keymapmodes-select", editormd.keymapModes, optionsNowValue["KeymapMode"]);
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
