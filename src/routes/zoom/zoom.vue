<template>
    <div class="options-overview">
        <header class="title">
            <h1>Circle</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="1x1" >
                <canvas ref="targetCanvas"></canvas>
            </div>
            <footer class="viewport-datamodel">
                <pre>{{ circle }}</pre>
            </footer>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Canvas" >
                    <div class="option __isGroup">
                        <span>
                            <label for="options-width">Width</label>
                            <input type="number" size="10" id="options-width" v-model="options.width" />
                        </span>
                        <span>
                            <label for="options-height">Height</label>
                            <input type="number" size="10" id="options-height" v-model="options.height" />
                        </span>
                    </div>
                    <div class="option">
                        <span>
                            <label for="options-zoom">Zoom</label>
                            <input type="number" size="10" step=".1" id="options-zoom" v-model="options.zoom" />
                        </span>
                    </div>
                </div>
                <div class="option-group" name="General" >
                    <form class="option" @submit="resetOptions">
                        <label for="options-reset">Reset options</label>
                        <button class="button" id="options-reset">Reset</button>
                    </form>
                </div>
            </div>
        </aside>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import _ from "lodash"
import { DynamicCanvas, DCScale, DCGradient, DCStroke} from "./model/DynamicCanvas"
import DCCircle from "./model/DCCircle"


interface Options {
    width: number
    height: number,
    zoom: number,
}

export default defineComponent ({ 
    components: {},
    props: [],
    data() {
        return {
            options: {
                width: 400,
                height: 400,
                zoom: 1
            } as Options,
            lastTouchDistance: null as number | null,
            dynamicCanvas: undefined as DynamicCanvas | undefined,
            circle: undefined as DCCircle | undefined,
            ignoreOptionsUpdate: true,
        }
    },
    watch: {
        "options": {
            handler(){
                if (this.ignoreOptionsUpdate) {
                    return
                }
                
                let newOptions = {} as any
                const localStorageOptions = localStorage.getItem("options")
                if (localStorageOptions) {
                    newOptions = _.cloneDeep(JSON.parse(localStorageOptions))
                }
                _.forOwn(this.options, (value, key) => {
                    if (_.isArray(value)) {
                        // If the value is an array, copy it directly
                        newOptions[key] = [...value]
                    } else if (_.isObject(value)) {
                        if (!_.isObject(newOptions[key])) {
                            newOptions[key] = {}
                        }
                        // Recursively copy the object properties
                        _.forOwn(value, (v, k) => {
                            newOptions[key][k] = v
                        })
                    } else {
                        newOptions[key] = value
                    }
                })
                localStorage.setItem("options", JSON.stringify(newOptions))
            },
            deep: true
        },
        "options.width": {
            handler(val) {
                if (this.dynamicCanvas) {
                    this.dynamicCanvas.width = val
                }
            }
        },
        "options.height": {
            handler(val) {
                if (this.dynamicCanvas) {
                    this.dynamicCanvas.height = val
                }
            }
        },
        "options.zoom": {
            handler(val) {
                if (this.dynamicCanvas) {
                    this.dynamicCanvas.zoom = val
                }
            }
        },
    },
    mounted() {

        this.loadOptions()

        const canvas = this.$refs['targetCanvas'] as HTMLCanvasElement
        if (canvas) {

            // Mouse wheel zoom
            canvas.addEventListener("wheel", this.handleWheelZoom)

            // Touch zoom (pinch gesture)
            canvas.addEventListener("touchstart", this.handleTouchStart)
            canvas.addEventListener("touchmove", this.handleTouchMove)
            canvas.addEventListener("touchend", () => this.lastTouchDistance = null);


            this.dynamicCanvas = new DynamicCanvas(canvas, {
                width: this.options.width,
                height: this.options.height,
                zoom: this.options.zoom
            })


            const circle = new DCCircle(this.dynamicCanvas.canvas, {
                x: this.options.width / 2, 
                y: this.options.height/2, 
                diameter: Math.min(this.options.width, this.options.height)/2, 
                origin: "center center",
                fill: "#58f208",
                stroke: {color: "#333", width: 4},
            })


            this.dynamicCanvas.layers.push(circle)
        }
    },
    unmounted() {
        //
    },
    methods: {
        // Zoom event handlers
        handleWheelZoom(event) {
            event.preventDefault();

            const zoomSpeed = 0.1; // Adjust zoom sensitivity
            const scaleFactor = event.deltaY < 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
            this.updateZoom(scaleFactor, event.clientX, event.clientY);
        },
        updateZoom(scaleFactor, x, y) {
            const newZoom = Math.min(Math.max(this.options.zoom * scaleFactor, 0.1), 5);
            console.log("newZoom.scaleFactor", scaleFactor)
            // Update zoom level
            this.options.zoom = newZoom;
            
            console.log(`Zoom updated: ${this.options.zoom}`);
        },
        getTouchDistance(touches) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        },
        handleTouchMove(event) {
            if (event.touches.length === 2) {
                event.preventDefault();

                const newDistance = this.getTouchDistance(event.touches);
                if (this.lastTouchDistance) {
                    const scaleFactor = newDistance / this.lastTouchDistance;
                    this.updateZoom(scaleFactor, event.touches[0].clientX, event.touches[0].clientY);
                }
                this.lastTouchDistance = newDistance;
            }
        },
        handleTouchStart(event) {
            if (event.touches.length === 2) {
                this.lastTouchDistance = this.getTouchDistance(event.touches);
            }
        },





        // Normal methods
        loadOptions() {
            this.ignoreOptionsUpdate = true
            const optionsString = localStorage.getItem("options")
            if (optionsString) {
                const localOptions = JSON.parse(optionsString)
                _.forOwn(this.options, (value,key) => {
                    const typedKey = key as keyof Options
                    if (localOptions[typedKey]) {
                        this.options[typedKey] = localOptions[key]
                    }
                })
            }
            setTimeout(() => {
                this.ignoreOptionsUpdate = false
            })
        },
        resetOptions(e:Event) {
            e.preventDefault()
            this.options = {
                width: 400,
                height: 400,
                zoom: 1
            }
        }
    }
})
</script>


<style lang="scss" scoped>
.option.__isGroup {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    > span {
        display: inline-block;
        flex: 1;
    }
}
</style>