;(function() {
    function init() {
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
    init();
})();
