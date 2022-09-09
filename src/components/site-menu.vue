<template>
    <div class="site-menu-container">
        <div class="site-menu">
            <router-link to="/" class="site-menu-title">Toolbox</router-link>
            
            <div class="site-menu-list">
                <router-link class="site-menu-list-item"
                    :to="route.path" v-for="(route, routeIndex) in routes" 
                    :key="routeIndex"
                    :class="[currentRoute.name == route.name ? '__isCurrent' : '']">{{route.name}}</router-link>
            </div>
        </div>
        
        
        <div class="site-menu-toggle" @click="toggleMenu()" :class="[showToggle ? '__isVisible': '']">›</div>
    </div>
</template>

<script lang="ts">
import { RouteRecord, RouteComponent } from "vue-router"
import {defineComponent} from "vue"
import _ from "lodash"

export default defineComponent ({
    name: "SiteMenu", 
    props: [],
    data() {
        return {
            isOpen: false,
            showToggle: true,
            routes: [] as Array<RouteRecord>,
            currentRoute:{} as RouteComponent,
            bodyElement: document.querySelector("body") as HTMLElement
        }
    },
    watch:{
        $route (to){
            this.currentRoute = to
        }
    },
    mounted() {
        
        console.log(this.$router.currentRoute)
        _.each(this.$router.getRoutes(), (route: RouteRecord) :void => {
            if (route.name != "Home") {
                this.routes.push(route)
            }
        })
        
        document.addEventListener("mousemove", this.displayToggle)
    },
    unmounted() {
        document.removeEventListener("mousemove", this.displayToggle)
    },
    methods: {
        toggleMenu() :void {
            if (this.isOpen && this.bodyElement != null) {
                this.isOpen = false
                this.showToggle = false
                this.bodyElement.className = this.bodyElement.className.replace(" __menuOpen", "")
                setTimeout(()=> {
                    window.dispatchEvent(new Event("resize"))
                },160)
            } else {
                this.isOpen = true
                this.bodyElement.className += " __menuOpen"

                setTimeout(() => {
                    this.showToggle = false
                }, 0)
                setTimeout(()=> {
                    window.dispatchEvent(new Event("resize"))
                },160)
            }
        },
        displayToggle(event: MouseEvent) :void {
            var width = this.$el.querySelector(".site-menu").clientWidth
            if (!this.isOpen) {
                if (event.clientX < 32) {
                    setTimeout(() => {
                        this.showToggle = true
                    })
                } else if (this.showToggle == true) {
                    setTimeout(() => {
                        this.showToggle = false
                    })
                }
            } else {
                if (event.clientX > width &&
                event.clientX < width + 36
                ) {
                    setTimeout(() => {
                        this.showToggle = true
                    })
                } else if (this.showToggle == true) {
                    setTimeout(() => {
                        this.showToggle = false
                    })
                }
            }
            
        }
        
    }
})

</script>

<style lang="scss">
@import './../assets/scss/variables.scss';

.site-menu-container {
    position: relative;
    margin: 0;
    padding: 0;
    height: 100vh;
    display: block;
    float: left;
}

.site-menu {
    height: 100%;
    width: 0;
    padding: 32px 0 48px;
    padding-left: 0;
    overflow: hidden;
    margin: 0;
    position: relative;
    background-image: linear-gradient(90deg, rgba(0,0,0,.32),  rgba(0,0,0,.16));
    transition: all ease 0.24s;
}

.__menuOpen {
    .site-menu {
        padding-left: 24px;
        width: 100%;
        min-width: 320px;
    }

    .site-menu-toggle {
        transform: rotateY(180deg);
    }
}

.site-menu-title {
    font-size: 32px;
    margin-bottom: 32px;
    display: inline-block;
    white-space: nowrap;
    font-weight: bold;
    color: #fff;
    text-decoration: none;
}

.site-menu-list {
    display: flex;
    flex-flow: column;
}

.site-menu-list-item {
    color: #fff;
    white-space: nowrap;
    display: block;
    margin-bottom: 8px;
    width: 100%;
    text-decoration: none;
    position: relative;
    margin-left: 16px;
    cursor: pointer;
    transition: .24s all ease;

    &:hover,
    &:focus {
        color: $accentColor;
        margin-left: 24px;
        &:before {
            color: #fff;
            left: -24px;
        }
    }
    &:before {
        position: absolute;
        transition: .24s all ease;
        left: -16px;
        content: "";
        width: 2px;
        background-color: currentColor;
        display: inline-block;
        height: 100%;
    }

    &.__isCurrent {
        color: #fff;
        &:before {
            color: $accentColor;
        }
    }
}

.site-menu-toggle {
    position: absolute;
    width: 0;
    background-color: rgba(0,0,0,.16);
    padding: 16px 0;
    overflow: hidden;
    text-align: center;
    cursor: pointer;
    top: 50%;
    z-index: 2021;
    right: -32px;
    font-size:32px;
    transition: all ease 0.24s;

    &.__isVisible {
        width: 32px;
        opacity: 1;
    }
}
</style>