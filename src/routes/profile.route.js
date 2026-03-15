const express = require("express");
const { authenticate } = require("../middlewares");
const profileController = require("../controllers/profile.controller");

const router = express.Router();

// GET PROFILE
router.get("/", authenticate, profileController.getProfile);

// UPDATE PROFILE
router.put("/edit", authenticate, profileController.updateProfile);

// CHANGE PASSWORD
router.put("/change-password", authenticate, profileController.changePassword);

module.exports = router;