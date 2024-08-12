const { pick } = require('lodash');

const getInfoData = ({ field = [], object = {} }) => {
    return pick(object, field);
}

module.exports = {
    getInfoData
}