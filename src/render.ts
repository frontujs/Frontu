import { Component, ComponentType, FrontuComponentEventBinding, FrontuComponentEventBindingElement } from "./component";
import * as utils from './utils'

declare global {
    interface Window { frontuElements: any; nodeTextTemplate: any }
}
export interface SustitutionDictionary {
    [key: string]: string,
}
interface IComponentType {
    new (props: any): Component;
}

interface ElementType {
    type: string
    children: ElementType[] | string
    events: FrontuComponentEventBindingElement[]
}
var render = function (component: Component, container: HTMLElement | null) {
    /* console.log("instance from define", window.frontuComponents["HelloWorld"]); */
    /* const component = new component({}); */
    component.container = container as HTMLElement;
    component.beforeWillMount();
    component.willMount();
    const renderTemplate = component.render()
    /* console.log("instance", component);
    console.log("instance.render()", renderTemplate); */
    const elements = getElementsFromHTML(renderTemplate.html, component.eventBindingStore, renderTemplate.substitutions);
    window.frontuElements = elements;
    /* console.log("childrens", elements);  */
    domRenderElement(elements, container, 0, component);
};
var domRenderElement = function (element: ElementType, container: HTMLElement | null, index: number, component: Component) {
   
    if (element.type == "" && typeof element.children == "string") {  // Is type text
        if (container?.childNodes[index]) { // Exist node on DOM
            if ( element.children != container.childNodes[index].nodeValue) { // Check if its diferent text
                container.childNodes[index].nodeValue = element.children
            }
            
        } else {
            const currentLenght = container?.childNodes?.length ? container.childNodes.length : 0;
            let newNode = null;
            if (currentLenght > index) {  // Insertbefore
                newNode = document.createTextNode(element.children);
                container?.insertBefore(newNode, container.childNodes[index  - 1])
            } else {
                newNode = document.createTextNode(element.children);
                container?.appendChild(newNode)
            }
            
        }
        return;
    }
    if (element.type != "") {  // Is type element
        if (container?.childNodes[index]) { // Exist node on DOM
            for (let i = 0; i < element.children.length; i++) {
                const newElement = element.children[i];
                domRenderElement(newElement as ElementType, container.childNodes[index] as HTMLElement, i, component);
            }
        } else {
            const currentLenght = container?.childNodes?.length ? container.childNodes.length : 0;
            let newNode = null;
            if (currentLenght > index) {  // Insertbefore
                newNode = document.createElement(element.type);
                container?.insertBefore(newNode, container.childNodes[index  - 1])
            } else {
                newNode = document.createElement(element.type);
                container?.appendChild(newNode)
            }
            
            for (let e = 0; e < element.events.length; e++) {
                const event = element.events[e];
                newNode.addEventListener(event.type, () => { event.callback(); render(component, component.container); });
            }
            for (let i = 0; i < element.children.length; i++) {
                const newElement = element.children[i];
                domRenderElement(newElement as ElementType, newNode, i, component);
            }
            
        }
    }
    if (element.type == "") {  // Is type text
        for (let i = 0; i < element.children.length; i++) {
            const newElement = element.children[i];
            domRenderElement(newElement as ElementType, container, i, component);
        }
       
    }
    
};
var getElementsFromHTML = function (html: string, events: FrontuComponentEventBinding, substitutions: string[]) {
    const element: ElementType = {
        type: "",
        children: [],
        events: []
    }
    element.children = []

    const domElements = utils.getChildNodesFromHTMLString(html);
    for (let index = 0; index < domElements.length; index++) {
        const child = domElements[index];
        const newElement = parseHTMLElement(child, events, substitutions);
        if (newElement.type == "" && newElement.children == "") {
            continue;
        }
        element.children.push(newElement);
        
    }
    return element
};
var parseHTMLElement = function (node: ChildNode, events: FrontuComponentEventBinding, substitutions: string[]): ElementType {
    const element: ElementType = {
        type: "",
        children: [],
        events: []
    }
    if (node.nodeType == Node.ELEMENT_NODE) {
        element.type = getHTMLElementType(node);
        element.children = []
        element.events = getHTMLElementeEvents(node, events)

        for (let index = 0; index < node.childNodes.length; index++) {
            const child = node.childNodes[index];
            element.children.push(parseHTMLElement(child, events, substitutions));
        }
    }
    if (node.nodeType == Node.TEXT_NODE) {
        element.children = parseHTMLTextElement(node, substitutions);
    }
    return element
};
var parseHTMLTextElement = function (node: ChildNode, substitutions: string[]): ElementType[] | string {
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
const getTextElementFromTextTemplate = function(templateString: string, substitutions: string[]){
    const func = new Function(...Object.keys(substitutions), `return nodeTextTemplate\`${templateString}\`;`);
    return func(...Object.values(substitutions));
}
window.nodeTextTemplate = function(pieces: any, ...substitutions: any[]): ElementType[] | string {
    const element: ElementType[] = []

    element.push( { type: "", children: pieces[0], events: [] })
    for (var i = 0; i < substitutions.length; ++i) {
        element.push( { type: "", children: substitutions[i], events: [] })
        element.push( { type: "", children: pieces[i + 1], events: [] })
    } 
    return element

}
var getHTMLElementType = function (node: ChildNode): string {
    const element = node as HTMLElement
    let elementType = element.localName
    return elementType
};
var getHTMLElementeEvents = function (node: ChildNode, events: FrontuComponentEventBinding): FrontuComponentEventBindingElement[] {
    let newEvents: FrontuComponentEventBindingElement[] = []
    const element = node as HTMLElement
    for (const key in events) {
        if (Object.hasOwnProperty.call(events, key)) {
            const event = events[key];
                if (element.matches(key)) {
                    /* console.log("adding events", events) */
                    newEvents = [...event]
                }       
        }
    }
    return newEvents
};

function collapseWhitespace(str: string, trimLeft: boolean, trimRight: boolean, ) {
    var lineBreakBefore = '', lineBreakAfter = '';
    if (trimLeft) {
        // Non-breaking space is specifically handled inside the replacer function here:
        str = str.replace(/^[ \n\r\t\f\xA0]+/, function(spaces) {
        return spaces.replace(/^[^\xA0]+/, '').replace(/(\xA0+)[^\xA0]+/g, '$1 ') ||  '';
        });
    }
    if (trimRight) {
        // Non-breaking space is specifically handled inside the replacer function here:
        str = str.replace(/[ \n\r\t\f\xA0]+$/, function(spaces) {
        return spaces.replace(/[^\xA0]+(\xA0+)/g, ' $1').replace(/[^\xA0]+$/, '') || '';
        });
    }
    return lineBreakBefore + str + lineBreakAfter;
}

function template(pieces: any, ...substitutions: any[]) {
    var result = pieces[0];
/*     console.log("pieces", pieces)
    console.log("substitutions", substitutions); */
    const newSubstitutions: SustitutionDictionary = {}

    for (var i = 0; i < substitutions.length; ++i) {
        if (utils.isHTML(substitutions[i])) {
            result += (substitutions[i] + pieces[i + 1]);
        } else {
            result += "${var_" + (i) +"}" + pieces[i + 1];
            newSubstitutions["var_" + i] =  typeof substitutions[i] == 'number' ? substitutions[i].toString() : substitutions[i] ;
        }
        
    }
    
    return { html: result, substitutions: newSubstitutions};

}
export { render, template }