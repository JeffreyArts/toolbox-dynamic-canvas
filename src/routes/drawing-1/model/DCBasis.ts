import { DCScale, DCFlip, DCOriginName, DCGradient, DynamicCanvas } from "./DynamicCanvas"

export interface DCBasisOptions {
    x?: number
    y?: number
    width?: number
    height?: number
    angle?: number
    scale?: Partial<DCScale> | number
    flip?: Partial<DCFlip>
    origin?: string
}

export abstract class DCBasis {
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    type: string = "DCBasis"
    x: number
    y: number
    width: number
    height: number
    fill: string | DCGradient
    angle: number
    _angle: number
    scale: DCScale
    _scale: DCScale
    origin: string
    _origin: string
    flip: DCFlip
    _flip: DCFlip
    drawCycle: number
    updateFrame: boolean
    originValue: {
        x: number
        y: number
    }
    boundingBox: {
        width: number
        height: number
    }

    constructor(canvas: HTMLCanvasElement | DynamicCanvas, options: DCBasisOptions) {
        this.x = typeof options.x === "number" ? options.x : 0
        this.y = typeof options.y === "number" ? options.y : 0
        
        this.width = options.width || 0
        this.height = options.height || 0
        this.boundingBox = { width: this.width, height: this.height }
        
        this._angle = options.angle || 0
        this.angle = this._angle
        this._scale = {x:1, y:1}
        if (typeof options.scale == "object") {
            this._scale = {...this._scale, ...options.scale}
        } else if (typeof options.scale == "number") {
            this._scale = {...this._scale, x: options.scale, y:options.scale}
        }

        this.scale = {...this._scale}

        this._origin = options.origin || "center center" 
        this.origin = this._origin
        this.originValue = {x: 0, y: 0}
        this.setOrigin()
        
        this.fill = "transparent"

        this._flip = {
            horizontal: typeof options.flip?.horizontal === "boolean" ?  options.flip.horizontal : false,
            vertical: typeof options.flip?.vertical === "boolean" ?  options.flip.vertical : false
        }
        this.flip = this._flip

        this.canvas = document.createElement("canvas")

        if (canvas instanceof HTMLCanvasElement) {
            this.canvas.width = canvas.width
            this.canvas.height = canvas.height
        } else {
            this.canvas.width = canvas.canvas.width
            this.canvas.height = canvas.canvas.height
        }

        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D
        this.drawCycle      = 0
        this.updateFrame    = true

        // This handler makes sure that whenever a property changes, the frame is updated (note: this should be better tested with changes within objects like the scale object)
        const handler = {
            get(target: DCBasis, prop: keyof DCBasis) {
                if (prop === "width") {
                    return target.boundingBox.width;
                } else if (prop === "height") {
                    return target.boundingBox.height;
                } else if (prop === "angle") {
                    return target._angle;
                } else if (prop === "scale") {
                    return target._scale;
                } else if (prop === "origin") {
                    return target._origin;
                } else if (prop === "flip") {
                    return target._flip;
                }
                return target[prop];
            },
            set(target: DCBasis, prop: keyof DCBasis, value: any) {
                // Prevent infinite loop
                if (prop === "drawCycle") {
                    return true
                }
                
                // Prevent infinite loop
                if (prop === "updateFrame") {
                    target.updateFrame = value;
                    return true
                } 
                
                // Prop watchers
                if (prop === "width") {
                    target.boundingBox.width = value;
                    target.updateOrigin();
                    target.setOrigin();
                    target.updateFrame = true;
                } else if (prop === "height") {
                    target.boundingBox.height = value;
                    target.updateOrigin();
                    target.setOrigin();
                    target.updateFrame = true;
                } else if (prop === "angle") {
                    target._angle = value;
                    target.updateFrame = true;
                } else if (prop === "scale") {
                    if (typeof value === "object" && (value.x || value.y)) {
                        target._scale = {...target._scale, ...value};
                    } else if (typeof value === "number") {
                        target._scale = {x: value, y: value};
                    }
                    target.updateFrame = true;
                } else if (prop === "origin") {
                    target._origin = value;
                    target.setOrigin();
                    target.updateFrame = true;
                } else if (prop === "flip") {
                    target._flip = value;
                    target.updateFrame = true;
                } else {
                    (target as any)[prop] = value;
                    target.updateFrame = true;
                }
                return true;
            }
        };
        return new Proxy(this, handler);
    }
    
    abstract draw(context: CanvasRenderingContext2D): void; // Subclasses must implement this
    
    _draw(parentContext: CanvasRenderingContext2D) {
        
        if (!this.updateFrame) {
            return this.canvas
        }
        if (!this.context || !this.canvas) {
            throw new Error("Canvas or context is not defined")
        }

        // Clear the internal context before drawing
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        // Using the addition of one, makes sure that the lines that sometimes appear on the edges of the canvas are being cleared for sure
        this.context.clearRect(-1, -1, this.canvas.width+1, this.canvas.height+1);

        this.rotateCanvas()
        this.scaleCanvas()

        this.draw(this.context)
        this.drawCycle++
        
        // Only draw frame once
        this.updateFrame = false

        // Return canvas to be drawn by DynamicCanvas
        return this.canvas
    }

    rotateCanvas() {
        let x = this.x 
        let y = this.y
        
        // Change the origin point for rotating
        this.context.translate(x, y);

        // Rotate to the new angle
        this.context.rotate(this.angle * Math.PI / 180);
        
        // Move the origin back (so rotation doesn't affect positioning)
        this.context.translate(-x, -y);
    }
    
    scaleCanvas() {
        let x = this.x;
        let y = this.y;
        let scaleX = this.flip.horizontal ? -this.scale.x : this.scale.x;
        let scaleY = this.flip.vertical ? -this.scale.y : this.scale.y;


        // Move origin to the object's position
        this.context.translate(x, y);

        // Apply scaling
        this.context.scale(scaleX, scaleY);

        // Move origin back
        this.context.translate(-x, -y);
    }
    
    processFillStyle() {
        if (typeof this.fill === "object") {
            let gradient

            if (this.fill.type === "linear") { 
                let angle = (this.fill.angle || 0) * (Math.PI / 180); // Convert degrees to radians
        
                // Adjust x and y based on the origin
                const xBase = this.x - this.originValue.x + this.width / 2;  // Move to center
                const yBase = this.y - this.originValue.y + this.height / 2; // Move to center
        
                // Calculate gradient start and end points based on the center
                const halfDiagonal = Math.max(this.width, this.height); // Extend for full coverage
        
                const x1 = xBase - (halfDiagonal / 2) * Math.cos(angle);
                const y1 = yBase - (halfDiagonal / 2) * Math.sin(angle);
                const x2 = xBase + (halfDiagonal / 2) * Math.cos(angle);
                const y2 = yBase + (halfDiagonal / 2) * Math.sin(angle);
        
                gradient = this.context.createLinearGradient(x1, y1, x2, y2);
        
            } else if (this.fill.type === "radial") {
                // Get center point of the shape
                const xCenter = this.x - this.originValue.x + this.width / 2;
                const yCenter = this.y - this.originValue.y + this.height / 2;
        
                // Define radii
                const r0 = 0; // Start with a tiny inner radius
                const r1 = Math.max(this.width, this.height) / 2; // Outer radius to cover entire shape
                gradient = this.context.createRadialGradient(xCenter, yCenter, r0, xCenter, yCenter, r1);
            }
        
            // Apply colors to the gradient
            if (gradient && this.fill.colors) {
                let gradientColors = this.fill.colors
                this.fill.colors.forEach((color, index) => {
                    if (typeof color === "string") {
                        gradient.addColorStop(index / (gradientColors.length - 1), color);
                    } else {
                        gradient.addColorStop(color.offset, color.color);
                    }
                });
                this.context.fillStyle = gradient;
            }
        } else if (this.fill) {
            this.context.fillStyle = this.fill;
        } else {
            this.context.fillStyle = "transparent";
        }
    }

    setOriginParser(name: DCOriginName, pos: number) {
        if (name.toLowerCase() === "center") {
            if (pos === 0) {
                this.originValue.x = this.boundingBox.width / 2
            } else {
                this.originValue.y = this.boundingBox.height / 2
            }
        }
        
        if (name.toLowerCase() === "top") {
            this.originValue.y = 0
        }
        if (name.toLowerCase() === "bottom") {
            this.originValue.y = this.boundingBox.height
        }
        
        if (name.toLowerCase() === "left") {
            this.originValue.x = 0
        }
        
        if (name.toLowerCase() === "right") {
            this.originValue.x = this.boundingBox.width
        }
    }

    updateOrigin() {
        const origin = this._origin.split(" ")
        let res = ""
        origin.forEach((v,k) => {
            if (typeof v === "number") {
                if (k == 0) {
                    res += this.width/2
                } else {
                    res += this.height/2
                }
            } else {
                res += v
            }
            res += " "
        })

        if (res.length > 0) {
            this._origin = res.substring(0, res.length - 1)
        }
        
        return this._origin
    }

    setOrigin() {
        const origin = this._origin.split(" ")
        origin.forEach((v,k) => {
            if (!isNaN(parseInt(v, 10))) {
                if (k == 0) {
                    this.originValue.x = parseInt(v, 10)
                } else {
                    this.originValue.y = parseInt(v, 10)
                }
            } else if (v.length == 0) {
                if (k == 0) {
                    this.originValue.x = parseInt(v, 10)
                } else {
                    this.originValue.y = parseInt(v, 10)
                }
            } else if (typeof v == "string") {
                const originValue = v.trim() as DCOriginName
                if (!["center", "top", "bottom", "left", "right"].includes(originValue)) {
                    throw new Error("Invalid origin string")
                }
                
                this.setOriginParser(originValue, k)
            }
        })
        
        return this._origin
    }
}

export default DCBasis