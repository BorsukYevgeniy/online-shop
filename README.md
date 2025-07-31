# Online-shop

This is my first big project that I built myself.

# About

This is an online store where users can create ads to sell goods.  
A key feature of the platform is the **lack of automatic payment**: buyers and sellers **negotiate directly via the built-in chat**, including payment terms, delivery, and other details.

_Key functionality:_

- **Registration and authorization**
- **User verification via email**
- **Unverified accounts are automatically deleted after 3 days**
- **Role management**
- **CRUD operations for products**
- **Cart**
- **Categories**
- **Built-in chat for private communication**

### Auth

Authentication is implemented using **JWT** tokens, which are stored in **HTTP-only cookies**.  
**Expired tokens are automatically deleted.**  
The project uses **refresh token rotation**: each time tokens are refreshed, the previous refresh token is invalidated and replaced with a new one.  
**Reusing old tokens is not allowed.**

### Cart

**Cart** is a place where you can save products you like.

- Each authenticated user has their own cart stored in the database.
- Users can add or remove products from the cart.
- Users can also clear the cart (remove all products).

### Category

- Products are grouped by categories.
- Only **administrators** can create, update, or delete categories.
- Users can search products by category.
- Products can have one or more categories.

## Technologies

The **online-shop** uses:

- **NestJS** - for the server side
- **EJS** - for client-side rendering
- **WebSockets** - for chatting
- **Swagger** - for API documentation
- **Prisma** - for database access
- **PostgreSQL** - as the main relational database
- **Redis** - for caching
- **Schedule (Cron Jobs)** - for deleting unverified users and expired refresh tokens
- **Email sending** - for user email notifications
- **Jest** - unit testing
- **Supertest** - end-to-end testing

## Architecture

This project includes both a fully functional **REST API** and **server-side rendered pages (SSR)**.

The project follows a **three-layer architecture**:

1. **Controllers** - handle communication with users. Controllers are divided into two types:
   1. **SSR Controllers** - used for rendering pages
   2. **API Controllers** - default **REST API** controllers
2. **Services** - responsible for the business logic of the application
3. **Repositories** - responsible for database interactions

For chatting, **Server-Sent Events (SSE)** are used.

## Requirements

To run the project, you need:

- **Node.js** >= 20.14.0
- **NPM** >= 10.9.0
- **PostgreSQL**
- **Redis**
- **NestJS CLI** (global) `npm i -g @nestjs/cli`
- **.env** file with environment variables
- **SMTP access to a mailbox** (for sending emails to users)

Or if running via Docker:

- **Docker**
- **Docker Compose**
- **.env** file with environment variables
- **SMTP access to a mailbox** (for sending emails to users)

## Features

1. **Pagination** - implemented for all routes where it is needed for better optimization.
2. **Swagger** - OpenAPI documentation is available at the `/docs` route.
3. **Data validation** is implemented in controllers.

## Project setup

```bash
# Installation all dependencies
$ npm install
```

## Compile and run the project

```bash
# Unit tests
$ npm run test

E2e tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## Run tests

```bash
# Unit tests
$ npm run test

# E2e tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## Bugs

If you want report a bug write on this email: devmail473@gmail.com
