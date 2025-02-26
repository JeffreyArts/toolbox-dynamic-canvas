export interface DCUZoomOptions {
    zoom?: number
    min?: number,
    max?:number
    speed?: number
}


export class DCUZoom {
    targetCanvas: HTMLCanvasElement
    lastTouchDistance: number | undefined
    level: number
    range: {min: number, max:number}
    speed: number

    constructor(canvas: HTMLCanvasElement, options?: DCUZoomOptions) {
        this.targetCanvas = canvas
        if (!options) {
            options = {}
        }
        this.level = options.zoom || 1
        this.speed = options.speed || 0.1
        this.range = {min: .1, max:10}
        if (options.min) { this.range.min = options.min }
        if (options.max) { this.range.max = options.max }

        // Mouse wheel zoom
        canvas.addEventListener("wheel", this.wheelEvent.bind(this))

        // Touch zoom (pinch gesture.bind(this))
        canvas.addEventListener("touchstart", this.touchstartEvent.bind(this))
        canvas.addEventListener("touchmove", this.touchmoveEvent.bind(this))
        canvas.addEventListener("touchend", () => this.lastTouchDistance = undefined)
    }

    // Events
    wheelEvent(event: WheelEvent) {
        event.preventDefault();

        const scaleFactor = event.deltaY < 0 ? 1 + this.speed : 1 - this.speed;
        this.updateZoom(scaleFactor, event.clientX, event.clientY);
    }
    touchstartEvent(event: TouchEvent) {
        if (event.touches.length === 2) {
            this.lastTouchDistance = this.getTouchDistance(event.touches);
        }
    }
    touchmoveEvent(event: TouchEvent) {
        if (event.touches.length === 2) {
            event.preventDefault();

            const newDistance = this.getTouchDistance(event.touches);
            if (this.lastTouchDistance) {
                const scaleFactor = newDistance / this.lastTouchDistance;
                this.updateZoom(scaleFactor, event.touches[0].clientX, event.touches[0].clientY);
            }
            this.lastTouchDistance = newDistance;
        }
    }

    // Actions
    updateZoom(scaleFactor:number, x:number, y:number) {
        this.level = Math.min(Math.max(this.level * scaleFactor, 0.1), 5);
    }

    getTouchDistance(touches: TouchList) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

export default DCUZoom