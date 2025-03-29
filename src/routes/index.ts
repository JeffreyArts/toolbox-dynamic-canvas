import DrawingRectangle from "./drawing-rectangle.vue"
import RotatingRectangle from "./rotating-rectangle.vue"
import ScalingRectangle from "./scaling-rectangle.vue"
import Image from "./image/image.vue"
import ImageFlip from "./image-flip/image-flip.vue"
import Square from "./square/square.vue"
import Circle from "./circle/circle.vue"
import Zoom from "./zoom/zoom.vue"
import StreetRacer from "./street-racer/street-racer.vue"
import DynamicCanvas from "./dynamic-canvas.vue"
import StreetRacer2 from "./static-drawing/street-racer.vue"
import StaticDrawing2 from "./static-drawing-2/static-drawing.vue"
import StreetRacer3 from "./static-drawing-2/street-racer.vue"
import Drawing1 from "./drawing-1/drawing.vue"
import StreetRacer4 from "./drawing-1/street-racer.vue"
import DrawingLine from "./drawing-line/drawing.vue"
import DrawingLine2 from "./drawing-line-2/line.vue"
import Home from "./home.vue"
import OptionsOverview from "./options-overview.vue"
import { createWebHistory, createRouter } from "vue-router"
import StaticDrawing from "./static-drawing/static-drawing.vue"

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home
    },
    {
        path: "/dynamic-canvas",
        name: "Dynamic canvas",
        component: DynamicCanvas
    },
    {
        path: "/drawing-rectangle",
        name: "Drawing rectangle",
        component: DrawingRectangle
    },
    {
        path: "/rotating-rectangle",
        name: "Rotating rectangle",
        component: RotatingRectangle
    },
    {
        path: "/scaling-rectangle",
        name: "Scaling rectangle",
        component: ScalingRectangle
    },
    {
        path: "/image",
        name: "Image",
        component: Image
    },
    {
        path: "/image-flip",
        name: "Image flip",
        component: ImageFlip
    },
    {
        path: "/square",
        name: "Square",
        component: Square
    },
    {
        path: "/circle",
        name: "Circle",
        component: Circle
    },
    {
        path: "/zoom",
        name: "Zoom",
        component: Zoom
    },
    {
        path: "/street-racer",
        name: "Street racer",
        component: StreetRacer
    },
    {
        path: "/static-drawing",
        name: "Static drawing",
        component: StaticDrawing
    },
    {
        path: "/street-racer-2",
        name: "Street racer 2",
        component: StreetRacer2
    },
    {
        path: "/static-drawing-2",
        name: "Static drawing 2",
        component: StaticDrawing2
    },
    {
        path: "/street-racer-3",
        name: "Street racer 3",
        component: StreetRacer3
    },
    {
        path: "/drawing-1",
        name: "Drawing 1",
        component: Drawing1
    },
    {
        path: "/street-racer-4",
        name: "Street racer 4",
        component: StreetRacer4
    },
    {
        path: "/drawing-line",
        name: "Drawing Line",
        component: DrawingLine
    },
    {
        path: "/drawing-line-2",
        name: "Drawing Line 2",
        component: DrawingLine2
    },
    {
        path: "/options-overview",
        name: "Options overview",
        component: OptionsOverview
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

////////////////////////////////////////////////////////////////////////
// IMPORTANT NOTICE
// The code above will be updated via the `yarn new-route` command
// Be cautious when you make custom modifications (it should just work, 
// but just pay extra attention during your commits)
//
// - Jeffrey Arts, July 2024
////////////////////////////////////////////////////////////////////////


export default router
