const { User } = require('../models');
const { ApiError } = require('../utils');
const { httpStatus, messages, USER_STATUS } = require('../constants');
const tokenService = require('./token.service');

/**
 * Register a new user
 * @param {Object} body - Registration data
 * @returns {Object} { user, tokens }
 */
const register = async (body) => {
    if (await User.isEmailTaken(body.email)) {
        throw new ApiError(httpStatus.CONFLICT, messages.AUTH.EMAIL_ALREADY_EXISTS);
    }

    const user = await User.create({
        ...body,
        status: USER_STATUS.ACTIVE, // Change to INACTIVE if email verification is required
    });

    const tokens = await tokenService.generateAuthTokens(user, body.deviceId);

    return { user, tokens };
};

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @param {string} [deviceId]
 * @returns {Object} { user, tokens }
 */
const login = async (email, password, deviceId) => {
    const user = await User.findOne({ email });

    if (!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(httpStatus.UNAUTHORIZED, messages.AUTH.INVALID_CREDENTIALS);
    }

    if (user.status === USER_STATUS.BLOCKED) {
        throw new ApiError(httpStatus.FORBIDDEN, messages.AUTH.ACCOUNT_BLOCKED);
    }

    if (user.status === USER_STATUS.INACTIVE) {
        throw new ApiError(httpStatus.FORBIDDEN, messages.AUTH.ACCOUNT_INACTIVE);
    }

    const tokens = await tokenService.generateAuthTokens(user, deviceId);

    return { user, tokens };
};

/**
 * Logout - revoke refresh token
 * @param {string} refreshToken
 */
const logout = async (refreshToken) => {
    await tokenService.revokeRefreshToken(refreshToken);
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Object} { accessToken, refreshToken, user }
 */
const refreshTokens = async (refreshToken) => {
    return tokenService.refreshAuthTokens(refreshToken);
};

module.exports = {
    register,
    login,
    logout,
    refreshTokens,
};
