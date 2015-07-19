var modified = false;
var objApp = window.external;
var wizEditor;

$(function() {
    var objDatabase = null;
    var objDocument = null;
    var objCommon = getObjCommon();
    var plainPasteMode = false;             // 纯文本粘贴模式
    var filesDirName = "index_files/";      // 本地文件目录名，不可更改
    var filesFullPath = getLocalFilesPath();
    var pluginFullPath = getPluginPath();
    var optionSettings = getOptionSettings();
    var code = loadDocument();

    setEmojiFilePath();
    ////////////////////////////////////////////////
    // 配置编辑器功能
    wizEditor = editormd("test-editormd", {
        theme           : optionSettings.EditToolbarTheme,        // 工具栏区域主题样式，见editormd.themes定义，夜间模式dark
        editorTheme     : optionSettings.EditEditorTheme,         // 编辑器区域主题样式，见editormd.editorThemes定义，夜间模式pastel-on-dark
        previewTheme    : optionSettings.EditPreviewTheme,        // 预览区区域主题样式，见editormd.previewThemes定义，夜间模式dark
        value           : code,
        path            : pluginFullPath + "Editor.md/lib/",
        htmlDecode      : "style,script,iframe",  // 开启HTML标签解析，为了安全性，默认不开启
        codeFold        : true,              // 代码折叠，默认关闭
        tex             : true,              // 开启科学公式TeX语言支持，默认关闭
        flowChart       : true,              // 开启流程图支持，默认关闭
        sequenceDiagram : true,              // 开启时序/序列图支持，默认关闭
        toc             : true,              // [TOC]自动生成目录，默认开启
        tocm            : false,             // [TOCM]自动生成下拉菜单的目录，默认关闭
        tocTitle        : "",                // 下拉菜单的目录的标题
        tocDropdown     : false,             // [TOC]自动生成下拉菜单的目录，默认关闭
        emoji           : true,              // Emoji表情，默认关闭
        taskList        : true,              // Task lists，默认关闭
        disabledKeyMaps : [
            "F9", "F10", "F11"               // 禁用切换全屏状态，因为为知已经支持
        ],
        toolbarIcons : function() {
            return getEditToolbarButton(optionSettings.EditToolbarButton);
        },
        toolbarIconsClass : {
            saveIcon : "fa-floppy-o",  // 指定一个FontAawsome的图标类
            captureIcon : "fa-scissors",
            plainPasteIcon : "fa-clipboard",
            optionsIcon : "fa-gear"
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
            },
            optionsIcon : function() {
                this.executePlugin("optionsDialog", "options-dialog/options-dialog");
            }
        },
        lang : {
            toolbar : {
                saveIcon : "保存 (Ctrl+S)",
                captureIcon : "截取屏幕",
                plainPasteIcon : "纯文本粘贴模式",
                optionsIcon : "选项",
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

            // 监听文本变化事件
            this.cm.on("change", function(_cm, changeObj) {
                modified = true;
            });

            // 监听粘贴事件
            this.cm.getInputField().addEventListener("paste", function (e) {
                var clipboardData = event.clipboardData || window.clipboardData;
                if (clipboardData) {
                    if (clipboardData.types == "Files") {
                        clipboardToImage();
                    }
                    else if ($.inArray("text/html", clipboardData.types) != -1) {
                        if (!plainPasteMode && clipboardHTMLToMd(clipboardData.getData("text/html"))) {
                            e.preventDefault();
                        }
                    }
                }
            });
        },
        onimageUploadButton : function() {
            var filename = objCommon.SelectWindowsFile(true, "Image Files(*.png;*.jpg;*.gif;*.bmp)|*.png;*.jpg;*.gif;*.bmp|");
            return getSavedLocalImage(filename);
        },
        onloadLocalFile : function(filename, fun) {
            fun(objCommon.LoadTextFromFile(filename));
        },
        onloadLocalJsonFile : function(filename, fun) {
            fun($.parseJSON(objCommon.LoadTextFromFile(filename)));
        },
        onsaveOptions : function(optionsValue) {
            setOptionSettings(optionsValue);
        },
        ongetOptions : function() {
            return optionSettings;
        }
    });

    ////////////////////////////////////////////////
    // 获得配置值
    function getConfigValue(key, defaultValue) {
        var value = null;
        if (objCommon == null) {
            value = localStorage.getItem(key);
        }
        else {
            value = objCommon.GetValueFromIni(pluginFullPath + "plugin.ini", "PluginConfig", key);
        }
        if (value == null || value == "") {
            value = defaultValue;
        }
        return value;
    };

    ////////////////////////////////////////////////
    // 设置配置值
    function setConfigValue(key, value) {
        if (objCommon == null) {
            localStorage.setItem(key, value);
        }
        else {
            objCommon.SetValueToIni(pluginFullPath + "plugin.ini", "PluginConfig", key, value);
        }
    };

    ////////////////////////////////////////////////
    // 获得选项配置值
    function getOptionSettings() {
        var optionsValue = {
            MarkdownStyle : getConfigValue("MarkdownStyle", "WizDefault"),
            ReadTheme : getConfigValue("ReadTheme", "default"),
            EditToolbarButton : getConfigValue("EditToolbarButton", "default"),
            EditToolbarTheme : getConfigValue("EditToolbarTheme", "default"),
            EditEditorTheme : getConfigValue("EditEditorTheme", "default"),
            EditPreviewTheme : getConfigValue("EditPreviewTheme", "default"),
        };
        return optionsValue;
    };

    ////////////////////////////////////////////////
    // 设置选项配置值
    function setOptionSettings(optionsValue) {
        if (optionSettings.EditToolbarButton != optionsValue.EditToolbarButton) {
            setConfigValue("EditToolbarButton", optionsValue.EditToolbarButton);
            wizEditor.config("toolbarIcons", getEditToolbarButton(optionsValue.EditToolbarButton));
        }
        if (optionSettings.EditToolbarTheme != optionsValue.EditToolbarTheme) {
            setConfigValue("EditToolbarTheme", optionsValue.EditToolbarTheme);
            wizEditor.setTheme(optionsValue.EditToolbarTheme);
        }
        if (optionSettings.EditEditorTheme != optionsValue.EditEditorTheme) {
            setConfigValue("EditEditorTheme", optionsValue.EditEditorTheme);
            wizEditor.setEditorTheme(optionsValue.EditEditorTheme);
        }
        if (optionSettings.EditPreviewTheme != optionsValue.EditPreviewTheme) {
            setConfigValue("EditPreviewTheme", optionsValue.EditPreviewTheme);
            wizEditor.setPreviewTheme(optionsValue.EditPreviewTheme);
        }

        var showMsg = false;
        if (optionSettings.MarkdownStyle != optionsValue.MarkdownStyle) {
            setConfigValue("MarkdownStyle", optionsValue.MarkdownStyle);
            showMsg = true;
        }
        if (optionSettings.ReadTheme != optionsValue.ReadTheme) {
            setConfigValue("ReadTheme", optionsValue.ReadTheme);
        }
        optionSettings = optionsValue;
        if (objCommon != null && showMsg) {
            objApp.Window.ShowMessage("设置新选项后，您应该重新运行{p}。", "{p}", 0x00000040);
        }
    };

    ////////////////////////////////////////////////
    // 获得工具栏按钮
    function getEditToolbarButton(style) {
        if (style == "lite") {
            return [
                "saveIcon", "|",
                "bold", "italic", "|",
                "link", "quote", "code", "image", "|",
                "list-ol", "list-ul", "h1", "hr", "|",
                "undo", "redo", "||",
                "optionsIcon", "help", "info"
            ];
        } else{
            return [
                "saveIcon", "|",
                "undo", "redo", "|",
                "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|",
                "h1", "h2", "h3", "h4", "h5", "h6", "|",
                "list-ul", "list-ol", "hr", "|",
                "plainPasteIcon", "link", "reference-link", "image", "captureIcon", "code", "preformatted-text", "code-block", "table", "datetime", "emoji", "html-entities", "pagebreak", "|",
                "goto-line", "watch", "preview", "clear", "search", "|",
                "optionsIcon", "help", "info"
            ];
        };
    };

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
        var filename = objCommon.CaptureScreen(0);
        if (objCommon.PathFileExists(filename)) {
            wizEditor.insertValue("![](" + getSavedLocalImage(filename) + ")");
        };
    };

    ////////////////////////////////////////////////
    // 剪贴板图片
    clipboardToImage = function () {
        var filename = objCommon.ClipboardToImage(objApp.Window.HWND, "");
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
                      return (node.nodeName === 'A' && referencelinkRegEx.test(node.className));
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
                doc = arrResult[0];
            };

            doc = $('<div/>').text(doc).html();
            doc = doc.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');   // 替换制表符
            doc = doc.replace(/\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029)/g, "<br/>").replace(/ /g, '\u00a0');
            doc += arrResult[1];
            doc = "<!DOCTYPE html><html><head></head><body>" + doc + "</body></html>";
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
            if (objCommon.PathFileExists(imgFullPath)) {

                // 转换可能包含中文名的名称，转换成Unicode
                var imgNameNew = escape(imgName).replace(/%/g, '_');

                // 路径不同，则进行拷贝
                var imgCopyToFullPath = filesFullPath + imgNameNew;
                if (imgFullPath != imgCopyToFullPath) {

                    // 目标文件已经存在
                    if (objCommon.PathFileExists(imgCopyToFullPath)) {
                        var date = new Date();
                        imgNameNew = date.getTime() + imgNameNew;
                        imgCopyToFullPath = filesFullPath + imgNameNew;
                    }

                    objCommon.CopyFile(imgFullPath, imgCopyToFullPath);
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
    // 设置表情文件的地址
    function setEmojiFilePath () {
        editormd.emoji.path = pluginFullPath + "Editor.md/emoji/emojis/";
        editormd.twemoji.path = pluginFullPath + "Editor.md/emoji/twemoji/36x36/";
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
        if (6 == objApp.Window.ShowMessage("是否保存？", "{p}", 0x04 + 0x20)) {
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