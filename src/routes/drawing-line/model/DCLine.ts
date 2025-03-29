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
    points = [] as DCBezierPoint[]
    closed = false
    fill = "transparent" as string | DCGradient
    stroke: DCStroke = { color: "#000", width: 1, alignment: "inner" }

    constructor(canvas: HTMLCanvasElement | DynamicCanvas, options: DCLineOptions) {
        super(canvas, options)
        Object.assign(this, options)
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
        
        return {
            ...anchor
        }
    }

    private _watchNested < T extends object > (target: T, onChange: () => void): void {
        for (const key in target) {
            const value = target[key]
            if (typeof value === "object" && value !== null) {
                this._watchNested(value as object, onChange)
            }

            let internal = value
            Object.defineProperty(target, key, {
                get() {
                    return internal
                },
                set(newValue) {
                    internal = newValue
                    onChange()
                },
                configurable: true,
                enumerable: true
            })
        }
    }

    private _makeReactive() {
        const triggerRedraw = () => {
            this.updateFrame = true
            console.log("redraw")
        }

        const makePointReactive = (point: DCBezierPoint) => {
            this._watchNested(point, triggerRedraw)
            if (point.handle?.in) {
                this._watchNested(point.handle.in, triggerRedraw)
            }
            if (point.handle?.out) {
                this._watchNested(point.handle.out, triggerRedraw)
            }
            return point
        }

        this.points = new Proxy(this.points, {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver)
        
                if (typeof value === "function") {
                    return (...args: any[]) => {
                        const prevLength = target.length
                        const wrappedArgs = args.map(makePointReactive)
                        const result = value.apply(target, wrappedArgs)
                        if (target.length !== prevLength) {
                            triggerRedraw()
                        }
                        return result
                    }
                }
        
                return value
            },
        
            set(target, prop, value, receiver) {
                const isIndex = !isNaN(Number(prop))
                const isLengthChange = prop === "length" || (isIndex && Number(prop) >= target.length)
        
                const result = Reflect.set(target, prop, makePointReactive(value), receiver)
        
                if (isLengthChange) {
                    triggerRedraw()
                }
        
                return result
            }
        })
        

        // this.points = new Proxy(this.points, {
        //     get: (target, prop, receiver) => {
        //         const value = Reflect.get(target, prop, receiver)
        //         if (["push", "unshift", "splice"].includes(String(prop))) {
        //             return (...args: any[]) => {
        //                 const wrapped = args.map(makePointReactive)
        //                 const result = (value as Function).apply(target, wrapped)
        //                 triggerRedraw()
        //                 return result
        //             }
        //         }
        //         return value
        //     },
        //     set: (target, prop, value, receiver) => {
        //         if (!isNaN(Number(prop))) {
        //             value = makePointReactive(value)
        //         }
        //         const result = Reflect.set(target, prop, value, receiver)
        //         triggerRedraw()
        //         return result
        //     }
        // })

        this.points.forEach(makePointReactive)
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

            if (this.closed) {
                const last = pathPoints[pathPoints.length - 1]
                const first = pathPoints[0]
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