<template>
    <div class="options-overview">
        <header class="title">
            <h1>Street Racer</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="1x1">
                <canvas ref="targetCanvas"></canvas>
            </div>
        </section>

        <aside class="sidebar">
        </aside>
    </div>
</template>

<script lang="ts">
import { isProxy, toRaw , defineComponent } from "vue";
import { DynamicCanvas } from "./model/DynamicCanvas";
import DCImage from "./model/DCImage";

export default defineComponent({
    components: {},
    data() {
        return {
            dynamicCanvas: undefined as DynamicCanvas | undefined,
            bg: undefined as DCImage | undefined,
            cigaretta: undefined as DCImage | undefined,
            keys: {} as Record<string, boolean>,
            car: {
                speed: 0,
                maxSpeed: 16,
                acceleration: 0.2,
                friction: 0.05,
                reverseSpeed: -2,
                turningSpeed: 3,
            },
        };
    },
    mounted() {
        const canvas = this.$refs["targetCanvas"] as HTMLCanvasElement;
        if (canvas) {
            this.dynamicCanvas = new DynamicCanvas(canvas, {
                width: 1080,
                height: 1920,
            });

            // Set background
            this.bg = new DCImage(this.dynamicCanvas.canvas, {
                x: 0,
                y: 0,
                width: 1080,
                height: 1920,
                origin: "top left",
                src: "/assets/street-racer/background.jpg",
            });
            this.dynamicCanvas.layers.push(this.bg);

            // Set player
            this.cigaretta = new DCImage(this.dynamicCanvas.canvas, {
                x: 700,
                y: 2820/2,
                scale: .75,
                angle: 184,
                origin: "center center",
                src: "/assets/street-racer/cigaretta.png",
            })
            
            console.log("cigaretta", this.cigaretta)
            this.dynamicCanvas.layers.push(this.cigaretta);

            // Add event listeners
            window.addEventListener("keydown", this.keydownEvent);
            window.addEventListener("keyup", this.keyupEvent);

            // Start game loop
            this.updateCar();
        }
    },
    beforeUnmount() {
        window.removeEventListener("keydown", this.keydownEvent);
        window.removeEventListener("keyup", this.keyupEvent);
    },
    methods: {
        keydownEvent(event: KeyboardEvent) {
            if (event.key.startsWith("Arrow")) {
                event.preventDefault()
            }
            this.keys[event.key] = true;
        },
        keyupEvent(event: KeyboardEvent) {
            if (event.key.startsWith("Arrow")) {
                event.preventDefault()
            }
            this.keys[event.key] = false;
        },
        updateCar() {
            if (!this.cigaretta) return;
            let { speed, maxSpeed, acceleration, friction, reverseSpeed, turningSpeed } = this.car;

            // Move forward
            if (this.keys["ArrowUp"]) {
                if (speed < maxSpeed) speed += acceleration;
            } else {
                // Apply friction
                if (speed > 0) speed -= friction;
                else if (speed < 0) speed += friction;
            }

            // Brake / Reverse
            if (this.keys["ArrowDown"]) {
                if (speed > 0) {
                    speed -= acceleration * 2; // Stronger brake
                } else if (speed > reverseSpeed) {
                    speed -= acceleration; // Slow reverse
                }
            }

            if (Math.round(speed*1000) == 0) {
                speed = 0;
            }

            // Turn left
            if (this.keys["ArrowLeft"] && Math.abs(speed) > 0.1) {
                this.cigaretta.angle -= turningSpeed * (speed / maxSpeed);
            }

            // Turn right
            if (this.keys["ArrowRight"] && Math.abs(speed) > 0.1) {
                this.cigaretta.angle += turningSpeed * (speed / maxSpeed);
            }

            // Convert angle to radians for movement
            const rad = ((this.cigaretta.angle+90) * Math.PI) / 180;
            const x = this.cigaretta.x + Math.cos(rad) * speed;
            const y = this.cigaretta.y + Math.sin(rad) * speed;

            if (x != this.cigaretta.x) {
                this.cigaretta.x = x;
            }
            if (y != this.cigaretta.y) {
                this.cigaretta.y = y;
            }

            // Store updated speed
            this.car.speed = speed;

            requestAnimationFrame(this.updateCar);
        },
    },
});
</script>

<style lang="scss" scoped>
.viewport-content canvas {
    max-width: 100%;
    max-height: 88vh;
}
</style>
