const express = require('express');
const { authController } = require('../../src/controllers');
const { validate, authLimiter, authenticate } = require('../../src/middlewares');
const { authValidator } = require('../../src/validators');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
    '/register',
    authLimiter,
    validate(authValidator.register),
    authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
    '/login',
    authLimiter,
    validate(authValidator.login),
    authController.login
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (revoke refresh token)
 * @access  Public
 */
router.post(
    '/logout',
    validate(authValidator.logout),
    authController.logout
);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
    '/refresh-token',
    validate(authValidator.refreshToken),
    authController.refreshTokens
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
    '/me',
    authenticate,
    authController.getMe
);

module.exports = router;
