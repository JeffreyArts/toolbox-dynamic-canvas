import { DCScale, DynamicCanvas } from "./DynamicCanvas"
import { DCBasis } from "./DCBasis"

export interface DCImageOptions {
    x?: number
    y?: number
    width?: number
    height?: number
    src?: string
    angle?: number
    scale?: Partial<DCScale> | number
    origin?: string
}

export class DCImage extends DCBasis {
    originalImage: HTMLImageElement | undefined
    src: string  
    _src: string  
    // context: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement | DynamicCanvas, options: DCImageOptions) {
        super(canvas, options);

        this._src = options.src || "";
        this.src = this._src
        if (this.src) {
            this.loadImage(this.src);
        }

        // Proxy handler
        const handler = {
            get: (target: DCImage, prop: keyof DCImage) => {
                if (prop in target) {
                    return target[prop];
                } 
            },
            set: (target: DCImage, prop: keyof DCImage, value:any) => {
                // Prevent infinite loop
                if (prop === "updateFrame") {
                    target.updateFrame = value;
                    return true
                } 

                if (prop === 'src') {
                    // If the property being set is 'src'
                    target._src = value; // Set _src directly on the target
                    
                    if (value) {
                        target.loadImage(value); // Trigger the image loading
                    } else {
                        target.originalImage = undefined;
                        target.context.clearRect(0, 0, target.canvas.width, target.canvas.height);
                    }
                } else {
                    (target as any)[prop] = value;
                    target.updateFrame = true
                }
                return true; // Indicate that the set was successful
            }
        };

        // Return the proxy for the instance
        return new Proxy(this, handler);
    }


    loadImage(src: string) {
        const image = new Image()
        image.src = src
        image.onload = () => {
            if (!this.width) { this.width = image.width }
            if (!this.height) { this.height = image.height }
            // this.scale.x = this.width / image.width
            // this.scale.y = this.height / image.height
            this.originalImage = image
            this.updateFrame = true
        }
    }

    draw(context: CanvasRenderingContext2D) {
        if (!this.context || !this.canvas) {
            throw new Error("Canvas or context is not defined")
        }

        let x = this.x - this.originValue.x;
        let y = this.y - this.originValue.y;
        let width = this.width;
        let height = this.height;
        
        if (this.originalImage) {
            this.context.clearRect(0, 0, this.originalImage.width, this.originalImage.width)
            this.context.drawImage(this.originalImage, x, y, width, height)
        }
    }
}

export default DCImage