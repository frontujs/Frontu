import { ElementType } from './element';
import * as utils from './utils'
import { collapseWhitespace } from './utils';

declare global {
    interface Window { nodeTextTemplate: any }
}

export interface SustitutionDictionary {
    [key: string]: string,
}
function template(pieces: any, ...substitutions: any[]) {
    var result = pieces[0];

    const newSubstitutions: SustitutionDictionary = {}

    for (var i = 0; i < substitutions.length; ++i) {
        if (utils.isHTML(substitutions[i])) {
            result += (substitutions[i] + pieces[i + 1]);
        } else {
            result += "${var_" + (i) + "}" + pieces[i + 1];
            newSubstitutions["var_" + i] = typeof substitutions[i] == 'number' ? substitutions[i].toString() : substitutions[i];
        }
    }

    const elements = getElementsFromHTML(result, newSubstitutions);
    return elements;

}
var getElementsFromHTML = function (html: string, substitutions: SustitutionDictionary) {
    const element: ElementType = {
        type: "",
        children: [],
        props: []
    }
    element.children = []

    /*  console.log("html", html)
     console.log("substitutions", substitutions) */

    const domElements = utils.getChildNodesFromHTMLString(html);
    for (let index = 0; index < domElements.length; index++) {
        const child = domElements[index];
        const newElement = parseHTMLElement(child, substitutions);
        if (newElement.type == "" && newElement.children == "") {
            continue;
        }
        element.children.push(newElement);

    }
    return element
};

var parseHTMLElement = function (node: ChildNode, substitutions: SustitutionDictionary): ElementType {
    let element: ElementType = {
        type: "",
        children: [],
        props: []
    }
    if (node.nodeType == Node.ELEMENT_NODE) {
        element.type = getHTMLElementType(node);

        element.children = []


        for (let index = 0; index < node.childNodes.length; index++) {
            const child = node.childNodes[index];
            const newElement = parseHTMLElement(child, substitutions);
            if (newElement.type == "" && newElement.children == "") {
                continue;
            }
            element.children.push(newElement);
        }
        /* if ( typeof element.type == "function" ) {
            element = element.type(element);
        } */
    }
    if (node.nodeType == Node.TEXT_NODE) {
        element.children = parseHTMLTextElement(node, substitutions);
    }
    return element
};

var getHTMLElementType = function (node: ChildNode): string | Function {
    const element = node as HTMLElement
    let elementType = element.localName
    if (window.frontuComponents[element.localName]) {
        elementType = window.frontuComponents[element.localName]
        /* console.log("Is a function", typeof elementType) */
    }
    return elementType
};
var parseHTMLTextElement = function (node: ChildNode, substitutions: SustitutionDictionary): ElementType[] | string {
    const element: ElementType[] = []
    let newContent = node.textContent ? node.textContent : "";
    newContent = collapseWhitespace(newContent, true, true)
    if (newContent.includes("${")) {

        return getTextElementFromTextTemplate(newContent, substitutions)
    } else {
        return newContent;
    }
    return element
};



window.nodeTextTemplate = function (pieces: any, ...substitutions: any[]): ElementType[] | string {
    const element: ElementType[] = []

    element.push({ type: "", children: pieces[0], props: [] })
    for (var i = 0; i < substitutions.length; ++i) {
        element.push({ type: "", children: substitutions[i], props: [] })
        element.push({ type: "", children: pieces[i + 1], props: [] })
    }
    return element

}

const getTextElementFromTextTemplate = function (templateString: string, substitutions: SustitutionDictionary) {
    const func = new Function(...Object.keys(substitutions), `return nodeTextTemplate\`${templateString}\`;`);
    return func(...Object.values(substitutions));
}
export { template }