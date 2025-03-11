import { DCScale, DCStroke, DCGradient, DynamicCanvas } from "./DynamicCanvas"
import { DCBasis } from "./DCBasis"

export interface DCEllipseOptions {
    x?: number
    y?: number
    width?: number
    height?: number
    fill?: string | DCGradient
    angle?: number
    scale?: Partial<DCScale>
    stroke?: Partial<DCStroke>
    origin?: string
}

export class DCEllipse extends DCBasis {
    type: string = "DCEllipse"
    fill: string | DCGradient
    stroke: DCStroke

    constructor(canvas: HTMLCanvasElement | DynamicCanvas, options: DCEllipseOptions) {
        super(canvas, options);
        
        this.fill = options.fill || "transparent";
        this.stroke = { width: 0, color: "transparent", alignment: "center", ...options.stroke };
    }

    draw(context: CanvasRenderingContext2D) {
        if (!this.context || !this.canvas) {
            throw new Error("Canvas or context is not defined");
        }
        
        let x = this.x - this.originValue.x;
        let y = this.y - this.originValue.y;
        let width = this.width / 2;
        let height = this.height / 2;
        let strokeWidth = this.stroke?.width || 0;
    
        this.context.beginPath();
    
        // Adjust radii for stroke alignment
        let radiusX = width;
        let radiusY = height;
    
        if (strokeWidth > 0) {
            if (this.stroke.alignment === "outer") {
                radiusX += strokeWidth / 2;
                radiusY += strokeWidth / 2;
            } else if (this.stroke.alignment === "inner") {
                radiusX -= strokeWidth / 2;
                radiusY -= strokeWidth / 2;
            }
        }
    
        // Draw the ellipse
        this.context.ellipse(x + width, y + height, radiusX, radiusY, 0, 0, Math.PI * 2);
       
        this.processFillStyle()
        

        this.context.fill();
    
        // Apply stroke
        if (strokeWidth > 0) {
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = this.stroke.color;
            this.context.stroke();
        }
    
        // Draw the result onto the provided context
        context.drawImage(this.canvas, 0, 0);
    }    
}

export default DCEllipse