const config = {
    PORT: process.env.PORT || 3000,
    dbConfig: {
        connection: process.env.DB_CONNECTION || 'mongodb://localhost/test'
    },
    cvConfig:{
        host: process.env.CVMONITOR_HOST || 'localhost',        
        port: process.env.CVMONITOR_PORT || '8088',     
        schema: 'http',
        path: '/v1'  
    }
}

module.exports = config;