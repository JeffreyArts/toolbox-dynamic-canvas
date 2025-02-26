export interface DCUZoomOptions {
    zoom?: number
    min?: number,
    max?:number
    speed?: number
}


export class DCUZoom {
    targetCanvas: HTMLCanvasElement
    lastTouchDistance: number | undefined
    zoom: number
    zoomRange: {min: number, max:number}
    zoomSpeed: number

    constructor(canvas: HTMLCanvasElement, options?: DCUZoomOptions) {
        this.targetCanvas = canvas
        if (!options) {
            options = {}
        }
        this.zoom = options.zoom || 1
        this.zoomSpeed = options.speed || 0.1
        this.zoomRange = {min: .1, max:10}
        if (options.min) { this.zoomRange.min = options.min }
        if (options.max) { this.zoomRange.max = options.max }

        // Mouse wheel zoom
        canvas.addEventListener("wheel", this.wheelEvent.bind(this))

        // Touch zoom (pinch gesture.bind(this))
        canvas.addEventListener("touchstart", this.touchstartEvent.bind(this))
        canvas.addEventListener("touchmove", this.touchmoveEvent.bind(this))
        canvas.addEventListener("touchend", () => this.lastTouchDistance = undefined)

        
        // // Create a Proxy to handle changes dynamically
        // return new Proxy(this, {
        //     get(target, prop) {
        //         if (prop === "zoom") {
        //             return target[prop];  // Direct access to src
        //         }
        //         return Reflect.get(target, prop);  // Reflect for other properties
        //     },
        //     set(target, prop, value) {
        //         // if (prop === "size") {
        //         //     target.width = value;
        //         //     target.height = value;
        //         //     return true;
        //         // } 
                
        //         return Reflect.set(target, prop, value);
        //     }
        // });
    }

    wheelEvent(event: WheelEvent) {
        event.preventDefault();

        const scaleFactor = event.deltaY < 0 ? 1 + this.zoomSpeed : 1 - this.zoomSpeed;
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

    updateZoom(scaleFactor:number, x:number, y:number) {
        const newZoom = Math.min(Math.max(this.zoom * scaleFactor, 0.1), 5);
        // Update zoom level
        this.zoom = newZoom;
    }
    getTouchDistance(touches: TouchList) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

export default DCUZoom