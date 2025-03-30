import { DCBasis, DCBasisOptions } from "./DCBasis"
import { DynamicCanvas } from "./DynamicCanvas"
import { DCStroke, DCGradient, DCPosition} from "./DynamicCanvas"

type DCBezierHandle = {
    x?: number;
    y?: number;
    angle?: number;
    length?: number;
};

export type DCBezierPoint = {
    x: number;
    y: number;
    handle?: {
        in?: DCBezierHandle;
        out?: DCBezierHandle;
        mirror?: boolean;
    };
};

export interface DCLineOptions extends DCBasisOptions {
    points: Array<DCBezierPoint>;
    closed: boolean;
    fill: string | DCGradient;
    stroke: DCStroke;
}

export class DCLine extends DCBasis {
    type = "DCLine"
    points = [] as DCBezierPoint[]
    private _points: DCBezierPoint[] = []
    closed = false
    stroke: DCStroke = { color: "#000", width: 1, alignment: "inner" }

    constructor(canvas: HTMLCanvasElement | DynamicCanvas, options: DCLineOptions) {
        super(canvas, options)
        
        this.closed = typeof options.closed === "boolean" ? options.closed : false
        this.stroke = options.stroke ? { ...options.stroke } : { color: "#000", width: 1, alignment: "inner" }
        
        // Initialiseer eerst de private points array
        this._points = options.points ? options.points.map(point => this._createReactivePoint(point)) : []
        
        // Maak een proxy voor de array operaties
        const pointsProxy = new Proxy(this._points, {
            get: (target, prop) => {
                const value = target[prop as keyof typeof target]
                if (prop === "length") {
                    return target.length
                }
                
                return value
            },
            set: (target, prop, value) => {
                if (prop === "length") {
                    target.length = value
                    this.updateFrame = true
                    return true
                }
                
                // Als het een numerieke index is, maak het punt reactief
                if (typeof prop === "string" && !isNaN(parseInt(prop, 10))) {
                    target[parseInt(prop, 10)] = this._createReactivePoint(value)
                } else {
                    Reflect.set(target, prop, value)
                }
                
                this.updateFrame = true
                return true
            }
        })
        
        // Maak de points property reactief
        Object.defineProperty(this, "points", {
            get: () => pointsProxy,
            set: (value: DCBezierPoint[]) => {
                this._points = value.map(point => this._createReactivePoint(point))
                this.updateFrame = true
            }
        })
    }

    private _createReactivePoint(point: DCBezierPoint): DCBezierPoint & { _x: number; _y: number } {
        const reactivePoint = { ...point } as DCBezierPoint & { _x: number; _y: number }
        const that = this // Bewaar referentie naar de DCLine instantie
        
        Object.defineProperty(reactivePoint, "x", {
            get: () => {
                return reactivePoint._x
            },
            set: (value: number) => {
                reactivePoint._x = value
                that.updateFrame = true
            }
        })

        Object.defineProperty(reactivePoint, "y", {
            get: () => {
                return reactivePoint._y
            },
            set: (value: number) => {
                reactivePoint._y = value
                that.updateFrame = true
            }
        })

        // Initialiseer de private properties
        reactivePoint._x = point.x
        reactivePoint._y = point.y

        return reactivePoint
    }

    private _resolveHandle(anchor: DCPosition, handle?: DCBezierHandle): DCPosition {
        if (!handle) {
            return { ...anchor }
        }

        if (handle.x !== undefined && handle.y !== undefined) {
            return {
                x: handle.x,
                y: handle.y
            }
        } else if (handle.angle !== undefined && handle.length !== undefined) {
            return {
                x: anchor.x + Math.cos(handle.angle) * handle.length,
                y: anchor.y + Math.sin(handle.angle) * handle.length,
            }
        }
        
        return { ...anchor }
    }


    private _getPathPoints(): Array<{ anchor: DCPosition; handleIn: DCPosition; handleOut: DCPosition; }> {
        return this.points.map((bezierPoint) => {
            const handleIn = bezierPoint.handle?.in
            const handleOut = bezierPoint.handle?.out
            return {
                anchor: { x: bezierPoint.x, y: bezierPoint.y },
                handleIn: this._resolveHandle({ x: bezierPoint.x, y: bezierPoint.y }, handleIn),
                handleOut: this._resolveHandle({ x: bezierPoint.x, y: bezierPoint.y }, handleOut),
            }
        })
    }

    draw(context: CanvasRenderingContext2D) {
        if (!this.context || !this.canvas) {
            throw new Error("Canvas or context is not defined")
        }

        const strokeWidth = this.stroke?.width || 0
        const pathPoints = this._getPathPoints()

        this.context.beginPath()

        if (pathPoints.length > 0) {
            const first = pathPoints[0]
            this.context.moveTo(first.anchor.x, first.anchor.y)

            for (let i = 1; i < pathPoints.length; i++) {
                const prev = pathPoints[i - 1]
                const curr = pathPoints[i]
                this.context.bezierCurveTo(
                    prev.handleOut.x, prev.handleOut.y,
                    curr.handleIn.x, curr.handleIn.y,
                    curr.anchor.x, curr.anchor.y
                )
            }

            const last = pathPoints[pathPoints.length - 1]
            if (this.closed) {
                this.context.bezierCurveTo(
                    last.handleOut.x, last.handleOut.y,
                    first.handleIn.x, first.handleIn.y,
                    first.anchor.x, first.anchor.y
                )
                this.context.closePath()
            }
        }

        this.processFillStyle()
        this.context.fill()

        if (strokeWidth > 0 && this.stroke) {
            this.context.lineWidth = strokeWidth
            this.context.strokeStyle = this.stroke.color
            this.context.stroke()
        }

        context.drawImage(this.canvas, 0, 0)
    }
}

export default DCLine