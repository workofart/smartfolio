var Sequelize = require('sequelize');

var attributes = {
    portfolioid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userid: {
        type: Sequelize.INTEGER,
    },
    portfolioname: {
        type: Sequelize.STRING,
    },
    balance: {
        type: Sequelize.DOUBLE,
    },
    isactive: {
        type: Sequelize.BOOLEAN
    }
};

var options = {
    freezeTableName: true
};

module.exports.attributes = attributes;
module.exports.options = options;