# Toolbox

This repo is a public repository of a personal workflow. It is made to provide a scaffolding for developing concepts, prototypes, or standalone tools. It is up to the user to give it shape according to its own likings. But in the basis it is running Vue, with Vue-router, Typescript, SASS & ES-lint. It also include some modules that I tend to enjoy using.

## Installation

In order to use this application, you'll need to have NodeJS & git installed on your machine. My preferred choice is to install [Node Version Manager](https://github.com/nvm-sh/nvm), this command line tool will allow you very easily to maintain multiple versions of NodeJS. When you have cloned this repository you'll navigate to it via the terminal and execute the following code:
```
npm install
```

This will install all the dependencies that are required for running this project. When the installation is done, you can run the applcation via `npm run dev`. This will set-up a local webserver with hot-reload, reflecting all your code changes in real-time.


## Adding routes

While you can just copy-paste routes to create new ones. There is also a `npm run add-route` command, which will create an empty "default" toolbox component route. Including some features.

- Options
The properties within the `this.options` object will be automatically stored in-, and loaded from the local storage. 

- Layout
It uses a standardised lay-out. Which creates consistency that makes it easier for user to understand what's going on. But more importantly, it makes development quicker.


## Deployment

Deployment can be done with the `npm run deploy` command. For more info check out [https://github.com/JeffreyArts/server/wiki/Vite-website-setup](Jeffrey Arts - Vite website setup)