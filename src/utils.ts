export interface EscapeDictionary {
    [key: string]: string,
}
const  reEscape = /[&<>'"]/g;
const reUnescape = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g
const oEscape: EscapeDictionary = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
}
const oUnescape: EscapeDictionary = {
    '&amp;': '&',
    '&#38;': '&',
    '&lt;': '<',
    '&#60;': '<',
    '&gt;': '>',
    '&#62;': '>',
    '&apos;': "'",
    '&#39;': "'",
    '&quot;': '"',
    '&#34;': '"'
}
const fnEscape = function (m: string) {
    return oEscape[m];
}

const fnUnescape = function (m: string) {
    return oUnescape[m];
}
function escape(s: string) {
    return String.prototype.replace.call(s, reEscape, fnEscape);
}
function unescape(s: string) {
    return String.prototype.replace.call(s, reUnescape, fnUnescape);
}
var getChildNodesFromHTMLString = function (str: string) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, 'text/html');
    return doc.body.childNodes;
};

var getNodeContent = function (node: { childNodes: string | any[]; textContent: any; }) {
    if (node.childNodes && node.childNodes.length > 0) return null;
    return node.textContent;
};
function isHTML(str:string) {
    const doc = new DOMParser().parseFromString(str, "text/html");
    for (let index = 0; index < doc.body.childNodes.length; index++) {
        const element = doc.body.childNodes[index];
        if (element.nodeType == 1) {
            return true
        }
    }
    return false

  }
export { getChildNodesFromHTMLString, getNodeContent, isHTML}