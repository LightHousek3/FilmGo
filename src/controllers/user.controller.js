const { userService } = require('../services');
const { asyncHandler, ResponseHandler, pick } = require('../utils');
const { messages } = require('../constants');

const getUsers = asyncHandler(async (req, res) => {
    const { username, email } = req.query;

    const filter = pick(req.query, ['status', 'role', 'firstName', 'lastName']);

    // Search by username (matches firstName OR lastName OR email)
    if (username) {
        filter.$or = [
            { firstName: { $regex: username, $options: 'i' } },
            { lastName: { $regex: username, $options: 'i' } },
            { email: { $regex: username, $options: 'i' } },
        ];
    }

    // Search by email (partial, case-insensitive)
    if (email) {
        filter.email = { $regex: email, $options: 'i' };
    }

    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await userService.getUsers(filter, options);

    ResponseHandler.paginated(res, {
        message: messages.CRUD.LIST_FETCHED('Users'),
        data: result.results,
        meta: result.meta,
    });
});

const changeUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = await userService.updateUserStatus(id, status);

    ResponseHandler.success(res, {
        message: messages.CRUD.UPDATED('User'),
        data: user,
    });
});

module.exports = {
    getUsers,
    changeUserStatus,
};