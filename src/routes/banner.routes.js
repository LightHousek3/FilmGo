const express = require("express");
const bannerController = require("../controllers/banner.controller");

const router = express.Router();

router.post("/", bannerController.createBanner);

router.get("/", bannerController.getBanners);

router.get("/:id", bannerController.getBannerById);

router.patch("/:id", bannerController.updateBanner);

router.delete("/:id", bannerController.deleteBanner);

module.exports = router;