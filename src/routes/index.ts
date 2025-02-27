import DrawingRectangle from "./drawing-rectangle.vue"
import RotatingRectangle from "./rotating-rectangle.vue"
import ScalingRectangle from "./scaling-rectangle.vue"
import Image from "./image/image.vue"
import ImageFlip from "./image-flip/image-flip.vue"
import Square from "./square/square.vue"
import Circle from "./circle/circle.vue"
import Zoom from "./zoom/zoom.vue"
import DynamicCanvas from "./dynamic-canvas.vue"
import Home from "./home.vue"
import OptionsOverview from "./options-overview.vue"
import { createWebHistory, createRouter } from "vue-router"

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
