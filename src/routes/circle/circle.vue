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
                </div>
                <div class="option-group" name="Circle" >
                    <div class="option __isGroup">
                        <span>
                            <label for="options-circle-x">X</label>
                            <input type="number" size="10" id="options-circle-x" v-model="options.circle.x" />
                        </span>
                        <span>
                            <label for="options-circle-y">Y</label>
                            <input type="number" size="10" id="options-circle-y" v-model="options.circle.y" />
                        </span>
                    </div>
                    <div class="option __isGroup">
                        <span>
                            <label for="options-circle-diameter">Diameter</label>
                            <input type="number" size="10" id="options-circle-diameter" v-model="options.circle.diameter" />
                        </span>
                        <span>
                            <label for="options-circle-radius">Radius</label>
                            <input type="number" size="10" id="options-circle-radius" v-model="options.circle.radius" />
                        </span>
                    </div>
                    <div class="option">
                        <label for="range">
                            Angle
                        </label>
                        <input type="range" id="angle" min="0" max="360" step="1" v-model="options.circle.angle">
                        <!-- optional number display-->
                        <input type="number"  min="0" max="360" step="1" v-model="options.circle.angle">
                    </div>
                    
                    <div class="option __isGroup">
                        <span>
                            <label for="options-circle-originX">Origin X <i class="info"><span class="info-icon">?</span><span class="info-details">Use left, center, right or a number </span></i></label>
                            <input type="text" size="13" id="options-circle-originX" v-model="options.circle.originX" />
                        </span>
                        <span>
                            <label for="options-circle-originY">Origin Y <i class="info"><span class="info-icon">?</span><span class="info-details">Use top, center, bottom or a number </span></i></label>
                            <input type="text" size="13" id="options-circle-originY" v-model="options.circle.originY" />
                        </span>
                    </div>

                    <div class="option __isGroup">
                        <span>
                            <label for="options-circle-gradient">Gradient</label>
                            <select v-model="options.circle.fill.type">
                                <option value="linear">Linear</option>
                                <option value="radial">Radial</option>
                                <option value="solid">Solid</option>
                            </select>
                        </span>
                        <span v-if="options.circle.fill.type == 'linear'">
                            <label for="range">
                                Angle
                            </label>
                            <input type="range" id="angle" min="0" max="360" step="1" v-model="options.circle.fill.angle">
                            <!-- optional number display-->
                            <input type="number"  min="0" max="360" step="1" v-model="options.circle.fill.angle">
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
    circle: {
        x:number
        y:number
        diameter: number
        radius: number
        angle: number
        scale: DCScale,
        fill: string | DCGradient
        // stroke: DCStroke
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
                circle: {
                    x: 200,
                    y: 200,
                    diameter: 200,
                    radius: 100,
                    fill: {
                        type: "linear",
                        colors: ["#58f208","#7202ac"]
                    },
                    // stroke: {
                    //     color: "#f09",
                    //     width: 10,
                    //     alignment: "outer"
                    // },
                    scale: {x: 1, y: 1},
                    originX: "center",
                    originY: "center"
                }
            } as Options,
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
                if (this.dynamicCanvas && this.circle) {
                    this.dynamicCanvas.width = val
                    this.circle.x = val / 2
                    this.circle.updateOrigin()
                }
            }
        },
        "options.height": {
            handler(val) {
                if (this.dynamicCanvas && this.circle) {
                    this.dynamicCanvas.height = val
                    this.circle.y = val / 2
                    this.circle.updateOrigin()
                }
            }
        },
        "options.circle": {
            handler(val) {
                if (this.dynamicCanvas && this.circle) {
                    this.circle.width = val.width
                    this.circle.height = val.height
                    this.circle.x = val.x
                    this.circle.y = val.y
                    this.circle.diameter = val.diameter
                    this.circle.radius = val.radius
                    this.circle.angle = val.angle
                    this.circle.scale = val.scale

                    if (val.fill.type == "solid") {
                        this.circle.fill = val.fill.colors[0]
                    } else {
                        this.circle.fill = val.fill
                    }

                    this.circle.stroke = val.stroke

                    if ((!isNaN(parseInt(val.originX)) || ["center", "top", "bottom", "left", "right"].includes(val.originX)) &&
                        (!isNaN(parseInt(val.originY)) || ["center", "top", "bottom", "left", "right"].includes(val.originY))) {
                        this.circle.origin = `${val.originX} ${val.originY}`
                    }
                }
            },
            deep: true
        },
        "options.circle.diameter": {
            handler(val) {
                if (this.options.circle.radius != val/2) {
                    this.options.circle.radius = val/2
                }
            }
        },
        "options.circle.radius": {
            handler(val) {
                if (this.options.circle.diameter != val*2) {
                    this.options.circle.diameter = val*2
                }
            }
        }
    },
    mounted() {

        this.loadOptions()

        const canvas = this.$refs["targetCanvas"] as HTMLCanvasElement
        if (canvas) {
            this.dynamicCanvas = new DynamicCanvas(canvas, {
                width: this.options.width,
                height: this.options.height
            })

            this.circle = new DCCircle(this.dynamicCanvas.canvas, {
                x: 0, 
                y: 0, 
                diameter: this.options.circle.diameter, 
                origin: "center center",
                fill: this.options.circle.fill,
                stroke: this.options.circle.stroke,
                angle: this.options.circle.angle,
                scale: this.options.circle.scale,
            })

            console.log("Circle", this.circle)

            this.dynamicCanvas.layers.push(this.circle)
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
                circle: {
                    x: 200,
                    y: 200,
                    diameter: 200,
                    radius: 100,
                    angle: 0,
                    fill: {
                        type: "linear",
                        angle: 0,
                        colors: ["#58f208","#7202ac"]
                    },
                    scale: {x: 1, y: 1},
                    originX: "center",
                    originY: "center"
                }
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