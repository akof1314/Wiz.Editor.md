# Wiz.Editor.md

![](https://github.com/akof1314/Wiz.Editor.md/raw/master/logo.png)

![](https://img.shields.io/github/stars/akof1314/Wiz.Editor.md.svg) ![](https://img.shields.io/github/forks/akof1314/Wiz.Editor.md.svg) ![](https://img.shields.io/github/tag/akof1314/Wiz.Editor.md.svg) ![](https://img.shields.io/github/release/akof1314/Wiz.Editor.md.svg) ![](https://img.shields.io/github/issues/akof1314/Wiz.Editor.md.svg)

**Wiz.Editor.md** 是一个基于 Editor.md 构建的为知笔记 Markdown 插件。

#### 主要特性

- 多种样式主题
- 支持实时预览
- 支持代码高亮
- 支持搜索替换
- 支持ToC目录
- *Tex*数学公式
- 流程图和时序图
- 丰富的快捷键

#### 下载和安装

- 通过 [Github下载安装](https://github.com/akof1314/Wiz.Editor.md/releases)；
- 或到[为知笔记应用中心](http://app.wiz.cn/ "为知笔记应用中心")进行下载插件包，双击即可安装；

#### 使用方法

新建`.md`笔记，选择`Editor.md`编辑器编辑。

#### 配置方法

如果需要开启或关闭一些功能，那么打开`index.html`文件，修改以下配置项：

```javascript
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
```

保存，重新启动为知笔记即可。


--------

**Editor.md** 是一个基于CodeMirror、jQuery 和 Marked 构建的开源 Markdown 在线编辑器（组件）。


#### 主要特性

- 支持通用Markdown / CommonMark 和Github风格的语法，也可[变身为代码编辑器](https://pandao.github.io/editor.md/examples/change-mode.html)；
- 支持实时预览、图片（跨域）上传、预格式文本/代码/表格插入、代码折叠、跳转到行、搜索替换、只读模式、自定义样式主题和多语言语法高亮等功能；
- 支持[ToC（Table of Contents）](https://pandao.github.io/editor.md/examples/toc.html)、[Emoji表情](https://pandao.github.io/editor.md/examples/emoji.html)、[Task lists](https://pandao.github.io/editor.md/examples/task-lists.html)、[@链接](https://pandao.github.io/editor.md/examples/@links.html)等Markdown扩展语法；
- 支持TeX科学公式（基于[KaTeX](https://pandao.github.io/editor.md/examples/katex.html)）、流程图 [Flowchart](https://pandao.github.io/editor.md/examples/flowchart.html) 和 [时序图 Sequence Diagram](https://pandao.github.io/editor.md/examples/sequence-diagram.html);
- 支持[识别和解析HTML标签，并且支持自定义过滤标签解析](https://pandao.github.io/editor.md/examples/html-tags-decode.html)，具有可靠的安全性和几乎无限的扩展性；
- 支持 AMD / CMD 模块化加载（支持 [Require.js](https://pandao.github.io/editor.md/examples/use-requirejs.html) & [Sea.js](https://pandao.github.io/editor.md/examples/use-seajs.html)），并且支持[自定义扩展插件](https://pandao.github.io/editor.md/examples/define-plugin.html)；
- 兼容主流的浏览器（IE8+）和[Zepto.js](https://pandao.github.io/editor.md/examples/use-zepto.html)，且支持iPad等平板设备；

#### License

The MIT License.
