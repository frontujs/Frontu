import { Component, ComponentType, FrontuComponentEventBinding, FrontuComponentEventBindingElement } from "./component";
import * as utils from './utils'

declare global {
    interface Window { frontuElements: any; }
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
    /* const component = new component({}); */
    component.container = container as HTMLElement;
    component.willMount();
    console.log("instance", component);
    console.log("instance.render()", component.render());
    const elements = getElementsFromHTML(component.render(), component.eventBindingStore);
    window.frontuElements = elements;
    console.log("childrens", elements); 
    domRenderElement(elements, container, 0, component);
};
var domRenderElement = function (element: ElementType, container: HTMLElement | null, index: number, component: Component) {
   
    if (element.type == "" && typeof element.children == "string") {  // Is type text
        console.log("Element text");
        if (container?.childNodes[index]) { // Exist node on DOM
            console.log("Element text exist",  container.childNodes[index]);
            if ( element.children != container.childNodes[index].nodeValue) { // Check if its diferent text
                container.childNodes[index].nodeValue = element.children
            }
            
        } else {
            console.log("Element text does not exist");
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
        console.log("Element type:", element.type)
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
        console.log("Element with children but without type")
        for (let i = 0; i < element.children.length; i++) {
            const newElement = element.children[i];
            domRenderElement(newElement as ElementType, container, i, component);
        }
       
    }
    
};
var getElementsFromHTML = function (html: string, events: FrontuComponentEventBinding) {
    const element: ElementType = {
        type: "",
        children: [],
        events: []
    }
    element.children = []

    const domElements = utils.getChildNodesFromHTMLString(html);
    for (let index = 0; index < domElements.length; index++) {
        const child = domElements[index];
        const newElement = parseHTMLElement(child, events);
        if (newElement.type == "" && newElement.children == "") {
            continue;
        }
        element.children.push(newElement);
        
    }
    return element
};
var parseHTMLElement = function (node: ChildNode, events: FrontuComponentEventBinding): ElementType {
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
            element.children.push(parseHTMLElement(child, events));
        }
    }
    if (node.nodeType == Node.TEXT_NODE) {
        let newContent = node.textContent ? node.textContent : "";
        /* console.log("New content before", newContent) */
        newContent = collapseWhitespace(newContent, true, true)
       /*  console.log("New content after", newContent) */
        element.children = newContent;
    }
    return element
};
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
                    newEvents = [...event]
                    /* element.addEventListener(type, callback);
                    this.eventBindingStore[selector + '.' + type].push({ element, callback }) */
                }
            
        }
    }
    /* console.log("newEvents", newEvents) */
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
export { render }