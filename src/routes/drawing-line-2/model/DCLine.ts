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
    closed = false
    stroke: DCStroke = { color: "#000", width: 1, alignment: "inner" }

    constructor(canvas: HTMLCanvasElement | DynamicCanvas, options: DCLineOptions) {
        super(canvas, options)
        
        this.closed = typeof options.closed === "boolean" ? options.closed : false
        this.points = options.points ? [...options.points] : []
        this.stroke = options.stroke ? { ...options.stroke } : { color: "#000", width: 1, alignment: "inner" }
        this._makeReactive()
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

    private _makeReactive() {
        const triggerRedraw = () => {
            this.updateFrame = true
            console.log("redraw")
        }
        const resolveHandle = this._resolveHandle
        const previousHandleStates = new WeakMap<DCBezierHandle, { angle?: number; length?: number, x?: number, y?: number }>()

        this.points = new Proxy(this.points, {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver)
                
                if (typeof prop === "string" && !isNaN(parseInt(prop, 10))) {
                    console.log("number", prop, value)
                    if (value.handle?.in) {
                        const handle = value.handle.in
                        const previousState = previousHandleStates.get(handle) || {}
                        
                        if (handle.angle !== undefined && handle.angle !== previousState.angle) {
                            const angle = handle.angle * Math.PI / 180
                            handle.x = value.x + Math.cos(angle) * handle.length
                            handle.y = value.y + Math.sin(angle) * handle.length
                            previousState.angle = handle.angle
                        } 
                        if (handle.length !== undefined && handle.length !== previousState.length) {
                            const angle = (handle.angle || 0) * Math.PI / 180
                            handle.x = value.x + Math.cos(angle) * handle.length
                            handle.y = value.y + Math.sin(angle) * handle.length
                            previousState.length = handle.length
                        } else if (handle.x !== undefined && handle.x !== previousState.x) {
                            handle.x = value.x
                            previousState.x = handle.x
                        } else if (handle.y !== undefined && handle.y !== previousState.y) {
                            handle.y = value.y
                            previousState.y = handle.y
                        }
                        previousHandleStates.set(handle, previousState)
                    }
                    triggerRedraw()
                    return value
                } else if (typeof value === "function") {
                    return (...args: any[]) => {
                        const prevLength = target.length
                        const result = value.apply(target, args)
                        if (target.length !== prevLength) {
                            triggerRedraw()
                        }
                        return result
                    }
                }
        
                return value
            },
        
            set(target, prop, value, receiver) {
                const result = Reflect.set(target, prop, value, receiver)
                triggerRedraw()
                return result
            }
        })
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