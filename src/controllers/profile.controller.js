const httpStatus = require("http-status");
const User = require("../models/user.model");

// ==============================
// GET PROFILE
// ==============================
const getProfile = async (req, res) => {

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  res.json(user);
};

// ==============================
// UPDATE PROFILE
// ==============================
const updateProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const { firstName, lastName, phone, avatar, dateOfBirth } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    await user.save();

    return res.json({
      message: "Profile updated",
      data: user
    });

  } catch (error) {

    return res.status(400).json({
      message: error.message
    });

  }
};

// ==============================
// CHANGE PASSWORD
// ==============================
const changePassword = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    const { currentPassword, newPassword, confirmPassword } = req.body;

    const match = await user.isPasswordMatch(currentPassword);

    if (!match) {
      return res.status(400).json({
        message: "Current password incorrect"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Confirm password does not match"
      });
    }

    user.password = newPassword;

    await user.save();

    return res.json({
      message: "Password changed successfully"
    });

  } catch (error) {

    return res.status(400).json({
      message: error.message
    });

  }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword
};