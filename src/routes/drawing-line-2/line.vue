<template>
    <div class="options-overview">
        <header class="title">
            <h1>Drawing</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="1x1">
                <canvas ref="targetCanvas"></canvas>
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Fill">
                    <div class="option">
                        <label for="options-rectangle-stroke-alignment">Fill Color</label>
                        <input type="color" v-model="fillColor" v-if="!isTransparent"/>
                    </div>
                    <div class="option">
                        <span>
                            <input type="checkbox" id="checkbox-isTransparent" v-model="isTransparent" />
                            <label for="checkbox-isTransparent">
                                Transparent
                            </label>
                        </span>
                    </div>
                </div>
                <div class="option-group" name="Line">
                    <div class="option __isGroup">
                        <button class="button" @click="addLine">Add Line</button>
                        <button class="button" @click="extendLine">Extend Line</button>
                        <button class="button" @click="shortenLine">Shorten Line</button>
                    </div>
                    <div class="option __isGroup" v-if="lastLine >= 0 && dynamicCanvas">
                        <span>
                            <label for="last-line-x">X</label>
                            <input type="range" v-model="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -1].x" min="0" max="400"/>
                            <input type="number" v-model="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -1].x" min="0" max="400"/>
                        </span>
                        <span>
                            <label for="last-line-y">Y</label>
                            <input type="range" v-model="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -1].y" min="0" max="400"/>
                            <input type="number" v-model="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -1].y" min="0" max="400"/>
                        </span>
                    </div>
                    <div class="option __isGroup" v-if="lastLine >= 0 && dynamicCanvas">
                        <span v-if="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -1].handle?.in">
                            <label for="last-line-x">Handle in X</label>
                            <input type="range" v-model="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -1].handle.in.x" min="0" max="400"/>
                            <input type="number" v-model="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -1].handle.in.x" min="0" max="400"/>
                        </span>
                        <span v-if="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -1].handle?.in">
                            <label for="last-line-y">Handle in Y</label>
                            <input type="range" v-model="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -1].handle.in.y" min="0" max="400"/>
                            <input type="number" v-model="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -1].handle.in.y" min="0" max="400"/>
                        </span>
                    </div>
                    <div class="option __isGroup" v-if="lastLine >= 0 && dynamicCanvas">
                        <span v-if="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -2].handle?.out">
                            <label for="last-line-x">Handle out X</label>
                            <input type="range" v-model="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -2].handle.out.x" min="0" max="400"/>
                            <input type="number" v-model="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -2].handle.out.x" min="0" max="400"/>
                        </span>
                        <span v-if="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -2].handle?.out">
                            <label for="last-line-y">Handle out Y</label>
                            <input type="range" v-model="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -2].handle.out.y" min="0" max="400"/>
                            <input type="number" v-model="dynamicCanvas.layers[lastLine].points[dynamicCanvas.layers[lastLine].points.length -2].handle.out.y" min="0" max="400"/>
                        </span>
                    </div>
                    <!-- <div class="option __isGroup">
                        <span>
                            <label for="range">
                                Angle
                            </label>
                            <input type="range" id="range" min="0" max="360" step=".1" v-model="line2.angle">
                            <input type="number" min="0" max="360" step=".1" v-model="line2.angle">
                        </span>
                        <span>
                            <label for="options-rectangle-stroke-alignment">Distance</label>
                            <input type="number" v-model="line2.distance" min="0"/>
                        </span>
                    </div> -->
                </div>
                
                <div class="option-group" name="Stroke">
                    <div class="option">
                        <label for="options-rectangle-stroke-alignment">Stroke Color</label>
                        <input type="color" v-model="stroke.color"/>
                    </div>
                    
                    <div class="option ">
                        <label for="options-rectangle-stroke-alignment">Stroke Width</label>
                        <input type="number" v-model="stroke.width" min="0"/>
                    </div>

                    <div class="option">
                        <label for="options-rectangle-stroke-alignment">Stroke Alignment</label>
                        <select v-model="stroke.alignment">
                            <option value="inner">Inner</option>
                            <option value="center">Center</option>
                            <option value="outer">Outer</option>
                        </select>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { DynamicCanvas } from "./model/DynamicCanvas"
import DCLine from "./model/DCLine"

export default defineComponent({
    components: {},
    data() {
        return {
            dynamicCanvas: undefined as DynamicCanvas | undefined,
            selectedShape: "",
            fillColor: "#fff",
            line2: {
                angle: 0,
                distance: 100,
            },
            lastLine: 0,
            lines: [] as DCLine[],
            stroke: {
                color: "#04a9cc",
                width: 1,
                alignment: "inner" as "inner" | "outer" | "center"
            },
            mouseDown: false,
            keys: {} as Record<string, boolean>,
            isTransparent: false,
        }
    },
    watch: {
        stroke: {
            handler(val) {
                const lastLine = this.lines[this.lastLine]
                lastLine.stroke = val
            },
            deep: true
        },
        isTransparent: {
            handler(val) {
                this.lines.forEach(line => {
                    line.fill = val ? "transparent" : this.fillColor
                })
            }
        },
        fillColor: {
            handler(val) {
                this.lines.forEach(line => {
                    line.fill = val
                })
            },
            deep: true
        },
        line2: {
            handler(val) {
                const handleIn = this.lines[1].points[1].handle?.in
                if (handleIn) {
                    handleIn.length = val.distance
                    handleIn.angle = val.angle
                }
                // console.log("handleIn", handleIn, this.lines[1])
            },
            deep: true
        }
    },
    mounted() {
        const canvas = this.$refs["targetCanvas"] as HTMLCanvasElement
        if (canvas) {
            this.dynamicCanvas = new DynamicCanvas(canvas, {
                width: 400,
                height: 400,
            })

            this.lines.push(new DCLine(canvas, {
                points: [
                    { x: 48, y: 48 },
                    { x: 400 - 48, y: 48},
                ],
                stroke: this.stroke,
                closed: false,
                fill: this.fillColor
            }))

            this.lines.push(new DCLine(canvas, {
                points: [
                    { x: 48, y: 48*2},
                    { x: 400 - 48, y: 48*2, handle: { in: { x: 400, y: 48*2.5 }, out: { x: 400, y: 48*2.5 } } },
                    { x: 200, y: 48 * 2.4},
                ],
                stroke: this.stroke,
                closed: false,
                fill: this.fillColor
            }))

            this.lines.forEach(line => {
                if (this.dynamicCanvas) {
                    this.dynamicCanvas.layers.push(line)
                }
            })
            this.lastLine = this.lines.length - 1
        }
    },
    beforeUnmount() {
    },
    methods: {
        addLine() {
            if (!this.dynamicCanvas) {
                return
            }

            const newLine = new DCLine(this.dynamicCanvas.canvas, {
                points: [
                    { x: Math.round(48 + Math.random() * (400-48)), y: Math.round(48 + Math.random() * (400-48)) },
                    { x: Math.round(48 + Math.random() * (400-48)), y: Math.round(48 + Math.random() * (400-48)) },
                ],
                stroke: this.stroke,
                closed: false,
                fill: this.fillColor
            })
            this.lines.push(newLine)
            this.dynamicCanvas.layers.push(newLine)
            this.lastLine = this.lines.length - 1
        },
        extendLine() {
            if (!this.dynamicCanvas) {
                return
            }

            this.lastLine = this.lines.length - 1
            const lastLine = this.lines[this.lastLine]
            const newPoint = { x: Math.round(48 + Math.random() * (400-48)), y: Math.round(48 + Math.random() * (400-48)) }

            if (lastLine) {
                console.log("lastLine", this.dynamicCanvas.layers[this.lastLine])
                this.dynamicCanvas.layers[this.lastLine].points.push(newPoint)
            }
        },
        shortenLine() {
            if (!this.dynamicCanvas) {
                return
            }
            this.dynamicCanvas.layers[this.lastLine].points.pop()
            if (this.dynamicCanvas.layers[this.lastLine].points.length === 0) {
                this.lastLine --
            }
        }
    },
})
</script>

<style lang="scss" scoped>
.__isGroup {
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

.viewport-content canvas {
    max-width: 100%;
    max-height: 88vh;
}
.shape-icon {
    width: 48px;
    height: 48px;
    transition: all 0.2s;
    border: 2px solid transparent;

    &.__isSelected {
        border: 2px solid #58f208;
        border-radius: 4px;
    }
}
</style>
