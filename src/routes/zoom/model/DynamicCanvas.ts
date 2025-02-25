import { DCRectangle } from "./DCRectangle"
import { DCImage } from "./DCImage"

export interface DynamicCanvasOptions {
    width?: number
    height?: number
    zoom?: boolean | number
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

export interface DCGradient {
    type: "linear" | "radial"
    colors: Array<{ color: string, offset: number }> | Array<string>
    angle?: number
}


export class DynamicCanvas {
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    layers: Array<DCRectangle | DCImage>
    width: number
    height: number
    _zoom: number
    zoom: number
    _zoomChanged: boolean
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

        // Make zoom dynamic
        Object.defineProperty(this, "zoom", {
            get() {

                return this._zoom
            },
            set(value) {
                // Make sure that zoom does not surpass 0
                if (value <= 0) {
                    value = 0.1
                }
                this._zoomChanged = true
                this._zoom = value
            }
        })

        if (options) {
            if (typeof options.width === "number") {
                this.width = options.width
            }
            if (typeof options.height === "number") {
                this.height = options.height
            }
            if (typeof options.zoom === "number" ) {
                this._zoom = options.zoom
            } 
        }

        this.#draw()
    }   
    #draw() {
        this.context.clearRect(0, 0, this.width, this.height)
        
        if (this._zoomChanged) {
            this.context.setTransform(1, 0, 0, 1, 0, 0);

            const x = this.width / 2
            const y = this.height / 2
            
            this.context.translate(x, y);
            this.context.scale(this.zoom, this.zoom);
            this.context.translate(-x, -y);
        }

        this.layers.forEach((element) => {
            const canvas = element._draw(this.context)
            this.context.drawImage(canvas, 0, 0)
        })

        this._zoomChanged = false
        
        requestAnimationFrame(() => this.#draw()) 

    }
}


export default DynamicCanvas