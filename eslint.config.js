import js from "@eslint/js"
import typescript from "@typescript-eslint/eslint-plugin"
import typescriptParser from "@typescript-eslint/parser"
import vue from "eslint-plugin-vue"

export default [
    js.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module"
            },
            globals: {
                document: "readonly",
                window: "readonly",
                console: "readonly",
                HTMLElement: "readonly",
                HTMLCanvasElement: "readonly",
                CanvasRenderingContext2D: "readonly",
                Image: "readonly",
                HTMLImageElement: "readonly",
                WheelEvent: "readonly",
                TouchEvent: "readonly",
                TouchList: "readonly",
                requestAnimationFrame: "readonly"
            }
        },
        plugins: {
            "@typescript-eslint": typescript
        },
        rules: {
            "indent": ["error", 4],
            "linebreak-style": ["error", "unix"],
            "quotes": ["error", "double"],
            "semi": ["error", "never"],
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["warn"],
            "no-undef": "off",
            "no-redeclare": "off"
        }
    },
    {
        files: ["**/*.vue"],
        languageOptions: {
            parser: vue.parser,
            parserOptions: {
                parser: {
                    ts: typescriptParser,
                    js: "espree",
                    "<template>": "espree"
                },
                ecmaVersion: "latest",
                sourceType: "module",
                extraFileExtensions: [".vue"]
            },
            globals: {
                document: "readonly",
                window: "readonly",
                console: "readonly"
            }
        },
        plugins: {
            "vue": vue,
            "@typescript-eslint": typescript
        },
        rules: {
            "indent": ["error", 4],
            "linebreak-style": ["error", "unix"],
            "quotes": ["error", "double"],
            "semi": ["error", "never"],
            "vue/html-indent": ["error", 4],
            "vue/order-in-components": ["error", {
                order: [
                    "el",
                    "name",
                    "key",
                    "parent",
                    "functional",
                    ["delimiters", "comments"],
                    ["components", "directives", "filters"],
                    "extends",
                    "mixins",
                    ["provide", "inject"],
                    "ROUTER_GUARDS",
                    "layout",
                    "middleware",
                    "validate",
                    "scrollToTop",
                    "transition",
                    "loading",
                    "inheritAttrs",
                    "model",
                    ["props", "propsData"],
                    "emits",
                    "setup",
                    "asyncData",
                    "data",
                    "fetch",
                    "head",
                    "computed",
                    "watch",
                    "watchQuery",
                    "LIFECYCLE_HOOKS",
                    "methods",
                    ["template", "render"],
                    "renderError"
                ]
            }]
        }
    }
] 