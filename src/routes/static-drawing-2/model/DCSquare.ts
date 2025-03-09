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
        
        // Proxy handler
        const handler = {
            get: (target: DCSquare, prop: keyof DCSquare) => {
                if (prop in target) {
                    return target[prop];
                } 
            },
            set: (target: DCSquare, prop: keyof DCSquare, value:any) => {
                // Prevent infinite loop
                if (prop === "updateFrame") {
                    target.updateFrame = value;
                    return true
                } 
                if (prop === "size") {
                    target.width = value;
                    target.height = value;
                    return true;
                }
                
                (target as any)[prop] = value;
                target.updateFrame = true
                return true; // Indicate that the set was successful
            }
        };
    }
}

export default DCSquare