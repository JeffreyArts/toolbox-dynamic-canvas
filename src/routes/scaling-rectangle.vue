<template>
    <div class="options-overview">
        <header class="title">
            <h1>Scaling rectangle</h1>
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
                        <label for="options-rectangle-scalex">Scale X</label>
                        <input type="number" id="options-rectangle-scalex" step="0.1" v-model="options.rectangle.scale.x" />
                    </div> 
                    <div class="option">
                        <label for="options-rectangle-scaley">Scale Y</label>
                        <input type="number" id="options-rectangle-scaley" step="0.1" v-model="options.rectangle.scale.y" />
                    </div> 
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
interface DynamicCanvasOptions {
    width?: number
    height?: number
}

interface DCElement {
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    x: number
    y: number
    fill: string
    origin: string
    originValue: {
        x: number
        y: number
    }
    boundingBox: {
        width: number
        height: number
    }
    draw(context: CanvasRenderingContext2D): void
}

class DynamicCanvas {
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    elements: Array<DCRectangle | DCElement>
    width: number
    height: number
    constructor(targetElement: HTMLElement, options?: DynamicCanvasOptions) {
        this.canvas = targetElement.tagName !== "CANVAS" ? document.createElement("canvas") : targetElement as HTMLCanvasElement
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D
        this.elements = []

        this.width = this.canvas.width
        this.height = this.canvas.height
        

        // Make width dynamic
        Object.defineProperty(this, "width", {
            get() {
                return this.canvas.width
            },
            set(value) {
                this.canvas.width = parseInt(value, 10)
            }
        })
        // Make height dynamic
        Object.defineProperty(this, "height", {
            get() {
                return this.canvas.height
            },
            set(value) {
                this.canvas.height = parseInt(value, 10)
            }
        })

        if (options) {
            if (typeof options.width === "number") {
                this.width = options.width
            }
            if (typeof options.height === "number") {
                this.height = options.height
            }
        }

        this.#draw()
    }   
    #draw() {
        this.context.clearRect(0, 0, this.width, this.height)
        this.elements.forEach((element) => {
            element.draw(this.context)
        })
        
        requestAnimationFrame(() => this.#draw()) 

    }
}

type DCOriginName = "top" | "bottom" | "left" | "right" | "center"
interface DCStroke {
    color: string
    width: number
    alignment: "inner" | "center" | "outer"
}
interface DCScale {
    x: number
    y: number
}


interface DCRectangleOptions {
    x?: number
    y?: number
    width?: number
    height?: number
    fill?: string
    angle?: number
    scale?: Partial<DCScale>
    stroke?: Partial<DCStroke>
    origin?: string
}

class DCRectangle implements DCElement {
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    x: number
    y: number
    width: number
    height: number
    angle: number
    _angle: number
    scale: DCScale
    _scale: DCScale
    fill: string
    stroke: DCStroke
    origin: string
    _origin: string
    originValue: {
        x: number
        y: number
    }
    boundingBox: {
        width: number
        height: number
    }

    constructor(canvas: HTMLCanvasElement | DynamicCanvas, options: DCRectangleOptions) {
        this.x = typeof options.x === "number" ? options.x : 0
        this.y = typeof options.y === "number" ? options.y : 0
        this.fill = options.fill || "transparent"
        
        this.width = options.width || 0
        this.height = options.height || 0
        this.boundingBox = { width: this.width, height: this.height }
        
        this.stroke = { width: 0, color: "transparent", alignment: "center", ...options.stroke}
        
        this._angle = options.angle || 0
        this.angle = this._angle

        this._scale = {x:1, y:1, ...options.scale}
        console.log("A", this._scale)
        this.scale = {...this._scale}
        console.log("B", this.scale)

        this._origin = options.origin || "center center" 
        this.origin = this._origin
        this.originValue = {x: 0, y: 0}
        this.setOrigin()

        console.log("Scale", this.scale)

        if (canvas instanceof HTMLCanvasElement) {
            this.canvas = document.createElement("canvas")
            this.canvas.width = canvas.width
            this.canvas.height = canvas.height
            this.context = canvas.getContext("2d") as CanvasRenderingContext2D
        } else {
            this.canvas = document.createElement("canvas")
            this.canvas.width = canvas.canvas.width
            this.canvas.height = canvas.canvas.height
            this.context = canvas.context
        }

        // Make width dynamic
        Object.defineProperty(this, "width", {
            get() {
                return this.boundingBox.width
            },
            set(value) {
                this.boundingBox.width = value
                this.updateOrigin()
                this.setOrigin()
            }
        })
        // Make height dynamic
        Object.defineProperty(this, "height", {
            get() {
                return this.boundingBox.height
            },
            set(value) {
                this.boundingBox.height = value
                this.updateOrigin()
                this.setOrigin()
            }
        })

        // Make angle dynamic
        Object.defineProperty(this, "angle", {
            get() {
                return this._angle
            },
            set(value) {
                this._angle = value
            }
        })

        // Make scale dynamic
        Object.defineProperty(this, "scale", {
            get() {
                return this._scale
            },
            set(value) {
                console.log("Setting scale", value)
                if (typeof value === "object" && (value.x || value.y)) {
                    this._scale = {...this._scale, ...value}
                }
            }
        })
        
        Object.defineProperty(this, "origin", {
            get() {
                return this._origin
            },
            set(value) {
                this._origin = value
                this.setOrigin()
            }
        })
    }

    
    draw(context: CanvasRenderingContext2D) {
        if (!this.context || !this.canvas) {
            throw new Error("Canvas or context is not defined")
        }


        // Clear the internal context before drawing
        this.context.setTransform(1, 0, 0, 1, 0, 0)
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.rotateCanvas()
        this.scaleCanvas()

        let x = this.x - this.originValue.x
        let y = this.y - this.originValue.y
        let width = this.width
        let height = this.height

        this.context.fillStyle = this.fill
        this.context.fillRect(x, y, width, height)

        if (this.stroke.width > 0) {
            this.context.strokeStyle = this.stroke.color
            this.context.lineWidth = this.stroke.width

            if (this.stroke.alignment === "outer") {
                x -= this.stroke.width / 2
                y -= this.stroke.width / 2
                width += this.stroke.width
                height += this.stroke.width
            } else if (this.stroke.alignment === "inner") {
                x += this.stroke.width / 2
                y += this.stroke.width / 2
                width -= this.stroke.width
                height -= this.stroke.width
            }

            this.context.strokeRect(x, y, width, height)
        }

        // Draw the result from this.context onto the provided context
        context.drawImage(this.canvas, 0, 0)
    }

    rotateCanvas() {
        let x = this.x 
        let y = this.y

        this.context.setTransform(1, 0, 0, 1, 0, 0) // Resets the transformation matrix
        
        // Change the origin point for rotating
        this.context.translate(x, y)

        // Rotate to the new angle
        this.context.rotate(this._angle * Math.PI / 180)
        
        // Move the origin back (so rotation doesn't affect positioning)
        this.context.translate(-x, -y)
    }
    
    scaleCanvas() {
        console.log("scaleCanvas", this.scale)
        let x = this.x
        let y = this.y

        // Reset transformations before applying new scaling
        this.context.setTransform(1, 0, 0, 1, 0, 0)

        // Move origin to the object's position
        this.context.translate(x, y)

        // Apply scaling
        this.context.scale(this.scale.x, this.scale.y)

        // Move origin back
        this.context.translate(-x, -y)
    }

    setOriginParser(name: DCOriginName, pos: number) {
        if (name.toLowerCase() === "center") {
            if (pos === 0) {
                this.originValue.x = this.boundingBox.width / 2
            } else {
                this.originValue.y = this.boundingBox.height / 2
            }
        }

        if (name.toLowerCase() === "top") {
            this.originValue.y = 0
        }
        if (name.toLowerCase() === "bottom") {
            this.originValue.y = this.boundingBox.height
        }

        if (name.toLowerCase() === "left") {
            this.originValue.x = 0
        }
        
        if (name.toLowerCase() === "right") {
            this.originValue.x = this.boundingBox.width
        }
    }
    updateOrigin() {
        const origin = this._origin.split(" ")
        let res = ""
        origin.forEach((v,k) => {
            if (typeof v === "number") {
                if (k == 0) {
                    res += this.width/2
                } else {
                    res += this.height/2
                }
            } else {
                res += v
            }
            res += " "
        })

        if (res.length > 0) {
            this._origin = res.substring(0, res.length - 1)
        }
        
        return this._origin
    }
    setOrigin() {
        const origin = this._origin.split(" ")
        origin.forEach((v,k) => {
            if (!isNaN(parseInt(v, 10))) {
                if (k == 0) {
                    this.originValue.x = parseInt(v, 10)
                } else {
                    this.originValue.y = parseInt(v, 10)
                }
            } else if (v.length == 0) {
                if (k == 0) {
                    this.originValue.x = parseInt(v, 10)
                } else {
                    this.originValue.y = parseInt(v, 10)
                }
            } else if (typeof v == "string") {
                const originValue = v.trim() as DCOriginName
                if (!["center", "top", "bottom", "left", "right"].includes(originValue)) {
                    throw new Error("Invalid origin string")
                }
                
                this.setOriginParser(originValue, k)
            }
        })
        return this._origin
    }
}

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

        const canvas = this.$refs["targetCanvas"] as HTMLCanvasElement
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