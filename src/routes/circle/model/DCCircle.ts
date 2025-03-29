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


        // // Create a Proxy to handle changes dynamically
        // return new Proxy(this, {
        //     get(target, prop) {
        //         return Reflect.get(target, prop);  // Reflect for other properties
        //     },
        //     set(target, prop, value) {
        //         if (prop === "radius") {
        //             if (target.diameter != target.radius * 2) {
        //                 target.diameter = target.radius * 2 
        //             }
        //             return true
        //         }
        //         if (prop === "diameter") {
        //             if (target.radius != target.diameter / 2) {
        //                 target.radius = target.diameter / 2
        //             }
        //             target.width = target.diameter
        //             target.height = target.diameter
        //             return true
        //         }
                
        //         return Reflect.set(target, prop, value);
        //     }
        // });
    }
}

export default DCCircle