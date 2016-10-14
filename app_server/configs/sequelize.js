var Sequelize = require('sequelize');

var sequelize = new Sequelize('smartfolio', 'postgres', 'Welcome1', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    pool: {
        max: 10,
        min: 0,
        idle: 30000
    },
    define: {
        timestamps: false
    }
});

module.exports = sequelize;