const express = require('express');
const { userController } = require('../../src/controllers');
const { authenticate, authorize, validate } = require('../../src/middlewares');
const { USER_ROLE } = require('../../src/constants');
const { userValidator } = require('../../src/validators');

const router = express.Router();

/**
 * @route   GET /api/v1/users
 * @access  Admin
 */
router.get(
    '/',
    authenticate,
    authorize(USER_ROLE.ADMIN),
    userController.getUsers
);

/**
 * @route   PATCH /api/v1/users/:id/status
 * @access  Admin
 */
router.patch(
    '/:id/status',
    authenticate,
    authorize(USER_ROLE.ADMIN),
    validate(userValidator.changeStatus),
    userController.changeUserStatus
);

module.exports = router;
