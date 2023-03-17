import { Component } from "./component";

interface IFrontuRegistryStore {
    [key: string]: Component,
}
interface IFrontuRegistryWillMount {
    [key: string]: boolean,
}
class FrontuRegistry {
    store:IFrontuRegistryStore = {}
    willMount:IFrontuRegistryWillMount = {}
    define(name: string, component: Component) {
        this.store[name] = component;
    }
}
export class Frontu {
    static store: {};
    static COMPONENT_TYPE: number = 999;
    static Registry:FrontuRegistry = new FrontuRegistry();
}



export class FrontuElement {
    GetType(node: { nodeType: number; localName: string | number; }) {
        if (node.nodeType == 1) {
            if (Frontu.Registry.store[node.localName]) {
                return Frontu.COMPONENT_TYPE;
            }
        }
        return node.nodeType
    }
    GetProps = function (node: { attributes: string | any[]; innerHTML: any; }) {
        let props:any = {}
        for (let index = 0; index < node.attributes.length; index++) {
            const element = node.attributes[index];
            props[element.name] = element.value
        }
        props['children'] = node.innerHTML;
        return props;
    }
    Create = function (node: { localName: string | number; }, props = {}, container: any, store = "0", frontu: Frontu) {

       /*  if (Frontu.Store[store]) {
            Frontu.Store[store].update({ container, store, ...props });
        } else {
            Frontu.Store[store] = new Frontu.Registry.store[node.localName]({ container, store, ...props });
        }
    
        Frontu.Store[store].html = Frontu.Store[store].render();
        Frontu.Store[store].willMount();
        let children = stringToHTML(Frontu.Store[store].html);
        return children[0]; */
    }
}

/* Frontu.Element = {}
Frontu.Element.GetType = function (node: { nodeType: number; localName: string | number; }) {
    if (node.nodeType == 1) {
        if (Frontu.Registry.store[node.localName]) {
            return Frontu.COMPONENT_TYPE;
        }
    }
    return node.nodeType
} */
/* Frontu.Element.GetProps = function (node: { attributes: string | any[]; innerHTML: any; }) {
    let props = {}
    for (let index = 0; index < node.attributes.length; index++) {
        const element = node.attributes[index];
        props[element.name] = element.value
    }
    props['children'] = node.innerHTML;
    return props;
} */
/* 
Frontu.DOMRender = function (component: any, container: any) {
    Frontu.DOMRenderComponent(component, container, "0");
}
Frontu.DOMRenderGetParentComponentStore = function (store: string) {
    let storeElements = store.split('.');
    let currentStore = storeElements.join('.');
    let storeComponents = Object.keys(Frontu.Store);
    while (!storeComponents.includes(currentStore) && currentStore) {
        storeElements.pop();
        currentStore = storeElements.join('.');
    }
    return currentStore;
}
Frontu.DOMRenderAddElementToParent = function (element: any, store: string | number) {
    let parentStore = Frontu.DOMRenderGetParentComponentStore(store);
    if (Frontu.Store[parentStore]) {
        Frontu.Store[parentStore].validElementTree[store] = element;
    }
}
Frontu.DOMRenderComponent = function (initialHTML: any, container: any, store = ".0", update = false) {

    let children = stringToHTML(initialHTML);

    const storePieces = store.split('.');
    let indexScope = parseInt(storePieces[storePieces.length - 1]);


    for (let index = 0; index < children.length; index++) {
        const child = children[index];
        Frontu.DOMRenderParseChild(child, container, store + "." + index, index, 999);
    }


    // Mounting components
    Frontu.DOMRenderWillMount();

}
Frontu.DOMRenderWillMount = function () {
    for (const storageKey in Frontu.Registry.willMount) {
        if (Object.hasOwnProperty.call(Frontu.Registry.willMount, storageKey)) {
            Frontu.Store[storageKey].didMount();
            delete Frontu.Registry.willMount[storageKey];
        }
    }
}
Frontu.DOMRenderParseChild = function (element: { cloneNode: (arg0: boolean) => any; nodeValue: any; childNodes: string | any[]; }, container: { childNodes: string | any[]; replaceChild: (arg0: any, arg1: any) => void; appendChild: (arg0: any) => void; removeChild: (arg0: any) => void; lastChild: any; }, store = "0", index = 0, newChildrenCount: number) {

    let newContainer = null
    let nodeType
    let currentNode = container.childNodes[index];

    if (currentNode) {

        nodeType = Frontu.Element.GetType(element);

        if (nodeType == Node.ELEMENT_NODE) {
            newContainer = element.cloneNode(false);
        }
        if (nodeType == Node.TEXT_NODE) {
            newContainer = element.cloneNode(false);
            newContainer.nodeValue = element.nodeValue
        }
        if (nodeType == Frontu.COMPONENT_TYPE) {
            element = Frontu.Element.Create(element, Frontu.Element.GetProps(element), container, store).cloneNode(true);
            newContainer = element.cloneNode(false);
            nodeType = Frontu.Element.GetType(newContainer);
        }



        if (nodeType != Frontu.Element.GetType(container.childNodes[index])) {
            container.replaceChild(newContainer, container.childNodes[index]);
        } else {
            if (nodeType == 1) {
                if (newContainer.localName == container.childNodes[index].localName) {
                    newContainer = container.childNodes[index]
                } else {
                    container.replaceChild(newContainer, container.childNodes[index]);

                }
            } else if (nodeType == 3) {

                if (container.childNodes[index].nodeValue != newContainer.nodeValue) {
                    container.childNodes[index].nodeValue = newContainer.nodeValue;
                }
            } else {

            }

        }


    } else {
        nodeType = Frontu.Element.GetType(element);
        if (nodeType == Frontu.COMPONENT_TYPE) {

            element = Frontu.Element.Create(element, Frontu.Element.GetProps(element), container, store);
            newContainer = element.cloneNode(false);
        }
        if (nodeType == Node.TEXT_NODE) {
            newContainer = element.cloneNode(false);
            newContainer.nodeValue = element.nodeValue
        }
        if (nodeType == Node.ELEMENT_NODE) {
            newContainer = element.cloneNode(false);
        }
        if (nodeType == Node.COMMENT_NODE) {
            newContainer = null;
        }
        if (newContainer) {
            container.appendChild(newContainer);
        }

    }
    while (newChildrenCount < container.childNodes.length) {
       
        container.removeChild(container.lastChild);
    }
    let newContainerReal = container.childNodes[index];

    Frontu.DOMRenderAddElementToParent(container.childNodes[index], store);
    for (let index = 0; index < element.childNodes.length; index++) {
        const newStore = store + "." + index;
        Frontu.DOMRenderParseChild(element.childNodes[index], newContainerReal, newStore, index, element.childNodes.length);

    }
}   */