

function MdEditorOnTabClose(objHtmlDocument, objWizDocument) {
    //
    if (objWizDocument)
        return;
    //
    if (!objHtmlDocument)
        return;
    //
    try {
        objHtmlDocument.defaultView.eval("if (onBeforeCloseTab_MdEditor) onBeforeCloseTab_MdEditor();");
    }
    catch (err) {
    }

};

eventsTabClose.add(MdEditorOnTabClose);
