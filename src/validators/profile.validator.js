const Joi = require("joi");

// ======================
// UPDATE PROFILE
// ======================
const updateProfile = {
    body: Joi.object().keys({

        firstName: Joi.string()
            .trim()
            .max(10),

        lastName: Joi.string()
            .trim()
            .max(10),

        phone: Joi.string()
            .pattern(/^[0-9]{10,11}$/)
            .messages({
                "string.pattern.base": "Phone must be 10-11 digits"
            }),

        avatar: Joi.string()
            .uri(),

        dateOfBirth: Joi.date()
    })
};


// ======================
// CHANGE PASSWORD
// ======================
const changePassword = {
  body: Joi.object().keys({

    currentPassword: Joi.string()
      .required()
      .messages({
        "any.required": "Current password is required"
      }),

    newPassword: Joi.string()
      .min(6)
      .pattern(/^(?=.*[A-Za-z])(?=.*[!@#$%^&*])/)
      .required()
      .messages({
        "string.min": "Password must be at least 6 characters",
        "string.pattern.base": "Password must contain at least 1 letter and 1 special character"
      }),

    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Confirm password must match new password"
      })

  })
};

module.exports = {
    updateProfile,
    changePassword
};