
declare global {
    interface Window { frontuComponents: any; }
}
export function declareComponent(componentClass: any, tagname: string) {
    if (!window.frontuComponents) {
        window.frontuComponents = {}
    }
    if (!window.frontuComponents[tagname]) {
        window.frontuComponents[tagname] = componentClass;
    }
}
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
    tagName: string;
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
        this.tagName = (<any>this).constructor.name;
       
      
    }
    update(props: { container: any; store: any; }) {
        this.container = props.container;
        this.store = props.store;
        this.props = props;
    }
    didMount() {

    }
    willMount() {

    }
    beforeWillMount() {
        this.eventBindingStore = {}; // Resets events
    }
    // update the state and call onUpdate
    setState(handler: (arg0: any) => any) {

        this.state = handler(this.state)

        if (!this.onUpdate) return this.state;
        return this.onUpdate();
    }
    onUpdate() {
        this.willMount();
        this.html = this.render();

    }
    render(): any {
        throw new Error("Method not implemented.");
    }
    eventBinding(selector: string, type: string, callback: any) {

        if (!this.eventBindingStore[selector] ) {
            this.eventBindingStore[selector] = []
        }   
        this.eventBindingStore[selector].push({ type, callback })
        
    }
    cleanEventBinding(selector: string, type: string) {
       /*  for (let index = 0; index < this.eventBindingStore[selector + '.' + type].length; index++) {
            const element = this.eventBindingStore[selector + '.' + type][index];
            element.element.removeEventListener(type, element.callback);
        } */
    }


}
