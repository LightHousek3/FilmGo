const { User } = require('../models');
const { ApiError } = require('../utils');
const { messages } = require('../constants');

/**
 * Get users with optional filtering and pagination
 * @param {Object} filter
 * @param {Object} options
 */
const getUsers = async (filter, options) => {
    return User.paginate(filter, options);
};

const updateUserStatus = async (id, status) => {
    const user = await User.findById(id);
    if (!user) {
        throw ApiError.notFound(messages.CRUD.NOT_FOUND('User'));
    }
    user.status = status;
    await user.save();
    return user;
};

module.exports = {
    getUsers,
    updateUserStatus,
};
