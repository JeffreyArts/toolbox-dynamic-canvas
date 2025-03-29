import { DCScale, DCStroke, DCOriginName, DynamicCanvas } from "./DynamicCanvas"
import { DCBasis } from "./DCBasis"

export interface DCRectangleOptions {
    x?: number
    y?: number
    width?: number
    height?: number
    fill?: string
    angle?: number
    scale?: Partial<DCScale>
    stroke?: Partial<DCStroke>
    origin?: string
}

export class DCRectangle extends DCBasis {
    fill: string
    stroke: DCStroke

    constructor(canvas: HTMLCanvasElement | DynamicCanvas, options: DCRectangleOptions) {
        super(canvas, options)
        
        this.fill = options.fill || "transparent"
        this.stroke = { width: 0, color: "transparent", alignment: "center", ...options.stroke}

    }

    draw(context: CanvasRenderingContext2D) {
        if (!this.context || !this.canvas) {
            throw new Error("Canvas or context is not defined")
        }

        let x = this.x - this.originValue.x
        let y = this.y - this.originValue.y
        let width = this.width
        let height = this.height

        this.context.fillStyle = this.fill
        this.context.fillRect(x, y, width, height)

        if (this.stroke.width > 0) {
            this.context.strokeStyle = this.stroke.color
            this.context.lineWidth = this.stroke.width

            if (this.stroke.alignment === "outer") {
                x -= this.stroke.width / 2
                y -= this.stroke.width / 2
                width += this.stroke.width
                height += this.stroke.width
            } else if (this.stroke.alignment === "inner") {
                x += this.stroke.width / 2
                y += this.stroke.width / 2
                width -= this.stroke.width
                height -= this.stroke.width
            }

            this.context.strokeRect(x, y, width, height)
        }

        // Draw the result from this.context onto the provided context
        context.drawImage(this.canvas, 0, 0)
    }
}

export default DCRectangle