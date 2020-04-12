const config = {
    PORT: process.env.PORT || 3000,
    dbConfig: {
        connection: process.env.DB_CONNECTION || 'mongodb://localhost/test'
    },
    cvConfig: {
        host: process.env.CVMONITOR_HOST || 'localhost',
        port: process.env.CVMONITOR_PORT || '8088',
        schema: 'http',
        path: 'v1'
    },
    metricsConfig: {
        collectDefault: false,
        server: {
            // port: process.env.METRICS_PORT || '5000'
        }
    },
    timeouts:{
        saveToDb: process.env.SAVE_TO_DB_TIMEOUT || 10*1000*60
    },
    sendImages: process.env.SEND_IMAGES || "true",
    coviewConfig:{
        host: process.env.COVIEW_HOST || 'localhost',
        port: process.env.COVIEW_PORT || '8080',
        schema: 'http',
        path: '',
        intervalMs: process.env.COVIEW_INTERVAL || '30000',
        enabled: process.env.COVIEW_ENABLED === 'true' || false
    }

}

module.exports = config;