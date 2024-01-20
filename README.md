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
- Download the latest UI on the same folder from [Frontend source](https://github.com/walterlarrea/messaging-app-ui)
```shell
same-folder/
	messaging-app-rest-backend/
		backend-project-files
	messaging-app-ui/
		frontend-project-files
```

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

### 4. Configure the variables in `.env.test`, `.env.development` and `.env.production`

```
SERVER_PORT= Api server port # 8080 for production environment
NODE_ENV=EXAMPLE # Must be one of [TEST, PRODUCTION, or DEVELOPMENT]
JWT_SECRET= The secret or private key to sign tokens with


MYSQL_URI= Database host url # mysql service name on your docker-compose file
MYSQL_PORT= Database port to mysql server # 3306 default
MYSQL_USER= Database user name
MYSQL_PASSWORD= Database user password
MYSQL_DATABASE= Database name, which should be different for each environment

MYSQL_ROOT_PASSWORD= The root password for the mysql server


MONGO_HOST= Database host url # mongo service name on your docker-compose file
MONGO_PORT= Database port to mysql server # 27017 default
MONGO_USERNAME= Database user name
MONGO_PASSWORD= Database user password
MONGO_DATABASE= Database name, which should be different for each environment

MONGO_ROOT_USERNAME= The root username for the mongo server
MONGO_ROOT_PASSWORD= The root password for the mongo server


ME_CONFIG_USERNAME= Web user for mongo-express
ME_CONFIG_PASSWORD= Web password for mongo-express
```

### 5. Copy the SQL init file to `init.sql` inside "/docker/provision/mysql/init/"

_This script will be used for the mysql server initial configuration, databases and users_

```shell
cp /docker/provision/mysql/init/exampleinit.sql /docker/provision/mysql/init/init.sql
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

### 7. Copy the MONGO init file to `init-script.js` inside "/docker/provision/mongo/init/"

_This script will be used for the mongo server initial configuration, databases and users_

```shell
cp /docker/provision/mongo/init/exampleinit-script.js /docker/provision/mongo/init/init-script.js
```

### 8. Configure the user and database names, as well as collections in `init-script.js`

_This will be used to initialize the mongo server in a docker container_

```
production = db.getSiblingDB('DB_NAME_HERE')

production.createUser({
	user: 'USER_NAME_HERE',
	pwd: 'USER_PSW_HERE',
	roles: [
		{
			role: 'readWrite',
			db: 'DB_NAME_HERE',
		},
	],
})
production.createCollection('COLLECTION_NAME', { capped: false })
production.createCollection('OTHER_COLLECTION_NAME', { capped: false })
.
.
...
```

### 9. Build api's frontend & docker image

[Frontend source](https://github.com/walterlarrea/messaging-app-ui)
_Having the frontend project's folders like this:_

```shell
common-folder/
	messaging-app-rest-backend/
		backend-project-files
	messaging-app-ui/
		frontend-project-files
```

```shell
npm run build:ui
```

### 10. Deploy infrastructure

```shell
npm run build:docker
```

```shell
npm run deploy:docker
```

_This command will:_

- Deploy docker containers for the Api, MySql server, MongoDB server, and MongoDb web interface
- Create users and databases on the SQL & noSQL servers

### 11. On your 'messaging_app_api" docker container run the following command

```shell
npm run db:deploy:production
```

_This command will migrate tables / schemas to the production database_

### 12. Check server status

- Visit [http://localhost:5000](http://localhost:5000) in your browser

## Tests

### Integration tests are run using Node's Test Runner with the following command

```shell
npm test
```

## Fully automated production environment is in progress
