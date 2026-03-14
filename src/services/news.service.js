const { News } = require('../models');

/**
 * Get paginated news list
 * @param {Object} filter
 * @param {Object} options
 */
const getNewsList = async (filter, options) => {
    return News.paginate(filter, options);
};

module.exports = {
    getNewsList,
};
