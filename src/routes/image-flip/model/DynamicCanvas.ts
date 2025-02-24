import { DCRectangle } from "./DCRectangle"
import { DCImage } from "./DCImage"

export interface DynamicCanvasOptions {
    width?: number
    height?: number
}

export type DCOriginName = "top" | "bottom" | "left" | "right" | "center"

export interface DCStroke {
    color: string
    width: number
    alignment: "inner" | "center" | "outer"
}

export interface DCScale {
    x: number
    y: number
}

export interface DCFlip {
    horizontal: boolean
    vertical: boolean
}


export class DynamicCanvas {
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    layers: Array<DCRectangle | DCImage>
    width: number
    height: number
    constructor(targetElement: HTMLElement, options?: DynamicCanvasOptions) {
        this.canvas = targetElement.tagName !== "CANVAS" ? document.createElement("canvas") : targetElement as HTMLCanvasElement
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D
        this.layers = []

        this.width = this.canvas.width
        this.height = this.canvas.height
        

        // Make width dynamic
        Object.defineProperty(this, "width", {
            get() {
                return this.canvas.width
            },
            set(value) {
                this.canvas.width = parseInt(value, 10)
            }
        })
        // Make height dynamic
        Object.defineProperty(this, "height", {
            get() {
                return this.canvas.height
            },
            set(value) {
                this.canvas.height = parseInt(value, 10)
            }
        })

        if (options) {
            if (typeof options.width === "number") {
                this.width = options.width
            }
            if (typeof options.height === "number") {
                this.height = options.height
            }
        }

        this.#draw()
    }   
    #draw() {
        this.context.clearRect(0, 0, this.width, this.height)
        this.layers.forEach((element) => {
            element._draw(this.context)
        })
        
        requestAnimationFrame(() => this.#draw()) 

    }
}


export default DynamicCanvas