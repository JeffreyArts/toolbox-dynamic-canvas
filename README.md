# Toolbox

This repo is a public repository of a personal workflow. It is made to provide a scaffolding for developing concepts, prototypes, or standalone tools. It is up to the user to give it shape according to its own likings. But in the basis it is running Vue, with vue-router, typescript & ES-lint. It also include some modules that I tend to enjoy using.

## Adding routes

While you can just copy-paste routes to create new ones. There is also a `yarn add-route` command, which will create an empty "default" toolbox component route. Including some features.

- Options
The properties within the `this.options` object will be automatically stored in-, and loaded from the local storage. 

- Layout
It uses a standardised lay-out. Which creates consistency that makes it easier for user to understand what's going on. But more importantly, it makes development quicker.


## Deployment

Deployment can be done with the `yarn deploy` command. For more info check out [https://github.com/JeffreyArts/server/wiki/Vite-website-setup](Jeffrey Arts - Vite website setup)