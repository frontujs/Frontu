var getChildNodesFromHTMLString = function (str: string) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, 'text/html');
    return doc.body.childNodes;
};

var getNodeContent = function (node: { childNodes: string | any[]; textContent: any; }) {
    if (node.childNodes && node.childNodes.length > 0) return null;
    return node.textContent;
};

export { getChildNodesFromHTMLString, getNodeContent}