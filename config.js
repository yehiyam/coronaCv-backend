const config = {
    PORT: process.env.PORT || 3000,
    dbConfig: {
        connection: process.env.DB_CONNECTION || 'mongodb://localhost/test'
    }
}

module.exports = config;