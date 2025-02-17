# Practice with NestJS and Prisma

A Node.js application built with NestJS framework and Prisma ORM for database operations.

## Project Overview

This project demonstrates the integration of NestJS with Prisma, featuring:
- User and Post model relationships
- MySQL database integration
- RESTful API architecture

## Prerequisites

- Node.js
- MySQL database
- npm or yarn

## Installation
- npm install

## Database Setup

1. Configure your database connection by creating a `.env` file: 
- DATABASE_URL="mysql://user:password@localhost:3306/your_database"

2. Run Prisma migrations:
- npx prisma migrate dev

## Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with watch
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npx tsx scripts` - Insert data into database

## Project Structure

- `src/` - Source code directory
- `prisma/` - Prisma schema and migrations
- `test/` - Test files

## License

UNLICENSED