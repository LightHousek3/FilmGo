const { authService } = require('../services');
const { asyncHandler, ResponseHandler } = require('../utils');
const { httpStatus, messages } = require('../constants');
const config = require('../config');

/**
 * POST /auth/register
 * Register new user → sends verification email, account is INACTIVE
 */
const register = asyncHandler(async (req, res) => {
    const { user } = await authService.register(req.body);

    ResponseHandler.created(res, {
        message: messages.AUTH.REGISTER_SUCCESS,
        data: { user },
    });
});

/**
 * GET /auth/verify-email?token=xxx
 * Verify email from link sent to user's inbox
 */
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;
    const { user } = await authService.verifyEmail(token);

    ResponseHandler.success(res, {
        message: messages.AUTH.EMAIL_VERIFIED,
        data: { user },
    });
});

/**
 * POST /auth/resend-verification
 * Resend the email verification link
 */
const resendVerificationEmail = asyncHandler(async (req, res) => {
    await authService.resendVerificationEmail(req.body.email);

    // Always return success (security: don't reveal if email exists)
    ResponseHandler.success(res, {
        message: messages.AUTH.RESEND_VERIFICATION_SENT,
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
    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(refreshToken);

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
 * POST /auth/forgot-password
 * Send password reset email
 */
const forgotPassword = asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);

    // Always return success (security: don't reveal if email exists)
    ResponseHandler.success(res, {
        message: messages.AUTH.FORGOT_PASSWORD_SENT,
    });
});

/**
 * POST /auth/reset-password?token=xxx
 * Reset password using token from email
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;
    await authService.resetPassword(token, password);

    ResponseHandler.success(res, {
        message: messages.AUTH.RESET_PASSWORD_SUCCESS,
    });
});

/**
 * POST /auth/resend-forgot-password
 * Resend password reset email
 */
const resendForgotPassword = asyncHandler(async (req, res) => {
    await authService.resendForgotPassword(req.body.email);

    ResponseHandler.success(res, {
        message: messages.AUTH.FORGOT_PASSWORD_SENT,
    });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    verifyEmail,
    resendVerificationEmail,
    login,
    logout,
    refreshTokens,
    getMe,
    forgotPassword,
    resetPassword,
    resendForgotPassword,
};
