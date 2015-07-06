;(function() {
    function init() {
        var objApp = window.external;
        var themeValue = "";
        try {
            var objCommon = objApp.CreateWizObject("WizKMControls.WizCommonUI");
            var pluginFullPath = objApp.GetPluginPathByScriptFileName("md_editor_global.js").replace(/\\/g, '/');
            editormd.emoji.path = pluginFullPath + "Editor.md/emoji/emojis/";
            editormd.twemoji.path = pluginFullPath + "Editor.md/emoji/twemoji/36x36/";

            // 主题样式
            themeValue = objCommon.GetValueFromIni(pluginFullPath + "plugin.ini", "PluginConfig", "ReadTheme");
            if (themeValue != "") {
                themeValue = "class=\"editormd-preview-theme-" + themeValue + "\"";
            };
        }
        catch (err) {
        }

        var code = document.getElementsByTagName('body').item(0).innerText;
        $('body').wrapInner("<div style=\"display:none;\"></div>").append("<div style=\"height: 100%;\" " + themeValue + "><div id=\"test-editormd-view\"></div></div>");
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
