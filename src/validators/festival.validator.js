// Import Joi library for request validation
const Joi = require('joi');

// =====================================================
// VALIDATION FOR CREATE FESTIVAL
// =====================================================
const createFestival = {
  body: Joi.object().keys({

    // Festival title
    // - required
    // - remove whitespace at beginning/end
    // - minimum 3 characters
    // - maximum 100 characters
    title: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .required()
      .messages({
        "string.empty": "Festival title is required",
        "string.min": "Title must be at least 3 characters",
        "string.max": "Title cannot exceed 100 characters"
      }),

    // Festival image
    // - optional field
    // - must be image filename with extension jpg / jpeg / png
    image: Joi.string()
      .pattern(/\.(jpg|jpeg|png)$/)
      .optional()
      .messages({
        "string.pattern.base": "Image must be jpg or png"
      }),

    // Festival description / content
    // - optional
    // - limit to 1000 characters
    content: Joi.string()
      .min(10)
      .max(1000)
      .optional()
      .messages({
        "string.min": "Content must be at least 10 characters",
        "string.max": "Content cannot exceed 1000 characters"
      }),

    // Festival start time
    // - required
    // - must be a valid date
    startTime: Joi.date()
      .greater('now')
      .required()
      .messages({
        "date.base": "Start time must be a valid date",
        "date.greater": "Start time cannot be in the past"
      }),

    // Festival end time
    // - required
    // - must be greater than startTime
    endTime: Joi.date()
      .required()
      .greater(Joi.ref('startTime'))
      .messages({
        "date.greater": "End time must be greater than start time"
      })
  })
};

// =====================================================
// VALIDATION FOR UPDATE FESTIVAL
// =====================================================
const updateFestival = {
  body: Joi.object().keys({

    // title is optional when updating
    title: Joi.string().trim().min(3).max(100),

    // image must still follow valid format
    image: Joi.string().pattern(/\.(jpg|jpeg|png)$/),

    // content max length validation
    content: Joi.string().max(1000),

    // allow updating start time
    startTime: Joi.date(),

    // allow updating end time
    endTime: Joi.date()
  })
};

// Export validations to use in routes
module.exports = {
  createFestival,
  updateFestival
};