<template>
    <div class="options-overview">
        <header class="title">
            <h1>Dynamic canvas</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="1x1" >
                <canvas ref="targetCanvas"></canvas>
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Options" >
                    <div class="option">
                        <label for="options-width">Width</label>
                        <input type="number" id="options-width" v-model="options.width" />
                    </div>
                    <div class="option">
                        <label for="options-height">Height</label>
                        <input type="number" id="options-height" v-model="options.height" />
                    </div>
                    <div class="option">
                        <label for="options-backgroundColor">Background color</label>
                        <input type="color" id="options-backgroundColor" v-model="options.backgroundColor"/>
                    </div>
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
    x: number
    y: number
    fill: string
    origin: {
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
}

interface DCRectangleOptions {
    x?: number
    y?: number
    width?: number
    height?: number
    fill?: string
    stroke?: DCStroke
    origin?: string
}

class DCRectangle implements DCElement {
    x: number
    y: number
    width: number
    height: number
    fill: string
    stroke?: DCStroke
    originString: string
    origin: {
        x: number
        y: number
    }
    boundingBox: {
        width: number
        height: number
    }

    constructor(options: DCRectangleOptions) {
        this.x = typeof options.x === "number" ? options.x : 0
        this.y = typeof options.y === "number" ? options.y : 0
        this.fill = options.fill || "transparent"
        this.width = options.width || 0
        this.height = options.height || 0
        this.stroke = options.stroke || {width: 0, color: "transparent"}
        this.originString = options.origin || "center center" 
        this.boundingBox = { width: this.width, height: this.height }
        this.origin = {x: 0, y: 0}
        this.setOrigin()

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
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.fill
        context.fillRect(this.x - this.origin.x, this.y - this.origin.y, this.width, this.height)
    }
    
    setOriginStringParser(name: DCOriginName, pos: number) {
        if (name.toLowerCase() === "center") {
            if (pos === 0) {
                this.origin.x = this.boundingBox.width / 2
            } else {
                this.origin.y = this.boundingBox.height / 2
            }
        }

        if (name.toLowerCase() === "top") {
            this.origin.y = 0
        }
        if (name.toLowerCase() === "bottom") {
            this.origin.y = this.boundingBox.height
        }

        if (name.toLowerCase() === "left") {
            this.origin.x = 0
        }
        
        if (name.toLowerCase() === "right") {
            this.origin.x = this.boundingBox.width
        }
    }
    updateOrigin() {
        const origin = this.originString.split(" ")
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
            this.originString = res.substring(0, res.length - 1)
        }
        
        return this.originString
    }
    setOrigin() {
        const origin = this.originString.split(" ")
        origin.forEach((v,k) => {
            if (typeof v == "number") {
                if (k == 0) {
                    this.origin.x = v
                } else {
                    this.origin.y = v
                }
            } else if (typeof v == "string") {
                const originValue = v.trim() as DCOriginName
                if (!["center", "top", "bottom", "left", "right"].includes(originValue)) {
                    throw new Error("Invalid origin string")
                }
                
                this.setOriginStringParser(originValue, k)
            }
        })
        return this.origin
    }
}

interface Options {
    width: number
    height: number,
    backgroundColor: string
}

export default defineComponent ({ 
    components: {},
    props: [],
    data() {
        return {
            options: {
                width: 400,
                height: 400,
                backgroundColor: "#58f208"
            } as Partial<Options>,
            dynamicCanvas: undefined as DynamicCanvas | undefined,
            background: undefined as DCRectangle | undefined,
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
                if (this.dynamicCanvas && this.background) {
                    this.background.width = val
                    this.dynamicCanvas.width = val
                    this.background.updateOrigin()
                }
            }
        },
        "options.height": {
            handler(val) {
                if (this.dynamicCanvas && this.background) {
                    this.background.height = val
                    this.dynamicCanvas.height = val
                    this.background.updateOrigin()
                }
            }
        },
        "options.backgroundColor": {
            handler(val) {
                if (this.dynamicCanvas && this.background) {
                    this.background.fill = val
                }
            }
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

            this.background = new DCRectangle({
                x: 0, 
                y: 0, 
                width: this.dynamicCanvas.width, 
                height: this.dynamicCanvas.height, 
                origin: "top left",
                fill: this.options.backgroundColor,
                stroke: {color: "#9f0", width: 10}
            })

            console.log("BG:",this.background)

            this.dynamicCanvas.elements.push(this.background)
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
                backgroundColor: "#58f208"
            }
        },
    }
})
</script>


<style lang="scss" scoped>
</style>