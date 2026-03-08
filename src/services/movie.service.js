const mongoose = require("mongoose");
const { Movie, Showtime } = require("../models");
const { ApiError } = require("../utils");
const { httpStatus, messages } = require("../constants");

const createMovie = async (body) => {
  const existing = await Movie.findOne({ title: body.title });
  if (existing) {
    throw ApiError.conflict(messages.CRUD.ALREADY_EXISTS("Movie"));
  }
  return Movie.create(body);
};

const getMovies = async (filter, options) => {
  // Check if location filter exists
  if (filter.location) {
    const location = filter.location;
    delete filter.location; // Remove location from filter object

    // Use aggregation to join with Showtime, Screen, and Theater
    const aggregationPipeline = [
      // Match movies by other criteria
      { $match: filter },
      // Join with Showtime
      {
        $lookup: {
          from: "showtimes",
          localField: "_id",
          foreignField: "movie",
          as: "showtimes",
        },
      },
      // Join Screen through Showtime
      {
        $unwind: "$showtimes",
      },
      {
        $lookup: {
          from: "screens",
          localField: "showtimes.screen",
          foreignField: "_id",
          as: "screen",
        },
      },
      {
        $unwind: "$screen",
      },
      // Join Theater through Screen
      {
        $lookup: {
          from: "theaters",
          localField: "screen.theater",
          foreignField: "_id",
          as: "theater",
        },
      },
      {
        $unwind: "$theater",
      },
      // Match by location
      {
        $match: {
          "theater.location": location,
        },
      },
      // Group back to get unique movies
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          genres: { $first: "$genres" },
          description: { $first: "$description" },
          author: { $first: "$author" },
          image: { $first: "$image" },
          trailer: { $first: "$trailer" },
          type: { $first: "$type" },
          duration: { $first: "$duration" },
          origin: { $first: "$origin" },
          releaseDate: { $first: "$releaseDate" },
          endDate: { $first: "$endDate" },
          ageRating: { $first: "$ageRating" },
          actors: { $first: "$actors" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
    ];

    // Handle populate option
    if (options.populate) {
      const populateFields = options.populate.split(",").map(f => f.trim());
      
      if (populateFields.includes("genres")) {
        aggregationPipeline.push({
          $lookup: {
            from: "genres",
            localField: "genres",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  id: "$_id",
                  _id: 0,
                },
              },
            ],
            as: "genres",
          },
        });
      }
    }

    const result = await Movie.aggregate(aggregationPipeline);
    // Return paginated result
    const limit = Math.min(Math.max(parseInt(options.limit, 10) || 10, 1), 100);
    const page = Math.max(parseInt(options.page, 10) || 1, 1);
    const skip = (page - 1) * limit;
    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const results = result.slice(skip, skip + limit);

    return {
      results,
      meta: {
        page,
        limit,
        totalResults: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  return Movie.paginate(filter, options);
};

const getMovieById = async (id) => {
  const movie = await Movie.findById(id).populate('genres');
  if (!movie) {
    throw ApiError.notFound(messages.CRUD.NOT_FOUND("Movie"));
  }
  return movie;
};

const ensureMovieDateWindowNotShrunk = async ({ movieId, releaseDate, endDate }) => {
  const [showtimeBoundary] = await Showtime.aggregate([
    {
      $match: {
        movie: new mongoose.Types.ObjectId(movieId),
      },
    },
    {
      $group: {
        _id: null,
        earliestStart: { $min: "$startTime" },
        latestEnd: { $max: "$endTime" },
        total: { $sum: 1 },
      },
    },
  ]);

  if (!showtimeBoundary || showtimeBoundary.total === 0) {
    return;
  }

  const normalizedReleaseDate = new Date(releaseDate);
  const normalizedEndDate = new Date(endDate);

  if (
    normalizedReleaseDate > showtimeBoundary.earliestStart
    || normalizedEndDate < showtimeBoundary.latestEnd
  ) {
    throw ApiError.badRequest(messages.VALIDATION.MOVIE_DATE_RANGE_CANNOT_SHRINK);
  }
};

const updateMovieById = async (id, updateBody) => {
  const movie = await getMovieById(id);

  const effectiveReleaseDate = updateBody.releaseDate || movie.releaseDate;
  const effectiveEndDate = updateBody.endDate || movie.endDate;

  if (effectiveReleaseDate && effectiveEndDate) {
    await ensureMovieDateWindowNotShrunk({
      movieId: movie._id,
      releaseDate: effectiveReleaseDate,
      endDate: effectiveEndDate,
    });
  }

  Object.assign(movie, updateBody);
  await movie.save();
  return movie;
};

const deleteMovieById = async (id) => {
  const movie = await getMovieById(id);
  await movie.softDelete();
  return movie;
};

module.exports = {
  createMovie,
  getMovies,
  getMovieById,
  updateMovieById,
  deleteMovieById,
};
