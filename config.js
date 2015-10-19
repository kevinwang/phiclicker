var config = {};

config.port = 3000;
config.sessionSecret = 'not secret';

config.db = {
    development: {
        host: 'localhost',
        database: 'phiclicker',
        username: 'root',
        password: null,
        logging: console.log
    },
    production: {
        host: 'localhost',
        database: 'phiclicker',
        username: 'root',
        password: null,
        logging: false
    }
};

config.redis = {
    development: {
        host: 'localhost'
    },
    production: {
        host: 'localhost'
    }
};

module.exports = config;
