import { DCScale, DCOriginName, DynamicCanvas } from "./DynamicCanvas"

export interface DCBasisOptions {
    x?: number
    y?: number
    width?: number
    height?: number
    angle?: number
    scale?: Partial<DCScale>
    origin?: string
}

export abstract class DCBasis {
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    x: number
    y: number
    width: number
    height: number
    angle: number
    _angle: number
    scale: DCScale
    _scale: DCScale
    origin: string
    _origin: string
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

        this._scale = {x:1, y:1, ...options.scale}
        this.scale = {...this._scale}

        this._origin = options.origin || "center center" 
        this.origin = this._origin
        this.originValue = {x: 0, y: 0}
        this.setOrigin()


        if (canvas instanceof HTMLCanvasElement) {
            this.canvas = document.createElement("canvas")
            this.canvas.width = canvas.width
            this.canvas.height = canvas.height
            this.context = canvas.getContext("2d") as CanvasRenderingContext2D
        } else {
            this.canvas = document.createElement("canvas")
            this.canvas.width = canvas.canvas.width
            this.canvas.height = canvas.canvas.height
            this.context = canvas.context
        }

        // Make width dynamic
        Object.defineProperty(this, "width", {
            get() {
                return this.boundingBox.width
            },
            set(value) {
                this.boundingBox.width = value
                this.updateOrigin()
                this.setOrigin()
            }
        })
        // Make height dynamic
        Object.defineProperty(this, "height", {
            get() {
                return this.boundingBox.height
            },
            set(value) {
                this.boundingBox.height = value
                this.updateOrigin()
                this.setOrigin()
            }
        })

        // Make angle dynamic
        Object.defineProperty(this, "angle", {
            get() {
                return this._angle
            },
            set(value) {
                this._angle = value
            }
        })

        // Make scale dynamic
        Object.defineProperty(this, "scale", {
            get() {
                return this._scale
            },
            set(value) {
                console.log("Setting scale", value)
                if (typeof value === "object" && (value.x || value.y)) {
                    this._scale = {...this._scale, ...value}
                }
            }
        })
        
        Object.defineProperty(this, "origin", {
            get() {
                return this._origin
            },
            set(value) {
                this._origin = value
                this.setOrigin()
            }
        })
    }
    
    abstract draw(context: CanvasRenderingContext2D): void; // Subclasses must implement this
    
    _draw(context: CanvasRenderingContext2D) {
        if (!this.context || !this.canvas) {
            throw new Error("Canvas or context is not defined")
        }


        // Clear the internal context before drawing
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.rotateCanvas()
        this.scaleCanvas()

        // Do local stuff
        this.draw(this.context)

        // Draw the result from this.context onto the provided context
        context.drawImage(this.canvas, 0, 0);
    }

    rotateCanvas() {
        let x = this.x 
        let y = this.y

        this.context.setTransform(1, 0, 0, 1, 0, 0); // Resets the transformation matrix
        
        // Change the origin point for rotating
        this.context.translate(x, y);

        // Rotate to the new angle
        this.context.rotate(this._angle * Math.PI / 180);
        
        // Move the origin back (so rotation doesn't affect positioning)
        this.context.translate(-x, -y);
    }
    
    scaleCanvas() {
        let x = this.x;
        let y = this.y;

        // Reset transformations before applying new scaling
        this.context.setTransform(1, 0, 0, 1, 0, 0);

        // Move origin to the object's position
        this.context.translate(x, y);

        // Apply scaling
        this.context.scale(this.scale.x, this.scale.y);

        // Move origin back
        this.context.translate(-x, -y);
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