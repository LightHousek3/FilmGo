const { movieService } = require("../services");
const { asyncHandler, ResponseHandler, pick } = require("../utils");
const { messages } = require("../constants");

const createMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.createMovie(req.body);
  ResponseHandler.created(res, {
    message: messages.CRUD.CREATED("Movie"),
    data: movie,
  });
});

const getMovies = asyncHandler(async (req, res) => {
  const filter = pick(req.query, [
    "title",
    "genres",
    "type",
    "origin",
    "ageRating",
    "releaseDate",
    "endDate",
    "location",
  ]); // {} nếu không muốn lọc theo trường nào
  const options = pick(req.query, ["sortBy", "limit", "page", "populate"]);
  const result = await movieService.getMovies(filter, options);

  ResponseHandler.paginated(res, {
    message: messages.CRUD.LIST_FETCHED("Movies"),
    data: result.results,
    meta: result.meta,
  });
});

const getMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.getMovieById(req.params.id);
  ResponseHandler.success(res, {
    message: messages.CRUD.FETCHED("Movie"),
    data: movie,
  });
});

const updateMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.updateMovieById(req.params.id, req.body);
  ResponseHandler.success(res, {
    message: messages.CRUD.UPDATED("Movie"),
    data: movie,
  });
});

const deleteMovie = asyncHandler(async (req, res) => {
  await movieService.deleteMovieById(req.params.id);
  ResponseHandler.success(res, {
    message: messages.CRUD.DELETED("Movie"),
  });
});

const getNowShowingMovies = asyncHandler(async (req, res) => {
  const now = new Date();
  const filter = { releaseDate: { $lte: now }, endDate: { $gte: now } };
  if (req.query.location) {
    filter.location = req.query.location;
  }
  const options = pick(req.query, ["sortBy", "limit", "page", "populate"]);
  const result = await movieService.getMovies(filter, options);

  ResponseHandler.paginated(res, {
    message: messages.CRUD.LIST_FETCHED("Now Showing Movies"),
    data: result.results,
    meta: result.meta,
  });
});

const getUpcomingMovies = asyncHandler(async (req, res) => {
  const now = new Date();
  const filter = { releaseDate: { $gt: now } };
  if (req.query.location) {
    filter.location = req.query.location;
  }
  const options = pick(req.query, ["sortBy", "limit", "page", "populate"]);
  const result = await movieService.getMovies(filter, options);

  ResponseHandler.paginated(res, {
    message: messages.CRUD.LIST_FETCHED("Upcoming Movies"),
    data: result.results,
    meta: result.meta,
  });
});

module.exports = {
  createMovie,
  getMovies,
  getMovie,
  updateMovie,
  deleteMovie,
  getNowShowingMovies,
  getUpcomingMovies,
};
