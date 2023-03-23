import { ElementContextDictionary, ElementType } from "./element";

declare global {
    interface Window { frontuRoots: root[]; }
}

let currentRootIndex = 0;

export function createRoot(container: HTMLElement | null) {

    if (container == null) {
        console.error("This instance of root does not have a valid container");
        return null;
    }
    if (!window.frontuRoots) {
        window.frontuRoots = []
    }
    let currentRootLength = window.frontuRoots.length;
    const newRoot = new root(container, { type: "", children: [], props: [] }, currentRootLength);
    window.frontuRoots[currentRootLength] = newRoot

    return newRoot;
}


export function useEffect(cb: CallableFunction) {

    const currentElement = window.frontuRoots[currentRootIndex].contexts[currentContextKey].element;

    if (!currentElement.unMountActions) {
        currentElement.unMountActions = []
    }
    while (currentElement.unMountActions.length) {

        let unMountAction = currentElement.unMountActions.pop();
        unMountAction?.callback();
    }
    if (!currentElement.mountActions) {
        currentElement.mountActions = []
    }
    currentElement.mountActions.push({ type: "effect", callback: cb })

    currentElement.unMountActions.push({ type: "effect", callback: cb() })

}

let currentContextKey = "";

let actionCurrentRootIndex = 0;

let currentHookIndex = 0;
export function useState(initialValue: any) {

    const currentIndexContext = structuredClone(currentContextKey);


    const currentElement = window.frontuRoots[currentRootIndex].contexts[currentIndexContext].element;

    if (!currentElement.states) {
        currentElement.states = []
    }
    if (!currentElement.states[currentHookIndex]) {
        currentElement.states[currentHookIndex] = initialValue;
    }

    return [currentElement.states[currentHookIndex], function (newValue: any) {
        const currentElement = window.frontuRoots[currentRootIndex].contexts[currentIndexContext].element;


        const currentElementContainer = currentElement.container;
        const currentElementIndex = window.frontuRoots[currentRootIndex].contexts[currentIndexContext].index;

        if (!currentElement.states) {
            currentElement.states = []
        }

        currentElement.states[currentHookIndex] = newValue


        if (typeof currentElement.type == "function" && currentElementContainer) {
            currentHookIndex = 0;
            currentElement.children = []
            window.frontuRoots[actionCurrentRootIndex].hydrateElement(currentElement, currentElementContainer, currentElementIndex, "")
        }

    }]
}


export class root {
    container: HTMLElement;
    elements: ElementType;
    contexts: ElementContextDictionary;

    index: number
    constructor(container: HTMLElement, defaultElement: ElementType, index: number) {
        this.container = container
        this.elements = defaultElement
        this.index = index
        this.contexts = {}

    }
    render(element: ElementType) {
        this.elements = element;
        this.hydratation();
    }
    hydratation() {

        this.hydrateElement(this.elements, this.container, 0, "")
    }
    hydrateElement(element: ElementType, container: HTMLElement, index: number, keyIndex: string): ElementType {

        element.container = container
        keyIndex = keyIndex + "." + index
        element.key = keyIndex



        if (element.type == "" && typeof element.children == "string") {  // Is type text
            if (container?.childNodes[index]) { // Exist node on DOM
                if (element.children != container.childNodes[index].nodeValue) { // Check if its diferent text
                    container.childNodes[index].nodeValue = element.children
                }

            } else {

                const currentLenght = container?.childNodes?.length ? container.childNodes.length : 0;
                let newNode = null;
                if (currentLenght > index) {  // Insertbefore
                    newNode = document.createTextNode(element.children);
                    container?.insertBefore(newNode, container.childNodes[index - 1])
                } else {
                    newNode = document.createTextNode(element.children);
                    /* console.log("newNode", newNode);
                    console.log(container);
                    console.log(element); */
                    container?.appendChild(newNode)
                }

            }
            return element;
        }
        if (element.type != "") {  // Is type element

            if (typeof element.type == "function") {

                actionCurrentRootIndex = this.index
                currentHookIndex = 0;
                currentContextKey = keyIndex
                this.contexts[keyIndex] = { element, index }
                let newElement = element.type();

                console.log("Function element", element, container, index, newElement)
                /* console.log("newElement", newElement)
                console.log("container", container);
                console.log("element", element); */
                element.children = []
                element.children.push(this.hydrateElement(newElement, container, index, keyIndex))
                return element;
            }

            if (container?.childNodes[index]) { // Exist node on DOM
                /* console.log("Exist element", element, container, index) */
                const currentLenght = container?.childNodes?.length ? container.childNodes.length : 0;


                let newNode = null;
                if (container?.childNodes[index].nodeType != 1) {
                    newNode = document.createElement(element.type as string);
                    container?.replaceChild(newNode, container?.childNodes[index])
                }

                for (let i = 0; i < element.children.length; i++) {
                    const newElement = element.children[i];
                    this.hydrateElement(newElement as ElementType, container.childNodes[index] as HTMLElement, i, keyIndex);
                }
            } else {
                /*  console.log("Not Exist on DOM", element, container, index) */
                const currentLenght = container?.childNodes?.length ? container.childNodes.length : 0;
                let newNode = null;


                if (currentLenght > index) {  // Insertbefore
                    newNode = document.createElement(element.type as string);
                    container?.insertBefore(newNode, container.childNodes[index - 1])
                } else {
                    newNode = document.createElement(element.type as string);
                    container?.appendChild(newNode)
                }

                for (let i = 0; i < element.children.length; i++) {
                    const newElement = element.children[i];
                    this.hydrateElement(newElement as ElementType, newNode, i, keyIndex);
                }


            }
        }
        if (element.type == "") {  // Is empty Element
            /* console.log("Its a empty element", element) */
            for (let i = 0; i < element.children.length; i++) {
                const newElement = element.children[i];
                this.hydrateElement(newElement as ElementType, container, index + i, keyIndex);
            }

        }
        return element;
    }

}