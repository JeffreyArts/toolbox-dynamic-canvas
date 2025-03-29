<template>
    <div class="options-overview">
        <header class="title">
            <h1>Zoom</h1>
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
                            <input type="number" size="10" step=".1" id="options-zoom" v-if="typeof options.zoom == 'number'" v-model="options.zoom"/>
                            <input type="number" size="10" step=".1" id="options-zoom" v-if="typeof options.zoom == 'object'" v-model="options.zoom.level"/>
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
import DCUZoom from "./model/DCUZoom"


interface Options {
    width: number
    height: number,
    zoom: number | DCUZoom,
}

export default defineComponent ({ 
    components: {},
    props: [],
    data() {
        return {
            options: {
                width: 400,
                height: 400,
                zoom: 1 // Will be replaced by DCUZoom when canvas is created
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

        const canvas = this.$refs["targetCanvas"] as HTMLCanvasElement
        if (canvas) {
            const zoomObject = new DCUZoom(canvas, {min: 0, max: 10})
            this.options.zoom = zoomObject
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
                zoom: this.dynamicCanvas ? new DCUZoom(this.dynamicCanvas.canvas, {}) : 1
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