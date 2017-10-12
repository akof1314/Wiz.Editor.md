function WizEditormdMarkdown(doct, path, objEdComm) {
    var basePath = path;
    var doc = doct;
    var objEdCommon = objEdComm;
    if (doc == null) {
        doc = document;
    }

    function isMarkdown() {
        var title = doc.title;

        if (!title)
            return false;
        if (-1 != title.indexOf(".md "))
            return true;
        if (-1 != title.indexOf(".md@"))
            return true;
        if (title.match(/\.md$/i))
            return true;
        return false;
    }

    function insertElem(part, elem_type, callbackfunc) {
        var oPart = doc.getElementsByTagName(part).item(0);
        var oElem = doc.createElement(elem_type);
        callbackfunc(oElem);
        oPart.insertBefore(oElem, null);
        return oElem;
    }

    function appendScriptSrc(part, script_type, str, isServer) {
        return insertElem(part, "script", function(oScript) {
            oScript.type = script_type;
            if (isServer) {
                oScript.src = str;
            } else {
                oScript.src = ("" + basePath + str).replace(/\\/g, '/');
            }
        }
      );
    }

    function appendCssSrc(str) {
        insertElem('HEAD', "link", function(oCss) {
            oCss.rel = "stylesheet";
            oCss.href = ("" + basePath + str).replace(/\\/g, '/');
        }
      );
    }

    function appendScriptInnerHtml(part, class_Name, script_type, innerHtmlStr) {
        insertElem(part, "script", function(oScript) {
            oScript.className = class_Name;
            oScript.type = script_type;
            oScript.innerHTML = innerHtmlStr;
        }
      );
    }

    function appendScriptInnerHtml2(part, class_Name, script_type, innerHtmlStr, onLoadFunc) {
        var oPart = doc.getElementsByTagName(part).item(0);
        var oElem = doc.createElement('script');

        oElem.className = class_Name;
        oElem.type = script_type;
        oElem.innerHTML = innerHtmlStr;
        oPart.insertBefore(oElem, null);
        onLoadFunc();
        return oElem;
    }

    function appendScriptSrc2(part, script_type, str, isServer, onLoadFunc) {
        var oPart = doc.getElementsByTagName(part).item(0);
        var oElem = doc.createElement('script');

        oElem.type = script_type;
        if (!!onLoadFunc) {
            oElem.onload = function() { onLoadFunc(); };
        }

        if (isServer) {
            oElem.src = str;
        } else {
            oElem.src = ("" + basePath + str).replace(/\\/g, '/');
        }

        oPart.insertBefore(oElem, null);
        return oElem;
    }

    function initMarkdown() {
        doc.title = doc.title.replace(new RegExp(".md", "gi"), "");
        appendCssSrc("Editor.md/css/editormd.preview.css");
        appendScriptSrc('HEAD', "text/javascript", "Editor.md/lib/marked.min.js");
        appendScriptSrc('HEAD', "text/javascript", "Editor.md/lib/prettify.min.js");
        appendScriptSrc2('HEAD', "text/javascript", "Editor.md/examples/js/jquery.min.js", false, function() {
            appendScriptSrc2('HEAD', "text/javascript", "Editor.md/lib/raphael.min.js", false, function() {
                appendScriptSrc2('HEAD', "text/javascript", "Editor.md/lib/underscore.min.js", false, function() {
                    appendScriptSrc2('HEAD', "text/javascript", "Editor.md/lib/flowchart.min.js", false, function() {
                        appendScriptSrc('HEAD', "text/javascript", "Editor.md/lib/jquery.flowchart.min.js");
                        appendScriptSrc2('HEAD', "text/javascript", "Editor.md/editormd.js", false, function() {
                            init(objEdCommon);
                        });
                    });
                    appendScriptSrc('HEAD', "text/javascript", "Editor.md/lib/sequence-diagram.min.js");
                });
            });
        });
    }

    if (isMarkdown()) {
        initMarkdown();
    }
}

function init(objEdCommon) {
    var objApp = window.external;
    var libPath = "";
    var themeValue = "";
    var emojiSupport = true;
    var pluginFullPath = "";
    try {
        pluginFullPath = objApp.GetPluginPathByScriptFileName("md_editor_global.js")
    }
    catch (err) {
        pluginFullPath = objApp.SettingsPath + "Plugins/Wiz.Editor.md/";
    }
    try {
        var objCommon = objApp.CreateWizObject("WizKMControls.WizCommonUI");
        if (objCommon == null) {
            objCommon = objEdCommon;
        }
        pluginFullPath = pluginFullPath.replace(/\\/g, '/');
        editormd.emoji.path = pluginFullPath + "Editor.md/emoji/emojis/";
        editormd.twemoji.path = pluginFullPath + "Editor.md/emoji/twemoji/36x36/";
        libPath = pluginFullPath + "Editor.md/lib/";

        // 主题样式
        themeValue = objCommon.GetValueFromIni(pluginFullPath + "plugin.ini", "PluginConfig", "ReadTheme");
        if (themeValue != "") {
            themeValue = "class=\"editormd-preview-theme-" + themeValue + "\"";
        };
        var emojiSupportValue = objCommon.GetValueFromIni(pluginFullPath + "plugin.ini", "PluginConfig", "EmojiSupport");
        if (emojiSupportValue == "0") {
            emojiSupport = false;
        }
    }
    catch (err) {
    }

    var bodyNode = document.getElementsByTagName('body').item(0);
    var code = bodyNode.innerText;
    $('body').wrapInner("<div id=\"delete-now\" style=\"display:none;\"></div>")
             .append("<div style=\"height: 100%;\" " + themeValue + "><div id=\"test-editormd-view\"></div></div>");
    var node = document.getElementById('delete-now');
    if (node) {
        bodyNode.removeChild(node);
    }
    editormd.setMathJaxConfig(function() {
        editormd.loadMathJax(libPath, function() {
            editormd.markdownToHTML("test-editormd-view", {
                markdown        : code,
                htmlDecode      : "style,script,iframe",  // you can filter tags decode
                toc             : true,
                tocm            : false,
                tocStartLevel   : 1,
                tocTitle        : "目录",
                tocDropdown     : false,
                autoLoadKaTeX   : false,
                emoji           : emojiSupport,
                taskList        : true,
                tex             : true,
                flowChart       : true,
                sequenceDiagram : true,
            });
        });
    });
}

(function() {
    var objApp = window.external;
    try {
        if (objApp.EditorBrowserObject != null) {}
        if (objApp.Window.CurrentDocumentBrowserObject != null) {}
        if (objApp.Window.CurrentDocumentHtmlDocument != null) {
            WizEditormdMarkdown3();
        }
    }
    catch (err) {
        WizEditormdMarkdown3();
    }

    function WizEditormdMarkdown3() {
        var objApp = window.external;
        var libPath = "";
        var themeValue = "";
        var emojiSupport = true;
        var pluginFullPath = "";
        try {
            pluginFullPath = objApp.GetPluginPathByScriptFileName("md_editor_global.js")
        }
        catch (err) {
            pluginFullPath = objApp.SettingsPath + "Plugins/Wiz.Editor.md/";
        }
        try {
            var objCommon = objApp.CreateWizObject("WizKMControls.WizCommonUI");
            if (objCommon == null) {
                objCommon = objEdCommon;
            }
            pluginFullPath = pluginFullPath.replace(/\\/g, '/');
            editormd.emoji.path = pluginFullPath + "Editor.md/emoji/emojis/";
            editormd.twemoji.path = pluginFullPath + "Editor.md/emoji/twemoji/36x36/";
            libPath = pluginFullPath + "Editor.md/lib/";

            // 主题样式
            themeValue = objCommon.GetValueFromIni(pluginFullPath + "plugin.ini", "PluginConfig", "ReadTheme");
            if (themeValue != "") {
                themeValue = "class=\"editormd-preview-theme-" + themeValue + "\"";
            };
            var emojiSupportValue = objCommon.GetValueFromIni(pluginFullPath + "plugin.ini", "PluginConfig", "EmojiSupport");
            if (emojiSupportValue == "0") {
                emojiSupport = false;
            }
        }
        catch (err) {
        }

        var bodyNode = document.getElementsByTagName('body').item(0);
        var code = bodyNode.innerText;
        $('body').wrapInner("<div id=\"delete-now\" style=\"display:none;\"></div>")
                 .append("<div style=\"height: 100%;\" " + themeValue + "><div id=\"test-editormd-view\"></div></div>");
        var node = document.getElementById('delete-now');
        if (node) {
            bodyNode.removeChild(node);
        }
        editormd.setMathJaxConfig(function() {
            editormd.loadMathJax(libPath, function() {
                editormd.markdownToHTML("test-editormd-view", {
                    markdown        : code,
                    htmlDecode      : "style,script,iframe",  // you can filter tags decode
                    toc             : true,
                    tocm            : false,
                    tocStartLevel   : 1,
                    tocTitle        : "目录",
                    tocDropdown     : false,
                    autoLoadKaTeX   : false,
                    emoji           : emojiSupport,
                    taskList        : true,
                    tex             : true,
                    flowChart       : true,
                    sequenceDiagram : true,
                });
            });
        });
    }
})();
