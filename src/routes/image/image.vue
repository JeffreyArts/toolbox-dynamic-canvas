<template>
    <div class="options-overview">
        <header class="title">
            <h1>Image</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="1x1" >
                <canvas ref="targetCanvas"></canvas>
            </div>
            <footer class="viewport-datamodel">
                <pre>{{ rectangle }}</pre>
            </footer>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Canvas" >
                    <div class="option">
                        <label for="options-width">Width</label>
                        <input type="number" id="options-width" v-model="options.width" />
                    </div>
                    <div class="option">
                        <label for="options-height">Height</label>
                        <input type="number" id="options-height" v-model="options.height" />
                    </div>
                </div>
                <div class="option-group" name="Rectangle" >
                    <!-- <div class="option">
                        <label for="options-rectangle-height">Height</label>
                        <input type="number" id="options-rectangle-height" v-model="options.rectangle.height" />
                    </div>
                    <div class="option">
                        <label for="options-rectangle-width">Width</label>
                        <input type="number" id="options-rectangle-width" v-model="options.rectangle.width" />
                    </div> -->
                    <div class="option">
                        <label for="options-rectangle-originX">Origin X <i class="info"><span class="info-icon">?</span><span class="info-details">Use left, center, right or a number </span></i></label>
                        <input type="string" id="options-rectangle-originX" v-model="options.rectangle.originX" />
                    </div>
                    <div class="option">
                        <label for="options-rectangle-originY">Origin Y <i class="info"><span class="info-icon">?</span><span class="info-details">Use top, center, bottom or a number </span></i></label>
                        <input type="string" id="options-rectangle-originY" v-model="options.rectangle.originY" />
                    </div>
                    <div class="option">
                        <label for="options-rectangle-stroke-alignment">Stroke Alignment</label>
                        <select v-model="options.rectangle.stroke.alignment">
                            <option value="inner">Inner</option>
                            <option value="center">Center</option>
                            <option value="outer">Outer</option>
                        </select>
                    </div>
                    <div class="option">
                        <label for="options-rectangle-stroke-width">Stroke width</label>
                        <input type="number" id="options-rectangle-stroke-width" v-model="options.rectangle.stroke.width" />
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
import { DynamicCanvas, DCScale, DCStroke} from "./model/DynamicCanvas"
import DCRectangle from "./model/DCRectangle"
import {DCBasis} from "./model/DCBasis"


interface Options {
    width: number
    height: number,
    rectangle: {
        width: number
        height: number
        angle: number
        fill: string
        scale: DCScale,
        stroke: DCStroke
        originX: string | number
        originY: string | number
    }
}

export default defineComponent ({ 
    components: {},
    props: [],
    data() {
        return {
            options: {
                width: 400,
                height: 400,
                rectangle: {
                    x: 0,
                    y: 0,
                    width: 50,
                    height: 50,
                    angle: 0,
                    scale: {x: 1, y: 1},
                    fill: "#58f208",
                    stroke: {
                        color: "#f09",
                        width: 100,
                        alignment: "inner"
                    },
                    originX: "0",
                    originY: "center"
                }
            } as Options,
            dynamicCanvas: undefined as DynamicCanvas | undefined,
            rectangle: undefined as DCRectangle | undefined,
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
                if (this.dynamicCanvas && this.rectangle) {
                    this.dynamicCanvas.width = val
                    this.rectangle.x = val / 2
                    this.rectangle.updateOrigin()
                }
            }
        },
        "options.height": {
            handler(val) {
                if (this.dynamicCanvas && this.rectangle) {
                    this.dynamicCanvas.height = val
                    this.rectangle.y = val / 2
                    this.rectangle.updateOrigin()
                }
            }
        },
        "options.rectangle": {
            handler(val) {
                if (this.dynamicCanvas && this.rectangle) {
                    this.rectangle.width = val.width
                    this.rectangle.height = val.height
                    this.rectangle.fill = val.fill
                    this.rectangle.x = this.dynamicCanvas.width / 2
                    this.rectangle.y = this.dynamicCanvas.height / 2
                    this.rectangle.stroke = val.stroke
                    this.rectangle.angle = val.angle
                    console.log("val.scale",val.scale,val)
                    this.rectangle.scale = val.scale

                    if ((!isNaN(parseInt(val.originX)) || ["center", "top", "bottom", "left", "right"].includes(val.originX)) &&
                        (!isNaN(parseInt(val.originY)) || ["center", "top", "bottom", "left", "right"].includes(val.originY))) {
                        this.rectangle.origin = `${val.originX} ${val.originY}`
                    }
                }
            },
            deep: true
        }
    },
    mounted() {

        this.loadOptions()

        const canvas = this.$refs['targetCanvas'] as HTMLCanvasElement
        if (canvas) {
            this.dynamicCanvas = new DynamicCanvas(canvas, {
                width: this.options.width,
                height: this.options.height
            })

            this.rectangle = new DCRectangle(this.dynamicCanvas.canvas, {
                x: 0, 
                y: 0, 
                angle: this.options.rectangle.angle,
                width: this.dynamicCanvas.width, 
                height: this.dynamicCanvas.height, 
                scale: this.options.rectangle.scale,
                origin: "center center",
                fill: this.options.rectangle.fill,
                stroke: this.options.rectangle.stroke
            })

            console.log("Rectangle", this.rectangle)

            this.dynamicCanvas.elements.push(this.rectangle)
        }
    },
    unmounted() {
        //
    },
    methods: {
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
                rectangle: {
                    width: 16,
                    height: 16,
                    scale: {x:1 , y: 1},
                    angle: 0,
                    fill: "#58f208",
                    stroke: {
                        color: "#f09",
                        width: 8,
                        alignment: "outer"
                    },
                    originX: "center",
                    originY: "center"
                }
            }
        },
    }
})
</script>


<style lang="scss" scoped>
</style>