var objApp = WizExplorerApp;
var objWindow = objApp.Window;

if (objWindow.CurrentDocument != null)
{
    var pluginPath = objApp.GetPluginPathByScriptFileName("md_editor.js");
    var editorFileName = pluginPath + "index.html?guid=" + objWindow.CurrentDocument.GUID + "&kbguid=" + objWindow.CurrentDocument.Database.KbGUID;
    objWindow.ViewHtml(editorFileName, true);
}