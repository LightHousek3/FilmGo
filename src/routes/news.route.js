const express = require("express");
const router = express.Router();
const newsController = require("../controllers/news.controller");
const { USER_ROLE } = require('../../src/constants');
const { validate, authenticate, authorize } = require('../../src/middlewares');
const newsValidator = require("../validators/news.validator");

/**
 * @route   POST /api/v1/news
 * @access  Admin
 */
router.post("/",
    authenticate,
    authorize(USER_ROLE.ADMIN),
    validate(newsValidator.createNews), 
    newsController.createNews);

/**
 * @route   GET /api/v1/news
 * @access  Public
 */
router.get("/",
    validate(newsValidator.getNewsList),
    newsController.getNewsList);

/**
 * @route   GET /api/v1/news/:id
 * @access  Public
 */
router.get("/:id",
    validate(newsValidator.newsId),
    newsController.getNewsDetail);

/**
 * @route   PUT /api/v1/news/:id
 * @access  Admin
 */
router.put("/:id", 
    authenticate,
    authorize(USER_ROLE.ADMIN),
    validate(newsValidator.updateNews),
    newsController.updateNews);

/**
 * @route   DELETE /api/v1/news/:id
 * @access  Admin
 */
router.delete("/:id", 
    authenticate,
    authorize(USER_ROLE.ADMIN),
    validate(newsValidator.newsId),
    newsController.deleteNews);

module.exports = router;