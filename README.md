<div align="center">
  <h1 align="center">MessagingApp API</h1>
  <h3>Backend for MessagingApp</h3>
</div>

This api manages access control and data persistance for MessagingApp.
Using continuous integration pipelines assures continuous delivery of functionality and good developer experience.
Such as database migration and deployment, containerization, code linting and formatting, ORM for database access & management.

Built on top of Node.js & Express.js, with technologies like Github Actions, Docker, Drizzle ORM, MySQL and more.

<!-- ## Architecture diagram -->

<!-- Diagram slot -->

## Features

- **Secure:** Using a security first approach, for data and infrastructure
- **Reliable:** Embracing comprehensive testing & code quality

## Tech Stack

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [Drizzle ORM](https://orm.drizzle.team/)

## Packages

- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [Jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [Express-validator](https://express-validator.github.io/docs)
- [Test Runner](https://nodejs.org/api/test.html)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

## Getting Started

### Prerequisites

Here's what you need to be able to run MessagingApp's API:

- Node.js (version >= 20.10.0)
- Docker (version >= 20)
- Mysql (version >= 8.0)

VSCode recommended Extensions:

- Prettier
- ESLint

### 1. Clone the repository (https example)

```shell
git clone https://github.com/walterlarrea/messaging-app-rest-backend.git
```

- Enter the repository's folder

```shell
cd messaging-app-rest-backend
```

### 2. Install dependencies (npm)

```shell
npm install
```

### 3. Copy the environment variables to `.env.test`, `.env.development` and `.env.production`

_test environment is used by the "test" command, development for "dev", and production with "start" npm command_

```shell
cp .env.example .env.test
cp .env.example .env.development
cp .env.example .env.production
```

### 4. Configure the variables in `.env``.env.test`, `.env.development` and `.env.production`

```
SERVER_PORT= Api server port
JWT_SECRET= The secret or private key to sign tokens with

MYSQL_URI= Database host url
MYSQL_PORT= Database port to expose and bind to docker container
MYSQL_USER= Database user name
MYSQL_PASSWORD= Database user password
MYSQL_DATABASE= Database name, which should be different for each environment

MYSQL_ROOT_PASSWORD= The root password for the mysql server
```

### 5. Copy the SQL init file to `init.sql` inside "./docker/provision/mysql/init/"

_This script will be used for the mysql server initial configuration, databases and users_

```shell
cp exampleinit.sql init.sql
```

### 6. Configure the variables in `init.sql`, these should match the multiple .env files

_This will be used to initialize the mysql server in a docker container_

```
-- Variables
SET @TEST_DATABASE = '';
SET @DEVELOPMENT_DATABASE = '';
SET @PRODUCTION_DATABASE = '';

SET @TEST_USER = '';
SET @PROD_USER = '';
SET @DEV_USER = '';

SET @TEST_USER_PASS = '';
SET @PROD_USER_PASS = '';
SET @DEV_USER_PASS = '';
.
.
...
```

### 7. Build api's docker image

```shell
npm run docker:build
```

### 7. Deploy infrastructure

```shell
npm run docker:setup
```

_This command will:_

- Build a docker container and configure the Mysql server
- Create users and databases on the server
- Deploy test and development schemas to the database

### 8. Run the dev server

```shell
npm run dev
```

### 9. Check server status

- Visit [http://localhost:3001](http://localhost:3001) in your browser
- Or use the SERVER_PORT specified in your .env.development file

## Tests

### Integration tests are run using Node's Test Runner with the following command

```shell
npm test
```

## Fully automated production environment is in progress
