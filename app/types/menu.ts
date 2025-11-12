export interface MenuItem {
    readonly id: string
    readonly name: string
    readonly icon: Component
    readonly url?: string
    readonly child?: readonly MenuItem[]
    readonly permission?: readonly string[]
    readonly roles?: readonly string[]
}