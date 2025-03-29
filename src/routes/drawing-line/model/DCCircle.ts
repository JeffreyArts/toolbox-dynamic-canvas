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
    type: string = "DCCircle"
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
            this._diameter = 1
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
                this.boundingBox.width = value * 2
                this.boundingBox.height = value * 2
            }
        })

        Object.defineProperty(this, "diameter", {
            get() {
                return this._diameter
            },
            set(value) {
                this._diameter = value
                this._radius = value/2
                this.boundingBox.width = value
                this.boundingBox.height = value
            }
        })

    }
}

export default DCCircle