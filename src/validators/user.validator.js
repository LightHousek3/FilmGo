const Joi = require('joi');
const { idParam } = require('./custom.validator');
const { USER_STATUS } = require('../constants');

const changeStatus = {
    params: idParam.params,
    body: Joi.object().keys({
        status: Joi.string().valid(...Object.values(USER_STATUS)).required(),
    }),
};

module.exports = {
    changeStatus,
};
