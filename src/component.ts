
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
