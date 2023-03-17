
export interface FrontuComponentEventBindingElement {
    type: string,
    callback: CallableFunction
}
export interface FrontuComponentEventBinding {
    [key: string]: FrontuComponentEventBindingElement[],
}
export interface ComponentType {
    container: HTMLElement;
    render(): string;
}

export class Component implements ComponentType{
    container: HTMLElement;
    store: any;
    props: { container: any; store: any; };
    state: {};
    html: string;
    eventBindingStore: FrontuComponentEventBinding = {};
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
       /*  Frontu.Registry.willMount[this.store] = true; */
    }
    // update the state and call onUpdate
    setState(handler: (arg0: any) => any) {
        /* if (typeof handler !== 'function') {
            this.state = { ...this.state, ...handler };
            if (!this.onUpdate) return this.state;
            return this.onUpdate(this.state);
        } */
        this.state = handler(this.state)

        if (!this.onUpdate) return this.state;
        return this.onUpdate();
    }
    onUpdate() {
        this.willMount();
        this.html = this.render();
      /*   let children = stringToHTML(this.html); */
/* 
        const storePieces = this.store.split('.');
        let indexScope = parseInt(storePieces[storePieces.length - 1]);
        Frontu.DOMRenderParseChild(children[0], this.container, this.store, indexScope, this.container.childNodes.length);
        Frontu.DOMRenderWillMount(); */
    }
    render(): any {
        throw new Error("Method not implemented.");
    }
    eventBinding(selector: string, type: string, callback: any) {
        /* if (this.eventBindingStore[selector + '.' + type]) {
            this.cleanEventBinding(selector, type);
        } */
        if (!this.eventBindingStore[selector] ) {
            this.eventBindingStore[selector] = []
        }   
        this.eventBindingStore[selector].push({ type, callback })
        /*
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
        } */


    }
    cleanEventBinding(selector: string, type: string) {
       /*  for (let index = 0; index < this.eventBindingStore[selector + '.' + type].length; index++) {
            const element = this.eventBindingStore[selector + '.' + type][index];
            element.element.removeEventListener(type, element.callback);
        } */
    }


}
