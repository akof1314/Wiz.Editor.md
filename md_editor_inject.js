;(function() {
    function init() {
        var code = document.getElementsByTagName('body').item(0).innerText;
        $('body').wrapInner("<div style=\"display:none;\"></div>").append("<div id=\"test-editormd-view\"></div>");
        editormd.markdownToHTML("test-editormd-view", {
            markdown        : code,
            path            : "Editor.md/lib/",
            htmlDecode      : "style,script,iframe",  // you can filter tags decode
            autoLoadKaTeX   : false,
            emoji           : false,
            taskList        : false,
            tex             : true,
            flowChart       : true,
            sequenceDiagram : true,
        });
    }
    init();
})();
