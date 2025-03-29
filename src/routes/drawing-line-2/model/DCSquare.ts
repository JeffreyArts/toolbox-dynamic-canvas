import { DCScale, DCStroke, DynamicCanvas } from "./DynamicCanvas"
import { DCRectangle } from "./DCRectangle"

export interface DCSquareOptions {
    size: number
    x?: number
    y?: number
    fill?: string
    angle?: number
    scale?: Partial<DCScale>
    stroke?: Partial<DCStroke>
    origin?: string
}

export class DCSquare extends DCRectangle {
    type: string = "DCSquare"
    size: number

    constructor(canvas: HTMLCanvasElement | DynamicCanvas, options: DCSquareOptions) {
        super(canvas, options)
        this.size = options.size || 0
        this.updateSize(this.size)
        
        // Proxy handler
        const handler = {
            get: (target: DCSquare, prop: keyof DCSquare) => {
                if (prop in target) {
                    return target[prop]
                } 
            },
            set: (target: DCSquare, prop: keyof DCSquare, value:any) => {
                // Prevent infinite loop
                if (prop === "updateFrame") {
                    target.updateFrame = value
                    return true
                }
                if (prop === "size") {
                    target.updateSize(value)
                    return true
                }
                
                (target as any)[prop] = value
                target.updateFrame = true
                return true // Indicate that the set was successful
            }
        }
        return new Proxy(this, handler)
    }

    updateSize(size: number) {
        this.size = size
        this.width = size
        this.height = size
    }
}

export default DCSquare