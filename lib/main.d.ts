export declare class FrontuComponent {
    container: any;
    store: any;
    props: {
        container: any;
        store: any;
    };
    state: {};
    html: string;
    eventBindingStore: {};
    validElementTree: {};
    constructor(props: {
        container: any;
        store: any;
    });
    update(props: {
        container: any;
        store: any;
    }): void;
    didMount(): void;
    willMount(): void;
    setState(handler: (arg0: any) => any): void | {};
    onUpdate(): void;
    render(): any;
    eventBinding(selector: string, type: string, callback: any): void;
    cleanEventBinding(selector: string, type: string): void;
}
