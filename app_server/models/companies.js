var Sequelize = require('sequelize');

var attributes = {
    companyid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ticker: {
        type: Sequelize.STRING,
    },
    name: {
        type: Sequelize.STRING,
    },
    exchange: {
        type: Sequelize.STRING,
    }
};

var options = {
    freezeTableName: true
};

module.exports.attributes = attributes;
module.exports.options = options;