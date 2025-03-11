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
                <div class="option-group" name="Shapes">
                    <div class="option __isGroup">
                        <span>
                            <canvas class="shape-icon" id="shape-circle" @click="selectShape('DCCircle')" :class="[selectedShape == 'DCCircle' ? '__isSelected' : '']"></canvas>
                        </span>
                        <span>
                            <canvas class="shape-icon" id="shape-ellipse" @click="selectShape('DCEllipse')" :class="[selectedShape == 'DCEllipse' ? '__isSelected' : '']"></canvas>
                        </span>
                        <span>
                            <canvas class="shape-icon" id="shape-square" @click="selectShape('DCSquare')" :class="[selectedShape == 'DCSquare' ? '__isSelected' : '']"></canvas>
                        </span>
                        <span>
                            <canvas class="shape-icon" id="shape-rectangle" @click="selectShape('DCRectangle')" :class="[selectedShape == 'DCRectangle' ? '__isSelected' : '']"></canvas>
                        </span>
                        <span>
                            <canvas class="shape-icon" id="shape-image"  @click="selectShape('DCImage')" :class="[selectedShape == 'DCImage' ? '__isSelected' : '']"/>
                        </span>
                    </div>
                </div>
                <div class="option-group" name="Fill" v-if="['DCRectangle', 'DCSquare', 'DCCircle', 'DCEllipse'].includes(selectedShape)">
                    <div class="option __isGroup">
                        Color
                    </div>
                </div>
                <div class="option-group" name="Stroke" v-if="['DCRectangle', 'DCSquare', 'DCCircle', 'DCEllipse'].includes(selectedShape)">
                    
                    Color <br>
                    Width <br>
                    Alignment
                </div>
            </div>
        </aside>
    </div>
</template>

<script lang="ts">
import { isProxy, toRaw , defineComponent } from "vue";
import { DynamicCanvas } from "./model/DynamicCanvas";
import DCEllipse from "./model/DCEllipse";
import DCCircle from "./model/DCCircle";
import DCRectangle from "./model/DCRectangle";
import DCSquare from "./model/DCSquare";
import DCImage from "./model/DCImage";

export default defineComponent({
    components: {},
    data() {
        return {
            dynamicCanvas: undefined as DynamicCanvas | undefined,
            selectedShape: "",
            selectedShapeObject: undefined as DCCircle | DCEllipse | DCRectangle | DCSquare | DCImage | undefined,
            shapes: [] as Array<DCCircle | DCEllipse | DCRectangle | DCSquare | DCImage>,
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
            // this.dynamicCanvas = new DynamicCanvas(canvas, {
            //     width: 1080,
            //     height: 1920,
            // });

            this.drawShapeIcon("circle");
            this.drawShapeIcon("ellipse");
            this.drawShapeIcon("square");
            this.drawShapeIcon("rectangle");
            this.drawShapeIcon("image");

        }
    },
    beforeUnmount() {
    },
    methods: {
        drawShapeIcon(type: string) {
            let canvas

            if (type == "circle") {
                canvas = document.getElementById("shape-circle") as HTMLCanvasElement;
            } else if (type == "ellipse") {
                canvas = document.getElementById("shape-ellipse") as HTMLCanvasElement;
            } else if (type == "square") {
                canvas = document.getElementById("shape-square") as HTMLCanvasElement;
            } else if (type == "rectangle") {
                canvas = document.getElementById("shape-rectangle") as HTMLCanvasElement;
            } else if (type == "image") {
                canvas = document.getElementById("shape-image") as HTMLCanvasElement;
            } 

            if (!canvas) {
                throw new Error(`No canvas found for type ${type}`);
            }

            const DC = new DynamicCanvas(canvas, {
                width: 48,
                height: 48,
            });

            let newShape

            if (type == "circle") {
                newShape = new DCCircle(DC.canvas, {
                    x: 24,
                    y: 24,
                    diameter: 48,
                    origin: "center center",
                    fill: "#ccc",
                    stroke: { color: "#333", width: 4, alignment: "inner" },
                });
            } else if (type == "ellipse") {
                newShape = new DCEllipse(DC.canvas, {
                    x: 24,
                    y: 24,
                    width: 48,
                    height: 24,
                    origin: "center center",
                    fill: "#ccc",
                    stroke: { color: "#333", width: 4, alignment: "inner"},
                });
            } else if (type == "square") {
                newShape = new DCSquare(DC.canvas, {
                    x: 24,
                    y: 24,
                    size: 48,
                    origin: "center center",
                    fill: "#ccc",
                    stroke: { color: "#333", width: 4, alignment: "inner"},
                });
            } else if (type == "rectangle") {
                newShape = new DCRectangle(DC.canvas, {
                    x: 24,
                    y: 24,
                    width: 48,
                    height: 24,
                    origin: "center center",
                    fill: "#ccc",
                    stroke: { color: "#333", width: 4, alignment: "inner" },
                });
            } else if (type == "image") {
                newShape = new DCImage(DC.canvas, {
                    x: 24,
                    y: 24,
                    width: 48,
                    height: 48,
                    origin: "center center",
                    src: "./assets/image-icon.png",
                });
            }

            if (!newShape) {
                throw new Error(`No shape for type ${type}`);
            }

            DC.layers.push(newShape);
            this.shapes.push(newShape);
            
        },
        selectShape(type: string) {
            this.selectedShape = type
            this.shapes.forEach((shape) => {
                shape.fill = "#ccc";
            });

            this.shapes.filter((shape) => {
                if (shape.type == type) {
                    shape.fill = "#58f208";
                    this.selectedShapeObject = shape;
                }
            });

        },
    },
});
</script>

<style lang="scss" scoped>
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
