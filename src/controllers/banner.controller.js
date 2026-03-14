const Banner = require("../models/banner.model");
const bannerValidation = require("../validators/banner.validator");

// CREATE BANNER
exports.createBanner = async (req, res) => {
  try {

    // validate body
    const { error } = bannerValidation.createBanner.body.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // check duplicate url
    const existingBanner = await Banner.findOne({ url: req.body.url });

    if (existingBanner) {
      return res.status(400).json({
        success: false,
        message: "Banner URL already exists"
      });
    }

    const banner = await Banner.create(req.body);

    res.status(201).json({
      success: true,
      data: banner
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET ALL BANNERS
exports.getBanners = async (req, res) => {
  try {

    const banners = await Banner.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: banners
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET BANNER BY ID
exports.getBannerById = async (req, res) => {
  try {

    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }

    res.json({
      success: true,
      data: banner
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE BANNER
exports.updateBanner = async (req, res) => {
  try {

    // validate body
    const { error } = bannerValidation.updateBanner.body.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // check duplicate url
    if (req.body.url) {
      const existingBanner = await Banner.findOne({ url: req.body.url });

      if (existingBanner && existingBanner._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: "Banner URL already exists"
        });
      }
    }

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }

    res.json({
      success: true,
      data: banner
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE BANNER
exports.deleteBanner = async (req, res) => {
  try {

    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }

    res.json({
      success: true,
      message: "Banner deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};