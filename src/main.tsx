/**
 * Convert a template string into HTML DOM nodes
 * @param  {String} str The template string
 * @return {Node}       The template HTML
 */
var stringToHTML = function (str: string) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, 'text/html');
    return doc.body.childNodes;
};

var getNodeContent = function (node: { childNodes: string | any[]; textContent: any; }) {
    if (node.childNodes && node.childNodes.length > 0) return null;
    return node.textContent;
};
export class FrontuComponent {
    container: any;
    store: any;
    props: { container: any; store: any; };
    state: {};
    html: string;
    eventBindingStore: {};
    validElementTree: {};

    constructor(props: { container: any; store: any; }) {
        this.container = props.container;
        this.store = props.store;
        this.props = props;
        this.state = {}
        this.html = '';
        this.eventBindingStore = {}
        this.validElementTree = {}
    }
    update(props: { container: any; store: any; }) {
        this.container = props.container;
        this.store = props.store;
        this.props = props;
    }
    didMount() {

    }
    willMount() {
        Frontu.Registry.willMount[this.store] = true;
    }
    // update the state and call onUpdate
    setState(handler: (arg0: any) => any) {
        if (typeof handler !== 'function') {
            this.state = { ...this.state, ...handler };
            if (!this.onUpdate) return this.state;
            return this.onUpdate(this.state);
        }
        this.state = handler(this.state)

        if (!this.onUpdate) return this.state;
        return this.onUpdate(this.state);
    }
    onUpdate() {
        this.willMount();
        this.html = this.render();
        let children = stringToHTML(this.html);

        const storePieces = this.store.split('.');
        let indexScope = parseInt(storePieces[storePieces.length - 1]);
        Frontu.DOMRenderParseChild(children[0], this.container, this.store, indexScope, this.container.childNodes.length);
        Frontu.DOMRenderWillMount();
    }
    render(): any {
        throw new Error("Method not implemented.");
    }
    eventBinding(selector: string, type: string, callback: any) {
        if (this.eventBindingStore[selector + '.' + type]) {
            this.cleanEventBinding(selector, type);
        }
        this.eventBindingStore[selector + '.' + type] = []
        for (const key in this.validElementTree) {
            if (Object.hasOwnProperty.call(this.validElementTree, key)) {
                const element = this.validElementTree[key];

                if (element.nodeType == 1) {
                    if (element.matches(selector)) {
                        element.addEventListener(type, callback);
                        this.eventBindingStore[selector + '.' + type].push({ element, callback })
                    }
                }
            }
        }


    }
    cleanEventBinding(selector: string, type: string) {
        for (let index = 0; index < this.eventBindingStore[selector + '.' + type].length; index++) {
            const element = this.eventBindingStore[selector + '.' + type][index];
            element.element.removeEventListener(type, element.callback);
        }
    }


}
var Frontu = {}
Frontu.Store = {}
Frontu.COMPONENT_TYPE = 999;
Frontu.Registry = {}
Frontu.Registry.store = {}
Frontu.Registry.willMount = {}
Frontu.Registry.define = function (name: string | number, component: any) {
    Frontu.Registry.store[name] = component;
}

Frontu.Element = {}
Frontu.Element.GetType = function (node: { nodeType: number; localName: string | number; }) {
    if (node.nodeType == 1) {
        if (Frontu.Registry.store[node.localName]) {
            return Frontu.COMPONENT_TYPE;
        }
    }
    return node.nodeType
}
Frontu.Element.GetProps = function (node: { attributes: string | any[]; innerHTML: any; }) {
    let props = {}
    for (let index = 0; index < node.attributes.length; index++) {
        const element = node.attributes[index];
        props[element.name] = element.value
    }
    props['children'] = node.innerHTML;
    return props;
}
Frontu.Element.Create = function (node: { localName: string | number; }, props = {}, container: any, store = "0") {

    if (Frontu.Store[store]) {
        Frontu.Store[store].update({ container, store, ...props });
    } else {
        Frontu.Store[store] = new Frontu.Registry.store[node.localName]({ container, store, ...props });
    }

    Frontu.Store[store].html = Frontu.Store[store].render();
    Frontu.Store[store].willMount();
    let children = stringToHTML(Frontu.Store[store].html);
    return children[0];
}
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
    /* console.log("indexScope", indexScope);
    console.log("children", children);
    console.log("container", container); */

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
        /* console.log("Se debe borrar elementos en", container) */
        container.removeChild(container.lastChild);
    }
    let newContainerReal = container.childNodes[index];

    Frontu.DOMRenderAddElementToParent(container.childNodes[index], store);
    for (let index = 0; index < element.childNodes.length; index++) {
        const newStore = store + "." + index;
        Frontu.DOMRenderParseChild(element.childNodes[index], newContainerReal, newStore, index, element.childNodes.length);

    }
}  