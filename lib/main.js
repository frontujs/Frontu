"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontuComponent = exports.Frontu = void 0;
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
    if (node.childNodes && node.childNodes.length > 0)
        return null;
    return node.textContent;
};
var Frontu = /** @class */ (function () {
    function Frontu() {
    }
    Frontu.COMPONENT_TYPE = 999;
    return Frontu;
}());
exports.Frontu = Frontu;
var FrontuComponent = /** @class */ (function () {
    function FrontuComponent(props) {
        this.container = props.container;
        this.store = props.store;
        this.props = props;
        this.state = {};
        this.html = '';
        this.eventBindingStore = {};
        this.validElementTree = {};
    }
    FrontuComponent.prototype.update = function (props) {
        this.container = props.container;
        this.store = props.store;
        this.props = props;
    };
    FrontuComponent.prototype.didMount = function () {
    };
    FrontuComponent.prototype.willMount = function () {
        Frontu.Registry.willMount[this.store] = true;
    };
    // update the state and call onUpdate
    FrontuComponent.prototype.setState = function (handler) {
        if (typeof handler !== 'function') {
            this.state = __assign(__assign({}, this.state), handler);
            if (!this.onUpdate)
                return this.state;
            return this.onUpdate(this.state);
        }
        this.state = handler(this.state);
        if (!this.onUpdate)
            return this.state;
        return this.onUpdate(this.state);
    };
    FrontuComponent.prototype.onUpdate = function () {
        this.willMount();
        this.html = this.render();
        var children = stringToHTML(this.html);
        var storePieces = this.store.split('.');
        var indexScope = parseInt(storePieces[storePieces.length - 1]);
        Frontu.DOMRenderParseChild(children[0], this.container, this.store, indexScope, this.container.childNodes.length);
        Frontu.DOMRenderWillMount();
    };
    FrontuComponent.prototype.render = function () {
        throw new Error("Method not implemented.");
    };
    FrontuComponent.prototype.eventBinding = function (selector, type, callback) {
        if (this.eventBindingStore[selector + '.' + type]) {
            this.cleanEventBinding(selector, type);
        }
        this.eventBindingStore[selector + '.' + type] = [];
        for (var key in this.validElementTree) {
            if (Object.hasOwnProperty.call(this.validElementTree, key)) {
                var element = this.validElementTree[key];
                if (element.nodeType == 1) {
                    if (element.matches(selector)) {
                        element.addEventListener(type, callback);
                        this.eventBindingStore[selector + '.' + type].push({ element: element, callback: callback });
                    }
                }
            }
        }
    };
    FrontuComponent.prototype.cleanEventBinding = function (selector, type) {
        for (var index = 0; index < this.eventBindingStore[selector + '.' + type].length; index++) {
            var element = this.eventBindingStore[selector + '.' + type][index];
            element.element.removeEventListener(type, element.callback);
        }
    };
    return FrontuComponent;
}());
exports.FrontuComponent = FrontuComponent;
Frontu.Registry = {};
Frontu.Registry.store = {};
Frontu.Registry.willMount = {};
Frontu.Registry.define = function (name, component) {
    Frontu.Registry.store[name] = component;
};
Frontu.Element = {};
Frontu.Element.GetType = function (node) {
    if (node.nodeType == 1) {
        if (Frontu.Registry.store[node.localName]) {
            return Frontu.COMPONENT_TYPE;
        }
    }
    return node.nodeType;
};
Frontu.Element.GetProps = function (node) {
    var props = {};
    for (var index = 0; index < node.attributes.length; index++) {
        var element = node.attributes[index];
        props[element.name] = element.value;
    }
    props['children'] = node.innerHTML;
    return props;
};
Frontu.Element.Create = function (node, props, container, store) {
    if (props === void 0) { props = {}; }
    if (store === void 0) { store = "0"; }
    if (Frontu.Store[store]) {
        Frontu.Store[store].update(__assign({ container: container, store: store }, props));
    }
    else {
        Frontu.Store[store] = new Frontu.Registry.store[node.localName](__assign({ container: container, store: store }, props));
    }
    Frontu.Store[store].html = Frontu.Store[store].render();
    Frontu.Store[store].willMount();
    var children = stringToHTML(Frontu.Store[store].html);
    return children[0];
};
Frontu.DOMRender = function (component, container) {
    Frontu.DOMRenderComponent(component, container, "0");
};
Frontu.DOMRenderGetParentComponentStore = function (store) {
    var storeElements = store.split('.');
    var currentStore = storeElements.join('.');
    var storeComponents = Object.keys(Frontu.Store);
    while (!storeComponents.includes(currentStore) && currentStore) {
        storeElements.pop();
        currentStore = storeElements.join('.');
    }
    return currentStore;
};
Frontu.DOMRenderAddElementToParent = function (element, store) {
    var parentStore = Frontu.DOMRenderGetParentComponentStore(store);
    if (Frontu.Store[parentStore]) {
        Frontu.Store[parentStore].validElementTree[store] = element;
    }
};
Frontu.DOMRenderComponent = function (initialHTML, container, store, update) {
    if (store === void 0) { store = ".0"; }
    if (update === void 0) { update = false; }
    var children = stringToHTML(initialHTML);
    var storePieces = store.split('.');
    var indexScope = parseInt(storePieces[storePieces.length - 1]);
    /* console.log("indexScope", indexScope);
    console.log("children", children);
    console.log("container", container); */
    for (var index = 0; index < children.length; index++) {
        var child = children[index];
        Frontu.DOMRenderParseChild(child, container, store + "." + index, index, 999);
    }
    // Mounting components
    Frontu.DOMRenderWillMount();
};
Frontu.DOMRenderWillMount = function () {
    for (var storageKey in Frontu.Registry.willMount) {
        if (Object.hasOwnProperty.call(Frontu.Registry.willMount, storageKey)) {
            Frontu.Store[storageKey].didMount();
            delete Frontu.Registry.willMount[storageKey];
        }
    }
};
Frontu.DOMRenderParseChild = function (element, container, store, index, newChildrenCount) {
    if (store === void 0) { store = "0"; }
    if (index === void 0) { index = 0; }
    var newContainer = null;
    var nodeType;
    var currentNode = container.childNodes[index];
    if (currentNode) {
        nodeType = Frontu.Element.GetType(element);
        if (nodeType == Node.ELEMENT_NODE) {
            newContainer = element.cloneNode(false);
        }
        if (nodeType == Node.TEXT_NODE) {
            newContainer = element.cloneNode(false);
            newContainer.nodeValue = element.nodeValue;
        }
        if (nodeType == Frontu.COMPONENT_TYPE) {
            element = Frontu.Element.Create(element, Frontu.Element.GetProps(element), container, store).cloneNode(true);
            newContainer = element.cloneNode(false);
            nodeType = Frontu.Element.GetType(newContainer);
        }
        if (nodeType != Frontu.Element.GetType(container.childNodes[index])) {
            container.replaceChild(newContainer, container.childNodes[index]);
        }
        else {
            if (nodeType == 1) {
                if (newContainer.localName == container.childNodes[index].localName) {
                    newContainer = container.childNodes[index];
                }
                else {
                    container.replaceChild(newContainer, container.childNodes[index]);
                }
            }
            else if (nodeType == 3) {
                if (container.childNodes[index].nodeValue != newContainer.nodeValue) {
                    container.childNodes[index].nodeValue = newContainer.nodeValue;
                }
            }
            else {
            }
        }
    }
    else {
        nodeType = Frontu.Element.GetType(element);
        if (nodeType == Frontu.COMPONENT_TYPE) {
            element = Frontu.Element.Create(element, Frontu.Element.GetProps(element), container, store);
            newContainer = element.cloneNode(false);
        }
        if (nodeType == Node.TEXT_NODE) {
            newContainer = element.cloneNode(false);
            newContainer.nodeValue = element.nodeValue;
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
    var newContainerReal = container.childNodes[index];
    Frontu.DOMRenderAddElementToParent(container.childNodes[index], store);
    for (var index_1 = 0; index_1 < element.childNodes.length; index_1++) {
        var newStore = store + "." + index_1;
        Frontu.DOMRenderParseChild(element.childNodes[index_1], newContainerReal, newStore, index_1, element.childNodes.length);
    }
};
