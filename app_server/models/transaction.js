var Sequelize = require('sequelize');

var attributes = {
    transactionid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    portfolioid: {
        type: Sequelize.INTEGER
    },
    datetime: {
        type: Sequelize.DATE
    },
    ticker: {
        type: Sequelize.STRING(8)
    },
    quantity: {
        type: Sequelize.INTEGER
    },
    price: {
        type: Sequelize.DOUBLE
    }
};

var options = {
    freezeTableName: true
};

module.exports.attributes = attributes;
module.exports.options = options;