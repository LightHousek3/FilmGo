const { authService } = require('../services');
const { asyncHandler, ResponseHandler } = require('../utils');
const { httpStatus, messages } = require('../constants');
const config = require('../config');

/**
 * POST /auth/register
 */
const register = asyncHandler(async (req, res) => {
    const { user, tokens } = await authService.register(req.body);

    // Set refresh token in httpOnly cookie
    setRefreshTokenCookie(res, tokens.refreshToken);

    ResponseHandler.created(res, {
        message: messages.AUTH.REGISTER_SUCCESS,
        data: {
            user,
            tokens: {
                accessToken: tokens.accessToken,
            },
        },
    });
});

/**
 * POST /auth/login
 */
const login = asyncHandler(async (req, res) => {
    const { email, password, deviceId } = req.body;
    const { user, tokens } = await authService.login(email, password, deviceId);

    setRefreshTokenCookie(res, tokens.refreshToken);

    ResponseHandler.success(res, {
        message: messages.AUTH.LOGIN_SUCCESS,
        data: {
            user,
            tokens: {
                accessToken: tokens.accessToken,
                // Also return refresh token in body for mobile clients
                refreshToken: tokens.refreshToken,
            },
        },
    });
});

/**
 * POST /auth/logout
 */
const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (refreshToken) {
        await authService.logout(refreshToken);
    }

    // Clear cookie
    res.clearCookie('refreshToken');

    ResponseHandler.success(res, {
        message: messages.AUTH.LOGOUT_SUCCESS,
    });
});

/**
 * POST /auth/refresh-token
 */
const refreshTokens = asyncHandler(async (req, res) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    const { accessToken, refreshToken: newRefreshToken, user } = await authService.refreshTokens(refreshToken);

    setRefreshTokenCookie(res, newRefreshToken);

    ResponseHandler.success(res, {
        message: messages.AUTH.TOKEN_REFRESHED,
        data: {
            accessToken,
            refreshToken: newRefreshToken,
        },
    });
});

/**
 * GET /auth/me
 */
const getMe = asyncHandler(async (req, res) => {
    ResponseHandler.success(res, {
        data: req.user,
    });
});

/**
 * Set refresh token as httpOnly cookie
 */
const setRefreshTokenCookie = (res, token) => {
    const cookieOptions = {
        httpOnly: true,
        secure: config.cookie.secure,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    };

    if (config.env === 'production') {
        cookieOptions.domain = config.cookie.domain;
    }

    res.cookie('refreshToken', token, cookieOptions);
};

module.exports = {
    register,
    login,
    logout,
    refreshTokens,
    getMe,
};
