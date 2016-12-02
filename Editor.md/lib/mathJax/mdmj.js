//MathJaxEditing.js file from stack exchange. Is responsible for the function mdmj
// which does the processing.
//It  accepts two parameters, text and delimiter
// text    - the text to be marked safely without harming math
// delimit - a number from 0-3
// 	0 - The default \(,\[,$$ delimiters
// 	1 - All \(,\[,$,$$ delimiters
// 	2 - Only \(,\[ delimiters
// 	3 - Only $,$$ delimiters
function mdmj(text,dlimit) {
  var ready   = false;  // true after initial typeset is complete
  var pending = false;  // true when MathJax has been requested
  var preview = null;   // the preview container
  var delimit = 0;     // the split array index number (look line 17-25)

  var blocks, start, end, last, braces; // used in searching for math
  var math;                             // stores math until markdone is done
  
  var HUB = MathJax.Hub;

  //
  //  The pattern for math delimiters and special symbols
  //    needed for searching for math in the page.
  //
	var SPLIT=[];
	SPLIT[0] = /(\\[()\[\]]|\$\$|\\(?:begin|end)\{[a-z]*\*?\}|\\[\\{}$]|[{}]|(?:\n\s*)+|@@\d+@@)/i;
	// The default \(,\[,$$ delimiters
	SPLIT[1] = /(\\[()\[\]]|\$\$?|\\(?:begin|end)\{[a-z]*\*?\}|\\[\\{}$]|[{}]|(?:\n\s*)+|@@\d+@@)/i;
	// All \(,\[,$,$$ delimiters
	SPLIT[2] = /(\\[()\[\]]|\\(?:begin|end)\{[a-z]*\*?\}|\\[\\{}$]|[{}]|(?:\n\s*)+|@@\d+@@)/i;
	// Only \(,\[ delimiters
	SPLIT[3] = /(\$\$?|\\(?:begin|end)\{[a-z]*\*?\}|\\[\\{}$]|[{}]|(?:\n\s*)+|@@\d+@@)/i;
	// Only $,$$ delimiters
	

	// Set the delimiters with Mathjax
	function setDelimiters(){
	var inlineMath=[],displayMath=[];
	if(delimit===1||delimit===3) {inlineMath.push(['$','$']);}
	if(delimit===0||delimit===1||delimit===2) {inlineMath.push(['\\(','\\)']);}
	if(delimit===0||delimit===1||delimit===3) {displayMath.push(['$$','$$']);}
	if(delimit===0||delimit===1||delimit===2) {displayMath.push(['\\[','\\]']);}
	MathJax.Hub.Config({tex2jax: { inlineMath: inlineMath , displayMath: displayMath }});
	}


  //
  //  The math is in blocks i through j, so 
  //    collect it into one block and clear the others.
  //  Replace &, <, and > by named entities.
  //  For IE, put <br> at the ends of comments since IE removes \n.
  //  Clear the current math positions and store the index of the
  //    math, then push the math string onto the storage array.
  //
  function processMath(i,j) {
    var block = blocks.slice(i,j+1).join("")
      .replace(/&/g,"&amp;")                   // use HTML entity for &
      .replace(/</g,"&lt;")                    // use HTML entity for <
      .replace(/>/g,"&gt;")                    // use HTML entity for >
    ;
    if (HUB.Browser.isMSIE) {block = block.replace(/(%[^\n]*)\n/g,"$1<br/>\n")}
    while (j > i) {blocks[j] = ""; j--}
	var lined = block.split('\n').length;
	var lineStr = "";
	if (lined > 1) {lineStr = (new Array(lined)).join('\n');}
    blocks[i] = "@@"+math.length+"@@"+lineStr; math.push(block);
    start = end = last = null;
  }
  
  
  //
  //  Break up the text into its component parts and search
  //    through them for math delimiters, braces, linebreaks, etc.
  //  Math delimiters must match and braces must balance.
  //  Don't allow math to pass through a double linebreak
  //    (which will be a paragraph).
  //
  function removeMath(text) {
    start = end = last = null;       // for tracking math delimiters
    math = [];                       // stores math strings for latter

    blocks = text.replace(/\r\n?/g,"\n").split(SPLIT[delimit]);
    for (var i = 1, m = blocks.length; i < m; i += 2) {
      var block = blocks[i];
      if (block.charAt(0) === "@") {
        //
        //  Things that look like our math markers will get
        //  stored and then retrieved along with the math.
        //
        blocks[i] = "@@"+math.length+"@@";
        math.push(block);
      } else if (start) {
        //
        //  If we are in math, look for the end delimiter,
        //    but don't go past double line breaks, and
        //    and balance braces within the math.
        //
        if (block === end) {
          if (braces) {last = i} else {processMath(start,i)}
        } else if (block.match(/\n.*\n/)) {
          if (last) {i = last; processMath(start,i)}
          start = end = last = null; braces = 0;
        } else if (block === "{") {braces++}
          else if (block === "}" && braces) {braces--}
      } else {
        //
        //  Look for math start delimiters and when
        //    found, set up the end delimiter.
        //
 	if (block === "\\(" || block === "\\[") {
          start = i; end = ({"\\(": "\\)", "\\[":"\\]"})[block]; braces = 0;
        }
	else if (block === "$" || block === "$$") {
          start = i; end = block; braces = 0;
        } 
	else if (block.substr(1,5) === "begin") {
          start = i; end = "\\end"+block.substr(6); braces = 0;
        }
      }
    }
    if (last) {processMath(start,last)}
    return blocks.join("");
  }
  
  //
  //  Put back the math strings that were saved,
  //   and clear the math array (no need to keep it around).
  //  
  function replaceMath(text) {
    text = text.replace(/@@(\d+)@@/g,function (match,n) {return math[n]});
    math = null;
    return text;
  }

	if(dlimit) delimit=parseInt(dlimit);
	setDelimiters();
	//text is the text which is to be marked up and mathjaxed and split array index number
    text=removeMath(text); 
	//remove and replace text with @@0@@ so that markdown does not do anything to math
    text=marked(text);		//set marked to run
    text=replaceMath(text);	//rereplace math
    return text; 
};
