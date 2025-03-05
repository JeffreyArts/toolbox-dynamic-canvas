<template>
    <div class="options-overview">
        <header class="title">
            <h1>Static drawing</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="1x1" >
                <canvas ref="targetCanvas"></canvas>
            </div>
            <footer class="viewport-datamodel" v-if="typeof image == 'object'">
                <pre>Drawcycle: {{ drawCycle }}</pre>
            </footer>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Canvas" >
                    <div class="option __isGroup">
                        <div>
                            <label for="options-width">Width</label>
                            <input type="number" id="options-width" size="8" v-model="options.width" />
                        </div>
                        <div>
                            <label for="options-height">Height</label>
                            <input type="number" id="options-height" size="8" v-model="options.height" />
                        </div>
                    </div>
                    <div class="option">
                        <div>
                            <input type="checkbox" id="checkbox-v0" :checked="options.image.isStatic" v-model="options.image.isStatic">
                            <label for="checkbox-v0">
                                Static
                            </label>
                        </div>
                    </div>
                </div>
                <div class="option-group" name="Image" >
                    <div class="option">
                        <label for="options-image-src">Source</label>
                        <input type="file" accept="image/*" id="options-image-src" @change="processImage" />
                    </div>
                    <div class="option" id="posOptions">
                        <span>
                            <label for="options-image-x">X</label>
                            <input type="number" size="10" id="options-image-x" v-model="options.image.x" />
                        </span>
                        <span>
                            <label for="options-image-y">Y</label>
                            <input type="number" size="10" id="options-image-y" v-model="options.image.y" />
                        </span>
                    </div>
                    <div class="option" id="sizeOptions">
                        <span>
                            <label for="options-image-width">Width</label>
                            <input type="number" size="10" id="options-image-width" v-model="options.image.width" />
                        </span>
                        <span>
                            <label for="options-image-height">Height</label>
                            <input type="number" size="10" id="options-image-height" v-model="options.image.height" />
                        </span>
                    </div>
                    <div class="option">
                        <label for="range">
                            Angle
                        </label>
                        <input type="range" id="range" min="0" max="360" step="1" v-model="options.image.angle">
                        <!-- optional number display-->
                        <input type="number"  min="0" max="360" step="1" v-model="options.image.angle">
                    </div>
                    <div class="option" id="scaleOptions">
                        <span>
                            <label for="options-image-scaleX">Scale X </label>
                            <input type="text" size="13" id="options-image-scaleX" v-model="options.image.scale.x" />
                        </span>
                        <span>
                            <label for="options-image-scaleY">Scale Y </label>
                            <input type="text" size="13" id="options-image-scaleY" v-model="options.image.scale.y" />
                        </span>
                    </div>

                    <div class="option" v-if="typeof image == 'object'">
                        <button class="button" id="options-reset" @click="image.updateFrame = true">Update frame</button>
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
import { DynamicCanvas, DCScale} from "./model/DynamicCanvas"
import DCImage from "./model/DCImage"


interface Options {
    width: number
    height: number,
    image: {
        x:number
        y:number
        width: number
        height: number
        angle: number
        src: string
        scale: DCScale
        isStatic: boolean
    }
}

export default defineComponent ({ 
    components: {},
    props: [],
    data() {
        return {
            drawCycle: 0,
            options: {
                width: 400,
                height: 400,
                image: {
                    x: 0,
                    y: 0,
                    width: 50,
                    height: 50,
                    angle: 0,
                    scale: {x: 1, y: 1},
                    isStatic: true,
                    src: ""
                }
            } as Options,
            dynamicCanvas: undefined as DynamicCanvas | undefined,
            image: undefined as DCImage | undefined,
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
                if (this.dynamicCanvas && this.image) {
                    this.dynamicCanvas.width = val
                    this.image.x = val / 2
                    this.image.updateOrigin()
                }
            }
        },
        "options.height": {
            handler(val) {
                if (this.dynamicCanvas && this.image) {
                    this.dynamicCanvas.height = val
                    this.image.y = val / 2
                    this.image.updateOrigin()
                }
            }
        },
        "options.image": {
            handler(val) {
                if (this.dynamicCanvas && this.image) {
                    this.image.width = val.width
                    this.image.height = val.height
                    this.image.x = val.x
                    this.image.y = val.y
                    this.image.angle = val.angle
                    this.image.scale = val.scale
                    this.image.src = val.src
                    this.image.static = val.isStatic
                }
            },
            deep: true
        },
    },
    mounted() {

        this.loadOptions()
        this.drawCycleUpdate()

        const canvas = this.$refs['targetCanvas'] as HTMLCanvasElement
        if (canvas) {
            this.dynamicCanvas = new DynamicCanvas(canvas, {
                width: this.options.width,
                height: this.options.height
            })

            this.image = new DCImage(this.dynamicCanvas.canvas, {
                x: this.options.image.x, 
                y: this.options.image.y, 
                angle: this.options.image.angle,
                width: this.dynamicCanvas.width, 
                height: this.dynamicCanvas.height, 
                scale: this.options.image.scale,
                origin: "center center",
                src: this.options.image.src,
                static: this.options.image.isStatic
            })

            console.log("Image", this.image)

            this.dynamicCanvas.layers.push(this.image)
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
                image: {
                    x: 0,
                    y: 0,
                    width: 200,
                    height: 200,
                    scale: {x:1 , y: 1},
                    angle: 0,
                    isStatic: true,
                    src: ""
                }
            }
        },
        processImage(e:Event) {
            const target = e.target as HTMLInputElement
            const file = target.files?.[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    const img = new Image()
                    img.onload = () => {
                        this.options.image.width = img.width
                        this.options.image.height = img.height
                        this.options.image.src = img.src
                    }
                    img.src = e.target?.result as string
                }
                reader.readAsDataURL(file)
            }
        },
        drawCycleUpdate() {
            requestAnimationFrame(() => {
                if (this.image) {
                    this.drawCycle = this.image.drawCycle
                    this.drawCycleUpdate()
                }
            })
        }

    }
})
</script>


<style lang="scss" scoped>
.__isGroup,
#posOptions,
#scaleOptions,
#sizeOptions,
#originOptions {
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