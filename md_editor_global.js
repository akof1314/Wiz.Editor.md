;function WizEditormdMarkdown(document, path) {
    var basePath = path;
    var doc = document;

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

    function appendScriptInnerHtml(part, script_type, innerHtmlStr) {
        insertElem(part, "script", function(oScript) {
            oScript.type = script_type;
            oScript.innerHTML = innerHtmlStr;
        }
      );
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
        appendCssSrc("Editor.md/lib/katex/katex.min.css");
        appendScriptSrc('HEAD', "text/javascript", "Editor.md/lib/marked.min.js");
        appendScriptSrc('HEAD', "text/javascript", "Editor.md/lib/prettify.min.js");
        appendScriptSrc('HEAD', "text/javascript", "Editor.md/lib/katex/katex.min.js");

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

    function onDocumentComplete() {
        if (isMarkdown()) {
            initMarkdown();
        }
    }

    return {
        onDocumentComplete: onDocumentComplete
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
            var mardown = new WizEditormdMarkdown(doc, WizMD_pluginPath);
            mardown.onDocumentComplete();
        }

        if (eventsHtmlDocumentComplete) {
            eventsHtmlDocumentComplete.add(onDocumentComplete);
        }
    }
    catch(e) {
        var mardown = new WizEditormdMarkdown(document, "");
        mardown.onDocumentComplete();
    }
})();