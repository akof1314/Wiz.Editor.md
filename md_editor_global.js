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
                WizEditormdMarkdown(doc, WizMD_pluginPath);
            }
        }

        if (eventsHtmlDocumentComplete) {
            eventsHtmlDocumentComplete.add(onDocumentComplete);
        }
    }
    catch(e) {
        WizEditormdMarkdown(document, "");
    }
})();

eventsTabClose.add(WizMDEditorTabClose);