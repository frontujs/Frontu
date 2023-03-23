
export interface FrontuComponentEventBinding {
    [key: string]: string | Function,
}
export interface ElementActions {
    type: string,
    callback: CallableFunction
}
export interface ElementType {
    type: string | Function
    children: ElementType[] | string
    props: FrontuComponentEventBinding[]
    container?: HTMLElement
    key?: string,
    mountActions?: ElementActions[]
    unMountActions?: ElementActions[]
    states?: any[]
}
export interface ElementContext {
    element: ElementType
    index: number
}
export interface ElementContextDictionary {
    [key: string]: ElementContext,

}