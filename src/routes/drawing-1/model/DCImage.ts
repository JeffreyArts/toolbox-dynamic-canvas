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
    type: string = "DCImage"
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

        // Make radius dynamic
        Object.defineProperty(this, "src", {
            get() {
                return this._src
            },
            set(value) {
                this._src = value
                if (value) {
                    this._src = value;  // Set src directly on the target
                    this.loadImage(value);  // Trigger the image loading
                } else {
                    this.originalImage = undefined;
                    this._src = value;
                    this.context.clearRect(0, 0, this.canvas.width, this.canvas.width)
                }
            }
        })
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

        // On image load error
        image.onerror = (error) => {
            throw new Error(`Failed to load image from source: ${src}`);
        };
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