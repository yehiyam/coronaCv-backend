const express = require('express');
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
const main = async () => {
    await db.init(dbConfig);
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