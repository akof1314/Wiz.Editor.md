var editorScriptFile = {
    normal  :"baidu_editor.js",
    markdown:"md_editor.js"
}

function autoRunScriptFile () {
    var objApp = WizExplorerApp;
    var objWindow = objApp.Window;
    var objDocument = objWindow.CurrentDocument;

    if (objDocument == null) {
        return;
    };

    if (isMarkdown()) {
        runScriptFile(editorScriptFile.markdown);
    } else{
        runScriptFile(editorScriptFile.normal);
    };

    function isMarkdown() {
        var title = objDocument.Title;
        
        if (!title)
            return false;
        if (-1 != title.indexOf(".md "))
            return true;
        if (-1 != title.indexOf(".md@"))
            return true;
        if (title.match(/\.md$/i))
            return true;
        return false;
    };

    function runScriptFile (file) {
        if (file == "") {

        } else{
            objApp.RunScriptFile(file, "js");
        };
    }
};

autoRunScriptFile();