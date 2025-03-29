import { DCScale, DCStroke, DynamicCanvas } from "./DynamicCanvas"
import { DCEllipse } from "./DCEllipse"

export interface DCCircleOptions {
    x?: number
    y?: number
    fill?: string
    angle?: number
    scale?: Partial<DCScale>
    stroke?: Partial<DCStroke>
    origin?: string
    diameter?: number
    radius?: number
}

export class DCCircle extends DCEllipse {
    diameter: number
    _diameter: number
    radius: number
    _radius: number
    
    constructor(canvas: HTMLCanvasElement | DynamicCanvas, options: DCCircleOptions) {
        super(canvas, options)
        if (options.diameter) {
            this._diameter = options.diameter
        } else if (options.radius) {
            this._diameter = options.radius * 2
        } else {
            throw new Error("Diameter or radius is required")
        }

        this._radius = this._diameter / 2
        
        this.radius = this._radius || this._diameter / 2
        this.diameter = this._diameter || this._radius * 2
        this.width = this._radius * 2
        this.height = this._radius * 2
        
        // Make radius dynamic
        Object.defineProperty(this, "radius", {
            get() {
                return this._diameter/2
            },
            set(value) {
                this._radius = value
                this._diameter = value * 2
                this.width = value * 2
                this.height = value * 2
            }
        })


        // Proxy handler
        const handler = {
            get: (target: DCCircle, prop: keyof DCCircle) => {
                // Pretty sure that these prop checks are not needed, but need to test first
                if (prop === "radius") {
                    return target._diameter / 2 // Return radius as half of diameter
                }
                if (prop === "diameter") {
                    return target._radius * 2 // Return diameter as twice of radius
                }
                
                // Default behavior for other properties
                if (prop in target) {
                    return target[prop]
                }
            },
        
            set: (target: DCCircle, prop: keyof DCCircle, value: any) => {
                // Handle setting radius
                if (prop === "radius") {
                    target._radius = value
                    target._diameter = value * 2
                    target.width = value * 2 
                    target.height = value * 2
                } else if (prop === "diameter") {
                    target._diameter = value
                    target._radius = value / 2
                    target.width = value 
                    target.height = value
                } else {
                    (target as any)[prop] = value
                }
        
                target.updateFrame = true
                return true 
            }
        }        
    }
}

export default DCCircle