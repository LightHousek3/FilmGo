const express = require("express");
const { authenticate, authorize, validate } = require("../../src/middlewares");
const { USER_ROLE } = require("../../src/constants");
const { showtimeValidator } = require("../../src/validators");
const { showtimeController } = require("../controllers");

const router = express.Router();

// ═══════════════════════════════════════════════
// Public routes
// ═══════════════════════════════════════════════

/**
 * @route   GET /api/v1/showtimes/
 * @access  Public
 */
router.get("/", validate(showtimeValidator.getShowtimes), showtimeController.getShowtimes);

/**
 * @route   GET /api/v1/showtimes/:id
 * @access  Public
 */
router.get("/:id", validate(showtimeValidator.getShowtime), showtimeController.getShowtime);

// ═══════════════════════════════════════════════
// Admin-only routes
// ═══════════════════════════════════════════════

/**
 * @route   POST /api/v1/showtimes/
 * @access  Private (Admin)
 */
router.post(
  "/",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  validate(showtimeValidator.createShowtime),
  showtimeController.createShowtime,
);

/**
 * @route   PUT /api/v1/showtimes/:id
 * @access  Private (Admin)
 */
router.put(
  "/:id",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  validate(showtimeValidator.updateShowtime),
  showtimeController.updateShowtime,
);

/**
 * @route   DELETE /api/v1/showtimes/:id
 * @access  Private (Admin)
 */
router.delete(
  "/:id",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  validate(showtimeValidator.deleteShowtime),
  showtimeController.deleteShowtime,
);

module.exports = router;
