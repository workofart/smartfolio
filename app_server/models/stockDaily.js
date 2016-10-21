var Sequelize = require('sequelize');

var attributes = {
    insertid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ticker: {
        type: Sequelize.STRING(8)
    },
    // name: {
    //     type: Sequelize.STRING(256)
    // },
    datetime: {
        type: Sequelize.DATE
    },
    open: {
        type: Sequelize.DOUBLE
    },
    close: {
        type: Sequelize.DOUBLE
    },
    high: {
        type: Sequelize.DOUBLE
    },
    low: {
        type: Sequelize.DOUBLE
    }
};

var options = {
    freezeTableName: true
};

module.exports.attributes = attributes;
module.exports.options = options;