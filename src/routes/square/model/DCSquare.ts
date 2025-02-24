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
    size: number

    constructor(canvas: HTMLCanvasElement | DynamicCanvas, options: DCSquareOptions) {
        super(canvas, options);
        this.size = options.size
        
        // Create a Proxy to handle changes dynamically
        return new Proxy(this, {
            get(target, prop) {
                if (prop === "size") return target[prop];  // Direct access to src
                return Reflect.get(target, prop);  // Reflect for other properties
            },
            set(target, prop, value) {
                if (prop === "size") {
                    target.width = value;
                    target.height = value;
                    return true;
                } 
                
                return Reflect.set(target, prop, value);
            }
        });

    }
}

export default DCSquare