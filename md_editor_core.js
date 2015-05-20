var modified = false;
var objApp = window.external;
var wizEditor;

$(function() {
    var objCommon = null;
    var objDatabase = null;
    var objDocument = null;
    var plainPasteMode = false;             // 纯文本粘贴模式
    var filesDirName = "index_files/";      // 本地文件目录名，不可更改
    var filesFullPath = getLocalFilesPath();
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
        disabledKeyMaps : [
            "F9", "F10", "F11"               // 禁用切换全屏状态，因为为知已经支持
        ],
        toolbarIcons : function() {
            var arrayIcons = ["saveIcon", "|"];
            arrayIcons = arrayIcons.concat(editormd.toolbarModes["full"]);
            arrayIcons.splice($.inArray("emoji", arrayIcons), 1);       // Emoji表情关闭时移除按钮
            arrayIcons.splice($.inArray("fullscreen", arrayIcons), 1);  // 禁用切换全屏状态时移除按钮
            arrayIcons.splice($.inArray("code", arrayIcons), 0, "captureIcon");  // 加入截取屏幕按钮
            arrayIcons.splice($.inArray("link", arrayIcons), 0, "plainPasteIcon");  // 加入纯文本粘贴模式按钮
            return arrayIcons;
        },
        toolbarIconsClass : {
            saveIcon : "fa-floppy-o",  // 指定一个FontAawsome的图标类
            captureIcon : "fa-scissors",
            plainPasteIcon : "fa-clipboard"
        },
        toolbarHandlers : {
            saveIcon : function() {
                saveDocument();
            },
            captureIcon : function() {
                captureScreenImage();
            },
            plainPasteIcon : function() {
                plainPasteMode = !plainPasteMode;
                showPlainPasteMode();
            }
        },
        lang : {
            toolbar : {
                saveIcon : "保存 (Ctrl+S)",
                captureIcon : "截取屏幕",
                plainPasteIcon : "纯文本粘贴模式",
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
            showPlainPasteMode();

            // 监听粘贴事件
            this.cm.getInputField().addEventListener("paste", function (e) {
                var clipboardData = event.clipboardData || window.clipboardData;
                if (clipboardData) {
                    if (clipboardData.types == "Files") {
                        clipboardToImage();
                    }
                    else if (clipboardData.types == "text/plain,text/html") {
                        if (!plainPasteMode && clipboardHTMLToMd(clipboardData.getData("text/html"))) {
                            e.preventDefault();
                        }
                    }
                }
            });
        },
        onchange : function() {
            modified = true;
        },
        onimageUploadButton : function() {
            var filename = getObjCommon().SelectWindowsFile(true, "Image Files(*.png;*.jpg;*.gif;*.bmp)|*.png;*.jpg;*.gif;*.bmp|");
            return getSavedLocalImage(filename);
        },
        onloadLocalFile : function(filename, fun) {
            fun(getObjCommon().LoadTextFromFile(filename));
        },
        onloadLocalJsonFile : function(filename, fun) {
            fun($.parseJSON(getObjCommon().LoadTextFromFile(filename)));
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
        }
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
    // 截取屏幕
    captureScreenImage = function () {
        var filename = getObjCommon().CaptureScreen(0);
        if (objCommon.PathFileExists(filename)) {
            wizEditor.insertValue("![](" + getSavedLocalImage(filename) + ")");
        };
    };

    ////////////////////////////////////////////////
    // 剪贴板图片
    clipboardToImage = function () {
        var filename = getObjCommon().ClipboardToImage(objApp.Window.HWND, "");
        if (objCommon.PathFileExists(filename)) {
            wizEditor.insertValue("![](" + getSavedLocalImage(filename) + ")");
        }
    };

    ////////////////////////////////////////////////
    // 剪贴板解析HTML转换到Markdown
    clipboardHTMLToMd = function (htmlText) {
        if (htmlText != "") {
            var referencelinkRegEx = /reference-link/;
            wizEditor.insertValue(toMarkdown(htmlText, {
                gfm: true,
                converters:[
                {
                    filter: 'div',
                    replacement: function(content) {
                        return content + '\n';
                    }
                },
                {
                    filter: 'span',
                    replacement: function(content) {
                        return content;
                    }
                },
                {
                    filter: function (node) {
                      return node.nodeName === 'A' && referencelinkRegEx.test(node.className);
                    },
                    replacement: function(content) {
                        return "";
                    }
                }]})
            );
            return true;
        }
        return false;
    };

    ////////////////////////////////////////////////
    // 显示纯文本粘贴模式
    showPlainPasteMode = function () {
        if (plainPasteMode) {
            $(".fa-clipboard").addClass("menu-selected");
        } else{
            $(".fa-clipboard").removeClass("menu-selected");
        };
    };

    ////////////////////////////////////////////////
    // 保存文档
    saveDocument = function () {
        if (objDocument) {
            var doc = wizEditor.getValue();
            var arrResult = dealImgDoc(doc);
            if (arrResult[0] != doc) {
                var cursor = wizEditor.getCursor();
                wizEditor.setMarkdown(arrResult[0]);
                wizEditor.setCursor(cursor);

                // 因为会触发change事件，所以这里强制设置改动标志
                setTimeout(function () {
                    modified = false;
                }, wizEditor.settings.delay);

                doc = arrResult[0];
            };

            doc = doc.replace(/</g, '&lt;');    // 左尖括号会被解析掉，替换成实体
            doc = doc.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');   // 替换制表符
            doc = doc.replace(/\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029)/g, "<br/>").replace(/ /g, '\u00a0');
            doc += arrResult[1];
            objDocument.UpdateDocument3(doc, 0);
            modified = false;
        }
    };

    ////////////////////////////////////////////////
    // 处理带图片内容
    function dealImgDoc (doc) {
        var arrImgTags = "";

        function dealImg (imgSrc) {
            var result = saveImageToLocal(imgSrc);
            arrImgTags += result[1];
            return result[0];
        }

        var imgReg = /(!\[[^\[]*?\]\()(.+?)(\s+['"][\s\S]*?['"])?(\))/g;
        doc = doc.replace(imgReg, function(whole, a, b, c, d) {
            if (c) {
                return a + dealImg(b) + c + d;
            } else{
                return a + dealImg(b) + d;
            }
        });

        var imgStrDiv = "";
        if (arrImgTags != "") {
            imgStrDiv = "<div name=\"markdownimage\" style=\"display:none;\">" + arrImgTags + "</div>";
        };
        return [doc, imgStrDiv];
    }

    ////////////////////////////////////////////////
    // 保存图片到本地临时目录
    // 返回新图片路径名和图片HTML标签内容
    function saveImageToLocal(filename) {
        filename = filename.replace(/\\/g, '/');
        var imgName = filename.substring(filename.lastIndexOf('/') + 1);
        var filenameNew = filename;
        var tagImg = "";

        var imgFullPath = "";
        if (filename.indexOf(filesDirName) == 0) {
            imgFullPath = filesFullPath + imgName;
        }
        else {
            imgFullPath = filename;
            if (imgFullPath.indexOf("file:///") == 0) {
                imgFullPath = imgFullPath.substring(8);
            }
        }

        if (imgFullPath != "") {
            if (getObjCommon().PathFileExists(imgFullPath)) {

                // 转换可能包含中文名的名称，转换成Unicode
                var imgNameNew = escape(imgName).replace(/%/g, '_');

                // 路径不同，则进行拷贝
                var imgCopyToFullPath = filesFullPath + imgNameNew;
                if (imgFullPath != imgCopyToFullPath) {
                    getObjCommon().CopyFile(imgFullPath, imgCopyToFullPath);
                }

                filenameNew = filesDirName + imgNameNew;
                tagImg = "<img src=\"" + imgCopyToFullPath + "\">";
            }
        }

        return [filenameNew, tagImg];
    }

    ////////////////////////////////////////////////
    // 获得保存到本地的图片
    function getSavedLocalImage(filename) {
        return saveImageToLocal(filename)[0];
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
            code = code.replace(new RegExp(imgErrorPath, "g"), filesDirName);
        }
        catch (err) {
        }

        return code;
    };

    ////////////////////////////////////////////////
    // 得到本地文件路径
    function getLocalFilesPath() {
        var htmlName = document.location.href;
        var htmlPath = htmlName.substring(0, htmlName.lastIndexOf('/') + 1);
        var htmlWinPath = htmlPath.substring(8);
        return decodeURI(htmlWinPath + filesDirName);
    }

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