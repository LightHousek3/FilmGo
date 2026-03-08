const crypto = require('crypto');
const { User } = require('../models');
const { ApiError } = require('../utils');
const { httpStatus, messages, USER_STATUS } = require('../constants');
const tokenService = require('./token.service');
const emailService = require('./email.service');
const config = require('../config');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a secure random token and its SHA-256 hash
 * @returns {{ plainToken: string, hashedToken: string }}
 */
const generateSecureToken = () => {
    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
    return { plainToken, hashedToken };
};

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Register a new user (status: INACTIVE until email is verified)
 * @param {Object} body
 * @returns {Object} { user }
 */
const register = async (body) => {
    if (await User.isEmailTaken(body.email)) {
        throw new ApiError(httpStatus.CONFLICT, messages.AUTH.EMAIL_ALREADY_EXISTS);
    }

    const { plainToken, hashedToken } = generateSecureToken();
    const expiresHours = config.email.verificationExpiresHours;

    const user = await User.create({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
        phone: body.phone || null,
        status: USER_STATUS.INACTIVE,
        emailVerificationToken: hashedToken,
        emailVerificationExpires: new Date(Date.now() + expiresHours * 60 * 60 * 1000),
    });

    const verificationUrl = `${config.app.frontendUrl}/verify-email?token=${plainToken}`;

    // Send async — don't block the response
    emailService
        .sendVerificationEmail({
            to: user.email,
            firstName: user.firstName,
            verificationUrl,
        })
        .catch((err) => {
            console.error('[EmailService] Failed to send verification email:', err.message);
        });

    return { user };
};

// ─── Verify Email ─────────────────────────────────────────────────────────────

/**
 * Verify user email using the plain token from the verification link
 * @param {string} token - Plain token from query string
 * @returns {Object} { user }
 */
const verifyEmail = async (token) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, messages.AUTH.INVALID_VERIFICATION_TOKEN);
    }

    if (user.status === USER_STATUS.ACTIVE) {
        throw new ApiError(httpStatus.BAD_REQUEST, messages.AUTH.ALREADY_VERIFIED);
    }

    user.status = USER_STATUS.ACTIVE;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return { user };
};

// ─── Resend Verification Email ────────────────────────────────────────────────

/**
 * Resend the email verification link
 * @param {string} email
 */
const resendVerificationEmail = async (email) => {
    const user = await User.findOne({ email }).select(
        '+emailVerificationToken +emailVerificationExpires'
    );

    // Security: don't reveal if email does not exist
    if (!user) return;

    if (user.status === USER_STATUS.ACTIVE) {
        throw new ApiError(httpStatus.BAD_REQUEST, messages.AUTH.ALREADY_VERIFIED);
    }

    if (user.status === USER_STATUS.BLOCKED) {
        throw new ApiError(httpStatus.FORBIDDEN, messages.AUTH.ACCOUNT_BLOCKED);
    }

    // Rate limit: 1 email per 60 seconds
    const expiresHours = config.email.verificationExpiresHours;
    if (user.emailVerificationExpires) {
        const sentAt = new Date(
            user.emailVerificationExpires.getTime() - expiresHours * 60 * 60 * 1000
        );
        const secondsSinceSent = (Date.now() - sentAt.getTime()) / 1000;
        if (secondsSinceSent < 60) {
            throw new ApiError(httpStatus.TOO_MANY_REQUESTS, messages.AUTH.RESEND_TOO_SOON);
        }
    }

    const { plainToken, hashedToken } = generateSecureToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + expiresHours * 60 * 60 * 1000);
    await user.save();

    const verificationUrl = `${config.app.frontendUrl}/verify-email?token=${plainToken}`;
    await emailService.sendVerificationEmail({
        to: user.email,
        firstName: user.firstName,
        verificationUrl,
    });
};

// ─── Login ────────────────────────────────────────────────────────────────────

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

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Logout - revoke refresh token
 * @param {string} refreshToken
 */
const logout = async (refreshToken) => {
    await tokenService.revokeRefreshToken(refreshToken);
};

// ─── Refresh Tokens ───────────────────────────────────────────────────────────

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Object} { accessToken, refreshToken, user }
 */
const refreshTokens = async (refreshToken) => {
    return tokenService.refreshAuthTokens(refreshToken);
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

/**
 * Initiate forgot password flow — send reset link to email
 * @param {string} email
 */
const forgotPassword = async (email) => {
    const user = await User.findOne({ email }).select(
        '+passwordResetToken +passwordResetExpires'
    );

    // Security: return silently if user not found
    if (!user) return;

    // Don't send to blocked users
    if (user.status === USER_STATUS.BLOCKED) return;

    // Rate limit: 1 reset email per 60 seconds
    const expiresMinutes = config.email.resetPasswordExpiresMinutes;
    if (user.passwordResetExpires) {
        const sentAt = new Date(
            user.passwordResetExpires.getTime() - expiresMinutes * 60 * 1000
        );
        const secondsSinceSent = (Date.now() - sentAt.getTime()) / 1000;
        if (secondsSinceSent < 60) {
            throw new ApiError(httpStatus.TOO_MANY_REQUESTS, messages.AUTH.RESEND_TOO_SOON);
        }
    }

    const { plainToken, hashedToken } = generateSecureToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + expiresMinutes * 60 * 1000);
    await user.save();

    const resetUrl = `${config.app.frontendUrl}/reset-password?token=${plainToken}`;
    await emailService.sendForgotPasswordEmail({
        to: user.email,
        firstName: user.firstName,
        resetUrl,
    });
};

// ─── Reset Password ───────────────────────────────────────────────────────────

/**
 * Reset password using token from email link
 * @param {string} token - Plain token from query string
 * @param {string} newPassword
 */
const resetPassword = async (token, newPassword) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, messages.AUTH.INVALID_RESET_TOKEN);
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    // Revoke all existing refresh tokens for security
    await tokenService.revokeAllUserTokens(user._id);

    // Notify user of password change
    emailService
        .sendPasswordChangedEmail({
            to: user.email,
            firstName: user.firstName,
        })
        .catch((err) => {
            console.error('[EmailService] Failed to send password changed email:', err.message);
        });
};

// ─── Resend Forgot Password ───────────────────────────────────────────────────

/**
 * Resend password reset email (same logic as forgotPassword)
 * @param {string} email
 */
const resendForgotPassword = async (email) => {
    await forgotPassword(email);
};

module.exports = {
    register,
    verifyEmail,
    resendVerificationEmail,
    login,
    logout,
    refreshTokens,
    forgotPassword,
    resetPassword,
    resendForgotPassword,
};
