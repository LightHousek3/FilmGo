const express = require("express");
const { movieController } = require("../controllers");
const { authenticate, authorize, validate } = require("../../src/middlewares");
const { USER_ROLE } = require("../../src/constants");
const { movieValidator } = require("../validators");

const router = express.Router();

// ═══════════════════════════════════════════════
// Public routes
// ═══════════════════════════════════════════════

/**
 * @route   GET /api/v1/movies/now-showing
 * @access  Public
 */
router.get("/now-showing", validate(movieValidator.getNowShowingMovies), movieController.getNowShowingMovies);

/**
 * @route   GET /api/v1/movies/coming-soon
 * @access  Public
 */
router.get("/coming-soon", validate(movieValidator.getUpcomingMovies), movieController.getUpcomingMovies);

/**
 * @route   GET /api/v1/movies
 * @access  Public
 */
router.get("/", validate(movieValidator.getMovies), movieController.getMovies);

/**
 * @route   GET /api/v1/movies/:id
 * @access  Public
 */
router.get("/:id", movieController.getMovie);

// ═══════════════════════════════════════════════
// Admin-only routes
// ═══════════════════════════════════════════════

/**
 * @route   POST /api/v1/movies/
 * @access  Private (Admin)
 */
router.post(
  "/",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  validate(movieValidator.createMovie),
  movieController.createMovie,
);

/**
 * @route   PUT /api/v1/movies/:id
 * @access  Private (Admin)
 */
router.put(
  "/:id",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  validate(movieValidator.updateMovie),
  movieController.updateMovie,
);

/**
 * @route   DELETE /api/v1/movies/:id
 * @access  Private (Admin)
 */
router.delete(
  "/:id",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  validate(movieValidator.deleteMovie),
  movieController.deleteMovie,
);

module.exports = router;
