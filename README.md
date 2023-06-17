# Challenge - Daily Diet API

## What it is
This is an API that saves users' meal info and provides some insights about it. It's the second challenge from the `Rocketseat Ignite` NodeJS course.

## Tech talk
This project uses **Typescript** as the primary language and these essential libraries/frameworks:
### HTTP server
- **Fastify** - a fast and secure web framework, promisingly outperforming ExpressJS, the most used NodeJS framework of this class.
### Validation
- **Zod** - a validation library focused on Typescript first. This lib validates data as it returns the new validated/formatted data in a way that Typescript understands.
### Database
- **Knex** - Knex is the most popular query builder for NodeJS. It was chosen for its simplicity and to teach fundamental database conventions that would be overlooked by using an ORM (which we will use latter in the course).
- **sqlite** - a light relational database, chosen in this project becaus it's good for testing and local development (considering we're not yet using docker). 
### Typescript handling
- **tsx** - although Typescript is a programming language, many environments still need the Javascript output to be able to understand the code. TSX is simple to use transpiler that allows running the code locally without many stressful configs.
- **tsup** - tsup transpiles all the code into JS code and puts it in a new folder to be used in production.
### Testing
- **vitest** - like Fastify, vitest is currently outperforming the most used testing framework, Jest by using Vite natively.
- **supertest** - used in this project to perform integration testing. Supertest creates a server instance that we can use to perform requests to our app endpoints and inspect its responses.