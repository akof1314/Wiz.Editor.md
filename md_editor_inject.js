;(function() {
    function init() {
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
            emoji           : false,
            taskList        : false,
            tex             : true,
            flowChart       : true,
            sequenceDiagram : true,
        });
    }
    init();
})();
