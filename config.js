const config = {
    PORT: process.env.PORT || 3000,
    dbConfig: {
        connection: process.env.DB_CONNECTION || 'mongodb://localhost/test'
    },
    cvConfig:{
        host: process.env.CVMONITOR_HOST || 'localhost',        
        port: process.env.CVMONITOR_PORT || '8080',     
        schema: 'http'   
    }
}

module.exports = config;