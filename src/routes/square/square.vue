<template>
    <div class="options-overview">
        <header class="title">
            <h1>Square</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="1x1" >
                <canvas ref="targetCanvas"></canvas>
            </div>
            <footer class="viewport-datamodel">
                <pre>{{ square }}</pre>
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
                <div class="option-group" name="Square" >
                    <div class="option __isGroup">
                        <span>
                            <label for="options-square-x">X</label>
                            <input type="number" size="10" id="options-square-x" v-model="options.square.x" />
                        </span>
                        <span>
                            <label for="options-square-y">Y</label>
                            <input type="number" size="10" id="options-square-y" v-model="options.square.y" />
                        </span>
                    </div>
                    <div class="option __isGroup">
                        <span>
                            <label for="options-square-size">Size</label>
                            <input type="number" size="10" id="options-square-size" v-model="options.square.size" />
                        </span>
                    </div>
                    <div class="option">
                        <label for="range">
                            Angle
                        </label>
                        <input type="range" id="angle" min="0" max="360" step="1" v-model="options.square.angle">
                        <!-- optional number display-->
                        <input type="number"  min="0" max="360" step="1" v-model="options.square.angle">
                    </div>
                    
                    <div class="option __isGroup">
                        <span>
                            <label for="options-square-originX">Origin X <i class="info"><span class="info-icon">?</span><span class="info-details">Use left, center, right or a number </span></i></label>
                            <input type="text" size="13" id="options-square-originX" v-model="options.square.originX" />
                        </span>
                        <span>
                            <label for="options-square-originY">Origin Y <i class="info"><span class="info-icon">?</span><span class="info-details">Use top, center, bottom or a number </span></i></label>
                            <input type="text" size="13" id="options-square-originY" v-model="options.square.originY" />
                        </span>
                    </div>

                    <div class="option __isGroup">
                        <span>
                            <label for="options-square-stroke-width">Stroke width</label>
                            <input type="number" size="10" id="options-square-stroke-width" v-model="options.square.stroke.width" />
                        </span>
                        <span>
                            <label for="options-square-stroke-alignment">Alignment</label>
                            <select v-model="options.square.stroke.alignment">
                                <option value="inner">Inner</option>
                                <option value="center">Center</option>
                                <option value="outer">Outer</option>
                            </select>
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
import { DynamicCanvas, DCScale, DCStroke} from "./model/DynamicCanvas"
import DCSquare from "./model/DCSquare"


interface Options {
    width: number
    height: number,
    square: {
        x:number
        y:number
        size: number
        angle: number
        scale: DCScale,
        fill: string
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
                square: {
                    x: 200,
                    y: 200,
                    size: 200,
                    angle: 0,
                    fill: "#58f208",
                    stroke: {
                        color: "#f09",
                        width: 10,
                        alignment: "outer"
                    },
                    scale: {x: 1, y: 1},
                    originX: "center",
                    originY: "center"
                }
            } as Options,
            dynamicCanvas: undefined as DynamicCanvas | undefined,
            square: undefined as DCSquare | undefined,
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
                if (this.dynamicCanvas && this.square) {
                    this.dynamicCanvas.width = val
                    this.square.x = val / 2
                    this.square.updateOrigin()
                }
            }
        },
        "options.height": {
            handler(val) {
                if (this.dynamicCanvas && this.square) {
                    this.dynamicCanvas.height = val
                    this.square.y = val / 2
                    this.square.updateOrigin()
                }
            }
        },
        "options.square": {
            handler(val) {
                if (this.dynamicCanvas && this.square) {
                    this.square.width = val.width
                    this.square.height = val.height
                    this.square.x = val.x
                    this.square.y = val.y
                    this.square.angle = val.angle
                    this.square.scale = val.scale
                    this.square.fill = val.fill
                    this.square.size = val.size
                    this.square.stroke = val.stroke

                    if ((!isNaN(parseInt(val.originX)) || ["center", "top", "bottom", "left", "right"].includes(val.originX)) &&
                        (!isNaN(parseInt(val.originY)) || ["center", "top", "bottom", "left", "right"].includes(val.originY))) {
                        this.square.origin = `${val.originX} ${val.originY}`
                    }
                }
            },
            deep: true
        },
    },
    mounted() {

        this.loadOptions()

        const canvas = this.$refs['targetCanvas'] as HTMLCanvasElement
        if (canvas) {
            this.dynamicCanvas = new DynamicCanvas(canvas, {
                width: this.options.width,
                height: this.options.height
            })

            this.square = new DCSquare(this.dynamicCanvas.canvas, {
                x: 0, 
                y: 0, 
                size: this.options.square.size, 
                origin: "center center",
                fill: this.options.square.fill,
                stroke: this.options.square.stroke,
                angle: this.options.square.angle,
                scale: this.options.square.scale,
            })

            console.log("Square", this.square)

            this.dynamicCanvas.layers.push(this.square)
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
                square: {
                    x: 200,
                    y: 200,
                    size: 200,
                    angle: 0,
                    fill: "#58f208",
                    stroke: {
                        color: "#f09",
                        width: 10,
                        alignment: "outer"
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