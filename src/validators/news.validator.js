const Joi = require("joi");
const { objectId } = require("./custom.validator");

const { paginationQuery } = require('./custom.validator');

const createNews = {
    body: Joi.object().keys({
        title: Joi.string().required(),

        subTitle: Joi.string().required(),

        description: Joi.string().required(),

        author: Joi.string().required(),

        category: Joi.string().required(),

        content: Joi.string().required(),

        image: Joi.string().uri().required(),

        publishDate: Joi.date(),

        date: Joi.date().required(),

        endDate: Joi.date(),

        location: Joi.string().required()
    })
};

const updateNews = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required()
    }),

    body: Joi.object().keys({
        title: Joi.string(),

        subTitle: Joi.string(),

        description: Joi.string(),

        author: Joi.string(),

        category: Joi.string(),

        content: Joi.string(),

        image: Joi.string().uri(),

        publishDate: Joi.date(),

        date: Joi.date(),

        endDate: Joi.date(),

        location: Joi.string()
    })
};

const newsId = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required()
    })
};

const getNewsList = {
    query: Joi.object().keys({
        ...paginationQuery,
        category: Joi.string(),
        author: Joi.string(),
        location: Joi.string(),
        select: Joi.string(),
        populate: Joi.string(),
    }),
};

module.exports = {
    createNews,
    updateNews,
    newsId,
    getNewsList,
};