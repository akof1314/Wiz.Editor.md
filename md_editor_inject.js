;(function() {
    function init() {
        var objApp = window.external;
        try {
            var objCommon = objApp.CreateWizObject("WizKMControls.WizCommonUI");
            var pluginFullPath = objApp.GetPluginPathByScriptFileName("md_editor_global.js").replace(/\\/g, '/');
            if (objCommon.PathFileExists(pluginFullPath + "emoji/emojis/a.png")) {
                editormd.emoji.path = pluginFullPath + "emoji/emojis/";
                editormd.twemoji.path = pluginFullPath + "emoji/twemoji/36x36/";
            }
        }
        catch (err) {
        }

        var code = document.getElementsByTagName('body').item(0).innerText;
        $('body').wrapInner("<div style=\"display:none;\"></div>").append("<div id=\"test-editormd-view\"></div>");
        editormd.markdownToHTML("test-editormd-view", {
            markdown        : code,
            htmlDecode      : "style,script,iframe",  // you can filter tags decode
            toc             : true,
            tocm            : false,
            tocStartLevel   : 1,
            tocTitle        : "目录",
            tocDropdown     : false,
            autoLoadKaTeX   : false,
            emoji           : true,
            taskList        : true,
            tex             : true,
            flowChart       : true,
            sequenceDiagram : true,
        });
    }
    init();
})();
