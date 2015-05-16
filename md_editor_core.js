var modified = false;
var objApp = window.external;
var wizEditor;

$(function() {
    var objCommon = null;
    var objDatabase = null;
    var objDocument = null;
    var code = loadDocument();

    ////////////////////////////////////////////////
    // 配置编辑器功能
    wizEditor = editormd("test-editormd", {
        theme           : "default",         // 主题样式，见editormd.themes定义
        value           : code,
        path            : getPluginPath() + "Editor.md/lib/",
        htmlDecode      : "style,script,iframe",  // 开启HTML标签解析，为了安全性，默认不开启
        codeFold        : true,              // 代码折叠，默认关闭
        tex             : true,              // 开启科学公式TeX语言支持，默认关闭
        flowChart       : true,              // 开启流程图支持，默认关闭
        sequenceDiagram : true,              // 开启时序/序列图支持，默认关闭
        toc             : true,              // [TOC]自动生成目录，默认开启
        tocm            : false,             // [TOCM]自动生成下拉菜单的目录，默认关闭
        tocTitle        : "",                // 下拉菜单的目录的标题
        tocDropdown     : false,             // [TOC]自动生成下拉菜单的目录，默认关闭
        emoji           : false,             // Emoji表情，默认关闭
        taskList        : false,             // Task lists，默认关闭
        saveHTMLToTextarea : true,
        disabledKeyMaps : [
            "F9", "F10", "F11"               // 禁用切换全屏状态，因为为知已经支持
        ],
        toolbarIcons : function() {
            var arrayIcons = ["saveIcon", "|"];
            arrayIcons = arrayIcons.concat(editormd.toolbarModes["full"]);
            arrayIcons.splice($.inArray("emoji", arrayIcons), 1);       // Emoji表情关闭时移除按钮
            arrayIcons.splice($.inArray("fullscreen", arrayIcons), 1);  // 禁用切换全屏状态时移除按钮
            return arrayIcons;
        },
        toolbarIconsClass : {
            saveIcon : "fa-floppy-o"  // 指定一个FontAawsome的图标类
        },
        toolbarHandlers : {
            saveIcon : function() {
                saveDocument();
            }
        },
        lang : {
            toolbar : {
                saveIcon : "保存 (Ctrl+S)"
            }
        },
        onload : function() {
            var keyMap = {
                "Ctrl-F9": function(cm) {
                    $.proxy(wizEditor.toolbarHandlers["watch"], wizEditor)();
                },
                "Ctrl-F10": function(cm) {
                    $.proxy(wizEditor.toolbarHandlers["preview"], wizEditor)();
                },
                "F1": function(cm) {
                    wizEditor.cm.execCommand("defaultTab");
                }
            };
            this.addKeyMap(keyMap);
        },
        onchange : function() {
            modified = true;
        },
        onimageUploadButton : function() {
            var filename = getObjCommon().SelectWindowsFile(true, "Image Files(*.png;*.jpg;*.gif;*.bmp)|*.png;*.jpg;*.gif;*.bmp|");
            return filename;
        }
    });

    ////////////////////////////////////////////////
    // 获得为知常用操作对象
    function getObjCommon() {
        if (objCommon == null) {
            try {
                objCommon = objApp.CreateWizObject("WizKMControls.WizCommonUI");
            }
            catch (err) {
            }
        };
        return objCommon;
    };

    ////////////////////////////////////////////////
    // 获得插件路径
    function getPluginPath () {
        var pluginPath = "";
        try {
            pluginPath = objApp.GetPluginPathByScriptFileName("md_editor.js");
        }
        catch (err) {
        }
        return pluginPath;
    };

    ////////////////////////////////////////////////
    // 保存文档
    saveDocument = function () {
        if (objDocument) {
            var doc = wizEditor.getValue();
            doc = doc.replace(/</g, '&lt;');    // 左尖括号会被解析掉，替换成实体
            doc = doc.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');   // 替换制表符
            doc = doc.replace(/\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029)/g, "<br/>").replace(/ /g, '\u00a0');
            doc = dealImgDoc(doc);
            objDocument.UpdateDocument3(doc, 0);
            modified = false;
        }
    };

    ////////////////////////////////////////////////
    // 处理带图片内容
    function dealImgDoc (doc) {
        var htmlName = document.location.href;
        var htmlPath = htmlName.substring(0, htmlName.lastIndexOf('/') + 1);
        var htmlWinPath = htmlPath.substring(8);
        var filesDirName = "index_files/";
        var filesPath = htmlPath + filesDirName; // 带file:///的路径
        var filesWinPath = filesPath.substring(8);
        var arrImgTags = "";

        function dealImg (imgSrc) {
            var imgFullPath = "";
            if (imgSrc.indexOf(filesDirName) == 0) {
                imgFullPath = htmlWinPath + imgSrc;
            }
            else {
                imgFullPath = imgSrc;
                if (imgFullPath.indexOf("file:///") == 0) {
                    imgFullPath = imgFullPath.substring(8);
                }
            }
            imgFullPath = imgFullPath.replace(/\\/g, '/');

            if (imgFullPath != "") {
                if (getObjCommon().PathFileExists(imgFullPath)) {
                    var imgName = imgFullPath.substring(imgFullPath.lastIndexOf('/') + 1);

                    // 转换可能包含中文名的名称，转换成Unicode
                    var imgNameNew = escape(imgName).replace(/%/g, '_');

                    // 路径不同，则进行拷贝
                    var imgCopyToFullPath = filesWinPath + imgNameNew;
                    if (imgFullPath != imgCopyToFullPath) {
                        getObjCommon().CopyFile(imgFullPath, imgCopyToFullPath);
                    }
                    
                    imgSrc = filesDirName + imgNameNew;
                    arrImgTags += "<img src=\"" + imgCopyToFullPath + "\">";
                }
            }
            return imgSrc;
        }

        var imgReg = /(!\[.*?\]\()(.+?)(\))/g;
        doc = doc.replace(imgReg, function(whole, a, b, c) {
            return a + dealImg(b) + c;
        });

        var imgStrDiv = "<div name=\"markdownimage\" style=\"display:none;\">" + arrImgTags + "</div>";
        return doc + imgStrDiv;
    }

    ////////////////////////////////////////////////
    // 加载文档
    function loadDocument() {
        var guid = getQueryString("guid");
        var kbGUID = getQueryString("kbguid");

        if (kbGUID == "" || kbGUID == null) {
            objDatabase = objApp.Database;
        }
        else {
            objDatabase = objApp.GetGroupDatabase(kbGUID);
        }

        var code = "";
        try {
            objDocument = objDatabase.DocumentFromGUID(guid);
            document.title = "编辑 " + objDocument.Title.replace(new RegExp(".md", "gi"), "");

            code = objDocument.GetText(0);
            code = code.replace(/\u00a0/g, ' ');

            // 如果用原生编辑器保存过图片，会被替换成错的图片路径
            var imgErrorPath = guid + "_128_files/";
            var imgRealPath = "index_files/";
            code = code.replace(new RegExp(imgErrorPath, "g"), imgRealPath);
        }
        catch (err) {
        }

        return code;
    };

    ////////////////////////////////////////////////
    // 解析参数
    function getQueryString(name) {
        if (location.href.indexOf("?") == -1 || location.href.indexOf(name + '=') == -1) {
            return '';
        }
        var queryString = location.href.substring(location.href.indexOf("?") + 1);

        var parameters = queryString.split("&");

        var pos, paraName, paraValue;
        for (var i = 0; i < parameters.length; i++) {
            pos = parameters[i].indexOf('=');
            if (pos == -1) { continue; }

            paraName = parameters[i].substring(0, pos);
            paraValue = parameters[i].substring(pos + 1);

            if (paraName == name) {
                return unescape(paraValue.replace(/\+/g, " "));
            }
        }
        return '';
    };
});

////////////////////////////////////////////////
// 预防页面被跳转丢失编辑
window.onbeforeunload = function () {
    if (modified) {
        if (6 == objApp.Window.ShowMessage("是否保存？", "Wiz", 0x04 + 0x20)) {
            saveDocument();
        }
    }
};

////////////////////////////////////////////////
// 为知回调
// 关闭标签时会调用来判断是否需要保存
function OnPluginQueryModified() {
    return modified;
};

////////////////////////////////////////////////
// 为知回调
// 可响应Ctrl+S保存事件
function OnPluginSave() {
    saveDocument();
    return true;
};