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
    // context: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement | DynamicCanvas, options: DCImageOptions) {
        super(canvas, options);
        this.src = options.src || "";
        if (this.src) {
            this.loadImage(this.src);
        }        

        // Create a Proxy to handle changes dynamically
        return new Proxy(this, {
            get(target, prop) {
                if (prop === "src") return target[prop];  // Direct access to src
                return Reflect.get(target, prop);  // Reflect for other properties
            },
            set(target, prop, value) {
                if (prop === "src" && target[prop] !== value) {
                    if (value) {
                        target[prop] = value;  // Set src directly on the target
                        target.loadImage(value);  // Trigger the image loading
                    } else {
                        target.originalImage = undefined;
                        target[prop] = value;
                        target.context.clearRect(0, 0, target.canvas.width, target.canvas.width)
                    }
                    return true;
                } 
                
                return Reflect.set(target, prop, value);
            }
        });
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