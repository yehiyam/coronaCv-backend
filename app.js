const express = require('express');
const { promisify } = require('util')
const delay = promisify(setTimeout);
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('./lib/middlewares/cors');
const errors = require('./lib/middlewares/errors');
const swaggerRoute = require('./lib/middlewares/swagger-route');
const monitorImage = require('./lib/routes/monitor-image')
const monitorSetup = require('./lib/routes/monitor-setup')
const monitors = require('./lib/routes/monitor')

const db = require('./lib/storage/mongo');
const { PORT, dbConfig } = require('./config');

const _handleErrors = () => {
    process.on('exit', (code) => {
        console.log(`exit code ${code}`);
    });
    process.on('SIGINT', () => {
        console.log('SIGINT');
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        console.log('SIGTERM');
        process.exit(0);
    });
    process.on('unhandledRejection', (error) => {
        console.error(`unhandledRejection: ${error.message}`, error);
        // process.exit(1);
    });
    process.on('uncaughtException', (error) => {
        console.error(`uncaughtException: ${error.message}`, error);
        process.exit(1);
    });
}

const main = async () => {
    _handleErrors()
    let dbInit = false
    while (!dbInit) {
        try {
            await db.init(dbConfig);
            dbInit = true
            console.log('db connected')
        } catch (error) {
            console.error(error.message)
            await delay(1000)
        }
    }
    const app = express();
    app.use(cors); // CORS middleware
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.raw({
        type: 'image/jpeg',
        limit: '10mb'
    }));
    app.use('/swagger-api', swaggerRoute(path.join(__dirname, './lib/swagger/openapi.json')));
    app.use(express.static(path.join(__dirname, './static')));
    // add routes
    const routes = [
        monitorImage,
        monitorSetup,
        monitors
    ]
    routes.forEach(r => {
        const route = r();
        app.use(route.path, route.router)
    })
    app.use(errors);

    app.listen(PORT, () => {
        console.log('Server is up and running on port ' + PORT);
    });
}

main();