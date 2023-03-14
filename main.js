/**
 * Convert a template string into HTML DOM nodes
 * @param  {String} str The template string
 * @return {Node}       The template HTML
 */
var stringToHTML = function (str) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, 'text/html');
    return doc.body.childNodes;
};

var getNodeContent = function (node) {
    if (node.childNodes && node.childNodes.length > 0) return null;
    return node.textContent;
};
class SkyComponent {

    constructor(props) {
        this.container = props.container;
        this.store = props.store;
        this.props = props;
        this.state = {}
        this.eventBindingStore = {}
        this.validElementTree = {}
    }
    update(props) {
        this.container = props.container;
        this.store = props.store;
        this.props = props;
    }
    didMount() {

    }
    willMount() {
        Sky.Registry.willMount[this.store] = true;
    }
    // update the state and call onUpdate
    setState(handler) {
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
        const newHTML = this.render();
        let children = stringToHTML(newHTML);
        this.getValidElementTree(children);
        const storePieces = this.store.split('.');
        let indexScope = parseInt(storePieces[storePieces.length - 1]);
        Sky.DOMRenderParseChild(children[0], this.container, this.store, indexScope, this.container.childNodes.length);
        Sky.DOMRenderWillMount();
    }
    eventBinding(selector, type, callback) {
        if (this.eventBindingStore[selector + '.' + type]) {
            this.cleanEventBinding(selector, type);
        }
        // Add validation for avoid add events to elements of another components
        this.eventBindingStore[selector + '.' + type] = []
        const storePieces = this.store.split('.');
        let indexScope = parseInt(storePieces[storePieces.length - 1]);
        let elements = this.container.childNodes[indexScope].querySelectorAll(selector);
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            element.addEventListener(type, callback);
            this.eventBindingStore[selector + '.' + type].push({ element, callback })
        }

    }
    cleanEventBinding(selector, type) {
        for (let index = 0; index < this.eventBindingStore[selector + '.' + type].length; index++) {
            const element = this.eventBindingStore[selector + '.' + type][index];
            element.element.removeEventListener(type, element.callback);
        }
    }
    getValidElementTree(children, store = "") {
        for (let index = 0; index < children.length; index++) {
            const element = children[index];
            this.validElementTree[store + "." + index] = element;
            this.getValidElementTree(element.childNodes, store = "." + index)
        }
    }


}
var Sky = {}
Sky.Store = {}
Sky.COMPONENT_TYPE = 999;
Sky.Registry = {}
Sky.Registry.store = {}
Sky.Registry.willMount = {}
Sky.Registry.define = function (name, component) {
    Sky.Registry.store[name] = component;
}

Sky.Element = {}
Sky.Element.GetType = function (node) {
    if (node.nodeType == 1) {
        if (Sky.Registry.store[node.localName]) {
            return Sky.COMPONENT_TYPE;
        }
    }
    return node.nodeType
}
Sky.Element.GetProps = function (node) {
    let props = {}
    for (let index = 0; index < node.attributes.length; index++) {
        const element = node.attributes[index];
        props[element.name] = element.value
    }
    props['children'] = node.innerHTML;
    return props;
}
Sky.Element.Create = function (node, props = {}, container, store = "0") {

    if (Sky.Store[store]) {
        Sky.Store[store].update({ container, store, ...props });
    } else {
        Sky.Store[store] = new Sky.Registry.store[node.localName]({ container, store, ...props });
    }

    let html = Sky.Store[store].render();
    Sky.Store[store].willMount();
    let children = stringToHTML(html);
    Sky.Store[store].getValidElementTree(children);
    return children[0];
}
Sky.DOMRender = function (component, container) {
    Sky.DOMRenderComponent(component, container, "0");
}

Sky.DOMRenderComponent = function (initialHTML, container, store = ".0", update = false) {

    let children = stringToHTML(initialHTML);

    const storePieces = store.split('.');
    let indexScope = parseInt(storePieces[storePieces.length - 1]);
    console.log("indexScope", indexScope);
    console.log("children", children);
    console.log("container", container);

    for (let index = 0; index < children.length; index++) {
        const child = children[index];
        Sky.DOMRenderParseChild(child, container, store + "." + index, index, 999);
    }


    // Mounting components
    Sky.DOMRenderWillMount();

}
Sky.DOMRenderWillMount = function () {
    for (const storageKey in Sky.Registry.willMount) {
        if (Object.hasOwnProperty.call(Sky.Registry.willMount, storageKey)) {
            Sky.Store[storageKey].didMount();
            delete Sky.Registry.willMount[storageKey];
        }
    }
}
Sky.DOMRenderParseChild = function (element, container, store = "0", index = 0, newChildrenCount) {

    let newContainer = null
    let nodeType
    let currentNode = container.childNodes[index];

    if (currentNode) {

        nodeType = Sky.Element.GetType(element);

        if (nodeType == Node.ELEMENT_NODE) {
            newContainer = element.cloneNode(false);
        }
        if (nodeType == Node.TEXT_NODE) {
            newContainer = element.cloneNode(false);
            newContainer.nodeValue = element.nodeValue
        }
        if (nodeType == Sky.COMPONENT_TYPE) {
            element = Sky.Element.Create(element, Sky.Element.GetProps(element), container, store).cloneNode(true);
            newContainer = element.cloneNode(false);
            nodeType = Sky.Element.GetType(newContainer);
        }



        if (nodeType != Sky.Element.GetType(container.childNodes[index])) {
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
        nodeType = Sky.Element.GetType(element);
        if (nodeType == Sky.COMPONENT_TYPE) {

            element = Sky.Element.Create(element, Sky.Element.GetProps(element), container, store);
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
        console.log("Se debe borrar elementos en", container)
        container.removeChild(container.lastChild);
    }
    let newContainerReal = container.childNodes[index];

    for (let index = 0; index < element.childNodes.length; index++) {
        const newStore = store + "." + index;
        Sky.DOMRenderParseChild(element.childNodes[index], newContainerReal, newStore, index, element.childNodes.length);

    }
}  