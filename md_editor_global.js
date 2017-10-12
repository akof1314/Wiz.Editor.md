function WizEditormdMarkdown2(doct, path) {
    var basePath = path;
    var doc = doct;
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
                            appendScriptSrc('HEAD', "text/javascript", "md_editor_inject.js");
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

function WizMDEditorTabClose(objHtmlDocument, objWizDocument) {
    if (objWizDocument)
        return;
    if (!objHtmlDocument)
        return;

    try {
        if (objHtmlDocument.defaultView) {
            objHtmlDocument.defaultView.eval("if (onBeforeCloseTab_MDEditor) onBeforeCloseTab_MDEditor();");
        }
        else { // 4.5 objBrowser
            objHtmlDocument.ExecuteScript("if (onBeforeCloseTab_MDEditor) onBeforeCloseTab_MDEditor();", null);
        }
    }
    catch (err) {
    }
}

(function() {
    try {
        var WizMD_pluginPath = objApp.GetPluginPathByScriptFileName("md_editor_global.js");
        var WizMD_style = objCommon.GetValueFromIni(WizMD_pluginPath + "plugin.ini", "PluginConfig", "MarkdownStyle");
        if (WizMD_style != "Editor_md") {
            return;
        }

        function onDocumentComplete(doc) {
            var objBrowser = doc;
            if (doc == null || doc.title == null || doc.GUID != null) {
                doc = objWindow.CurrentDocumentHtmlDocument;
            }
            if (doc == null) {
                doc = objBrowser; // 4.5
                objBrowser.ExecuteScriptFile(WizMD_pluginPath + "md_editor_inject.js", function(ret) {
                    objBrowser.ExecuteFunction3("WizEditormdMarkdown", null, WizMD_pluginPath, objCommon, function(ret) {
                    });
                });
            }
            else {
                WizEditormdMarkdown2(doc, WizMD_pluginPath);
            }
        }

        if (eventsHtmlDocumentComplete) {
            eventsHtmlDocumentComplete.add(onDocumentComplete);
        }
    }
    catch(e) {
        WizEditormdMarkdown2(document, "");
    }
})();

eventsTabClose.add(WizMDEditorTabClose);