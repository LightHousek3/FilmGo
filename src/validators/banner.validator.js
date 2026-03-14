const Joi = require("joi");
const { BANNER_TYPE } = require("../constants");

// ================================
// CREATE BANNER VALIDATION
// ================================
const createBanner = {
  body: Joi.object().keys({

    // Banner type: IMAGE or VIDEO
    type: Joi.string()
      .valid(...Object.values(BANNER_TYPE))
      .required()
      .messages({
        "string.empty": "Banner type is required",
        "any.required": "Banner type is required",
        "any.only": "Banner type must be IMAGE or VIDEO"
      }),

    // Banner URL
    url: Joi.string()
      .trim()
      .uri()
      .required()
      .messages({
        "string.empty": "Banner URL is required",
        "any.required": "Banner URL is required",
        "string.uri": "URL must be a valid link"
      })

  })
};


// ================================
// UPDATE BANNER VALIDATION
// ================================
const updateBanner = {
  body: Joi.object().keys({

    // type optional when updating
    type: Joi.string()
      .valid(...Object.values(BANNER_TYPE))
      .messages({
        "any.only": "Banner type must be IMAGE or VIDEO"
      }),

    // url optional when updating
    url: Joi.string()
      .trim()
      .uri()
      .messages({
        "string.uri": "URL must be a valid link"
      })

  })
};


module.exports = {
  createBanner,
  updateBanner
};