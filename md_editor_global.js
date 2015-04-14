

function VimEditorOnTabClose(objHtmlDocument, objWizDocument) {
    //
    if (objWizDocument)
        return;
    //
    if (!objHtmlDocument)
        return;
    //
    try {
        objHtmlDocument.defaultView.eval("if (onBeforeCloseTab_VimEditor) onBeforeCloseTab_VimEditor();");
    }
    catch (err) {
    }

};

eventsTabClose.add(VimEditorOnTabClose);
