const Joi = require('joi');
const { password } = require('./custom.validator');

const register = {
    body: Joi.object().keys({
        firstName: Joi.string().required().max(10).trim(),
        lastName: Joi.string().required().max(10).trim(),
        email: Joi.string().required().email().max(50),
        password: Joi.string().required().custom(password),
        phone: Joi.string().pattern(/^[0-9]{10,11}$/).allow(null, ''),
    }),
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
        deviceId: Joi.string().allow(null, ''),
    }),
};

const refreshToken = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

const logout = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

const verifyEmail = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    }),
};

const resendVerificationEmail = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
    }),
};

const forgotPassword = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
    }),
};

const resetPassword = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    }),
    body: Joi.object().keys({
        password: Joi.string().required().custom(password),
    }),
};

const resendForgotPassword = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
    }),
};

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    resendForgotPassword,
};

