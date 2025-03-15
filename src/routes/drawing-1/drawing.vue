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
let testShape
export default defineComponent({
    components: {},
    data() {
        return {
            dynamicCanvas: undefined as DynamicCanvas | undefined,
            selectedShape: "",
            mouseDown: false,
            newShape: undefined as DCCircle | DCEllipse | DCRectangle | DCSquare | DCImage | undefined,
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
            this.dynamicCanvas = new DynamicCanvas(canvas, {
                width: 400,
                height: 400,
            });

            this.drawShapeIcon("circle");
            this.drawShapeIcon("ellipse");
            this.drawShapeIcon("square");
            this.drawShapeIcon("rectangle");
            this.drawShapeIcon("image");

            canvas.addEventListener("mousedown", this.onMouseDown);
            canvas.addEventListener("mousemove", this.onMouseMove);
            document.body.addEventListener("mouseup", this.onMouseUp);
        }
    },
    beforeUnmount() {
    },
    methods: {
        onMouseDown(event: MouseEvent) {
            this.mouseDown = true;
            this.startDrawing({x: event.offsetX, y: event.offsetY});
            console.log("Mouse down", event);
        },
        onMouseUp(event: MouseEvent) {
            this.mouseDown = false;
            if (this.dynamicCanvas) {
                // check if the mouse is still inside the canvas
                const rect = this.dynamicCanvas.canvas.getBoundingClientRect();
                if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
                    this.cancelDrawing();
                } else {
                    this.finishDrawing();
                }
            }
            console.log("Mouse up", event);
        },
        onMouseMove(event: MouseEvent) {
            const {x,y} = {x: event.offsetX, y: event.offsetY}
            console.log("Mouse move", this.newShape );
            if (!this.newShape ) {
                return
            }
            if (this.newShape instanceof DCCircle) {
                this.drawCircle({x: event.offsetX, y: event.offsetY, center: !!event.altKey}); 
            } else if (this.newShape instanceof DCSquare) {
                this.drawSquare({x: event.offsetX, y: event.offsetY, center: !!event.altKey}); 
            } else if (this.newShape instanceof DCRectangle) {
                this.drawRectangle({x: event.offsetX, y: event.offsetY, center: !!event.altKey}); 
            } else if (this.newShape instanceof DCEllipse) {
                this.drawEllipse({x: event.offsetX, y: event.offsetY, center: !!event.altKey}); 
            }
        },
        onMouseLeave(event: MouseEvent) {
            this.mouseDown = false;
            this.cancelDrawing();
            console.log("Mouse leave", event);
        },
        updateOrigin(pos: { x: number, y: number }) {
            if (!this.newShape) {
                return
            }
            const {x, y} = pos;

            if (this.newShape.x > x && this.newShape.y < y) {
                this.newShape.origin = "top right";
            } else if (this.newShape.x < x && this.newShape.y < y) {
                this.newShape.origin = "top left";
            } else if (this.newShape.x < x && this.newShape.y > y) {
                this.newShape.origin = "bottom left";
            } else if (this.newShape.x > x && this.newShape.y > y) {
                this.newShape.origin = "bottom right";
            }
        },
        drawCircle(pos: { x: number, y: number, center: boolean }) {
            if (!(this.newShape instanceof DCCircle)) {
                return;
            }
            const {x, y} = pos;
            const radius = Math.max(Math.abs(x - this.newShape.x), Math.abs(y - this.newShape.y))
            this.newShape.diameter = radius;
            this.updateOrigin(pos);
            
            if (pos.center) {
                this.newShape.origin = `${radius}px ${radius}px`;
                this.newShape.diameter = radius*2;
            }
        },
        drawSquare(pos: { x: number, y: number, center: boolean }) {
            if (!(this.newShape instanceof DCSquare)) {
                return;
            }
            const {x, y} = pos;
            const radius = Math.max(Math.abs(x - this.newShape.x), Math.abs(y - this.newShape.y))
            this.newShape.size = radius;
            this.updateOrigin(pos);
            
            if (pos.center) {
                this.newShape.origin = `${radius}px ${radius}px`;
                this.newShape.size = radius*2;
            }
        },
        drawRectangle(pos: { x: number, y: number, center: boolean}) {
            if (!(this.newShape instanceof DCRectangle)) {
                return;
            }
            const {x, y, center} = pos;
            
            const width = Math.abs(x - this.newShape.x)
            const height = Math.abs(y - this.newShape.y)
            this.newShape.width = width;
            this.newShape.height = height;
            this.updateOrigin(pos);
            if (center) {
                this.newShape.origin = `${width/2}px ${height/2}px`;
                this.newShape.width = width;
                this.newShape.height = height;
            }
        },
        drawEllipse(pos: {x: number, y:number, center: boolean}) {
            if (!(this.newShape instanceof DCEllipse)) {
                return;
            }
            const {x, y, center} = pos;
            
            const width = Math.abs(x - this.newShape.x)
            const height = Math.abs(y - this.newShape.y)
            this.newShape.width = width;
            this.newShape.height = height;
            this.updateOrigin(pos);
            if (center) {
                this.newShape.origin = `${width/2}px ${height/2}px`;
                this.newShape.width = width;
                this.newShape.height = height;
            }
        },
        startDrawing(pos: { x: number, y: number }) {
            if (this.selectedShape == "" || !this.dynamicCanvas) {
                return;
            }
            if (this.selectedShape == "DCCircle") {
                this.newShape = new DCCircle(this.dynamicCanvas.canvas, {
                    x: pos.x,
                    y: pos.y,
                    diameter: 1,
                    // width: 1,
                    // height: 1,
                    origin: "top left",
                    stroke: { color: "#04a9cc", width: 1, alignment: "inner" },
                });
                
            } else if (this.selectedShape == "DCEllipse") {
                this.newShape = new DCEllipse(this.dynamicCanvas.canvas, {
                    x: pos.x,
                    y: pos.y,
                    width: 0,
                    height: 0,
                    origin: "top left",
                    stroke: { color: "#04a9cc", width: 1, alignment: "inner" },
                });
            } else if (this.selectedShape == "DCSquare") {
                this.newShape = new DCSquare(this.dynamicCanvas.canvas, {
                    x: pos.x,
                    y: pos.y,
                    size: 0,
                    origin: "top left",
                    stroke: { color: "#04a9cc", width: 1, alignment: "inner" },
                });
            } else if (this.selectedShape == "DCRectangle") {
                this.newShape = new DCRectangle(this.dynamicCanvas.canvas, {
                    x: pos.x,
                    y: pos.y,
                    width: 0,
                    height: 0,
                    origin: "top left",
                    stroke: { color: "#04a9cc", width: 1, alignment: "inner" },
                });
            } else if (this.selectedShape == "DCImage") {
                this.newShape = new DCImage(this.dynamicCanvas.canvas, {
                    x: pos.x,
                    y: pos.y,
                    width: 0,
                    height: 0,
                    origin: "top left",
                    src: "",
                });
            }
            if (this.newShape) {
                this.dynamicCanvas.layers.push(this.newShape);
            }
            
        },
        finishDrawing() {
            console.log("Stop drawing");
            this.newShape = undefined;
        },
        cancelDrawing() {
            console.log("Stop drawing");
            if (this.newShape) {
                this.dynamicCanvas?.layers.pop();
                this.newShape = undefined;
            }
        },
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
