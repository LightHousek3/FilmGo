const { Showtime, Movie, Screen } = require("../models");
const { ApiError } = require("../utils");
const { messages, SHOWTIME_BUFFER_MINUTES } = require("../constants");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getObjectIdValue = (value) => (value && value._id ? value._id : value);

const ensureValidTimeRange = ({ startTime, endTime }) => {
  const normalizedStart = new Date(startTime);
  const normalizedEnd = new Date(endTime);

  if (!(normalizedStart < normalizedEnd)) {
    throw ApiError.badRequest(messages.VALIDATION.INVALID_TIME_RANGE);
  }

  return { normalizedStart, normalizedEnd };
};

const ensureShowtimeInMovieWindow = ({ movieDoc, startTime, endTime }) => {
  if (!movieDoc?.releaseDate || !movieDoc?.endDate) {
    throw ApiError.badRequest(messages.VALIDATION.MOVIE_SCHEDULE_NOT_CONFIGURED);
  }

  const movieStart = new Date(movieDoc.releaseDate);
  const movieEnd = new Date(movieDoc.endDate);

  // Inclusive boundaries: showtime is valid when it does not exceed movie window.
  if (startTime < movieStart || endTime > movieEnd) {
    throw ApiError.badRequest(messages.VALIDATION.SHOWTIME_OUTSIDE_MOVIE_RANGE);
  }
};

const ensureNoOverlappingShowtimeInScreen = async ({
  screen,
  startTime,
  endTime,
  excludeShowtimeId,
}) => {
  // Add buffer time (in milliseconds) to prevent showtimes from being too close
  const bufferMs = SHOWTIME_BUFFER_MINUTES * 60 * 1000;

  const overlapQuery = {
    screen: getObjectIdValue(screen),
    // Check if any showtime overlaps with [startTime - buffer, endTime + buffer]
    endTime: { $gt: new Date(startTime.getTime() - bufferMs) },
    startTime: { $lt: new Date(endTime.getTime() + bufferMs) },
  };

  if (excludeShowtimeId) {
    overlapQuery._id = { $ne: excludeShowtimeId };
  }

  const overlappedShowtime = await Showtime.findOne(overlapQuery);
  if (overlappedShowtime) {
    throw ApiError.conflict(messages.VALIDATION.SHOWTIME_OVERLAP_IN_SCREEN(SHOWTIME_BUFFER_MINUTES));
  }
};

const ensureMovieAndScreenExist = async ({ movie, screen }) => {
  let movieDoc;
  let screenDoc;

  if (movie) {
    movieDoc = await Movie.findById(movie);
    if (!movieDoc) {
      throw ApiError.notFound(messages.CRUD.NOT_FOUND("Movie"));
    }
  }

  if (screen) {
    screenDoc = await Screen.findById(screen);
    if (!screenDoc) {
      throw ApiError.notFound(messages.CRUD.NOT_FOUND("Screen"));
    }
  }

  return { movieDoc, screenDoc };
};

const createShowtime = async (body) => {
  const { movieDoc } = await ensureMovieAndScreenExist({
    movie: body.movie,
    screen: body.screen,
  });

  const { normalizedStart, normalizedEnd } = ensureValidTimeRange({
    startTime: body.startTime,
    endTime: body.endTime,
  });

  ensureShowtimeInMovieWindow({
    movieDoc,
    startTime: normalizedStart,
    endTime: normalizedEnd,
  });

  await ensureNoOverlappingShowtimeInScreen({
    screen: body.screen,
    startTime: normalizedStart,
    endTime: normalizedEnd,
  });

  const existing = await Showtime.findOne({
    screen: body.screen,
    movie: body.movie,
    startTime: body.startTime,
    endTime: body.endTime,
  });
  if (existing) {
    throw ApiError.conflict(messages.CRUD.ALREADY_EXISTS("Showtime"));
  }
  return Showtime.create(body);
};

const getShowtimes = async (filter, options) => {
  const normalizedFilter = { ...filter };
  const normalizedOptions = { ...options };
  const location = normalizedFilter.location;
  const date = normalizedFilter.date;

  delete normalizedFilter.location;
  delete normalizedFilter.date;

  const populateFields = normalizedOptions.populate
    ? normalizedOptions.populate.split(",").map((field) => field.trim())
    : [];
  const shouldPopulateMovie =
    populateFields.includes("movie") || populateFields.includes("movie.genres");
  const shouldPopulateMovieGenres =
    shouldPopulateMovie || populateFields.includes("movie.genres");
  const shouldPopulateScreen =
    populateFields.includes("screen") || populateFields.includes("screen.theater");
  const shouldPopulateScreenTheater = populateFields.includes("screen.theater");

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    normalizedFilter.startTime = {
      ...(typeof normalizedFilter.startTime === "object" && normalizedFilter.startTime
        ? normalizedFilter.startTime
        : {}),
      $gte: startOfDay,
      $lt: endOfDay,
    };
  }

  if (!location) {
    const result = await Showtime.paginate(normalizedFilter, normalizedOptions);

    // Ensure movie.genres is populated with id and name when movie is requested.
    if (shouldPopulateMovieGenres) {
      await Showtime.populate(result.results, {
        path: "movie.genres",
        select: "name",
      });
    }

    return result;
  }

  let sort = { createdAt: -1 };
  if (normalizedOptions.sortBy) {
    sort = {};
    normalizedOptions.sortBy.split(",").forEach((sortOption) => {
      const [key, order] = sortOption.split(":");
      sort[key] = order === "desc" ? -1 : 1;
    });
  }

  const limit = Math.min(Math.max(parseInt(normalizedOptions.limit, 10) || 10, 1), 100);
  const page = Math.max(parseInt(normalizedOptions.page, 10) || 1, 1);
  const skip = (page - 1) * limit;

  const aggregationPipeline = [
    { $match: normalizedFilter },
    {
      $lookup: {
        from: "screens",
        localField: "screen",
        foreignField: "_id",
        as: "_screen",
      },
    },
    { $unwind: "$_screen" },
    {
      $lookup: {
        from: "theaters",
        localField: "_screen.theater",
        foreignField: "_id",
        as: "_theater",
      },
    },
    { $unwind: "$_theater" },
    {
      $match: {
        "_theater.location": {
          $regex: `^${escapeRegex(location)}$`,
          $options: "i",
        },
      },
    },
  ];

  if (shouldPopulateMovie) {
    aggregationPipeline.push(
      {
        $lookup: {
          from: "movies",
          localField: "movie",
          foreignField: "_id",
          as: "movie",
        },
      },
      {
        $unwind: {
          path: "$movie",
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    if (shouldPopulateMovieGenres) {
      aggregationPipeline.push(
        {
          $lookup: {
            from: "genres",
            let: { genreIds: "$movie.genres" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$genreIds"],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  id: { $toString: "$_id" },
                  name: 1,
                },
              },
            ],
            as: "_movieGenres",
          },
        },
      );
    }
  }

  aggregationPipeline.push(
    {
      $project: {
        _id: 1,
        status: 1,
        startTime: 1,
        endTime: 1,
        movie: shouldPopulateMovie
          ? shouldPopulateMovieGenres
            ? {
              $mergeObjects: ["$movie", { genres: "$_movieGenres" }],
            }
            : "$movie"
          : "$movie",
        screen: shouldPopulateScreen
          ? shouldPopulateScreenTheater
            ? { $mergeObjects: ["$_screen", { theater: "$_theater" }] }
            : "$_screen"
          : "$screen",
        createdAt: 1,
        updatedAt: 1,
      },
    },
    { $sort: sort },
    {
      $facet: {
        results: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  );

  const [aggregated] = await Showtime.aggregate(aggregationPipeline);
  const totalResults = aggregated.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: aggregated.results,
    meta: {
      page,
      limit,
      totalResults,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

const getShowtimeById = async (id) => {
  const showtime = await Showtime.findById(id)
    .populate({
      path: "movie",
      populate: {
        path: "genres",
        select: "name",
      },
    })
    .populate("screen");
  if (!showtime) {
    throw ApiError.notFound(messages.CRUD.NOT_FOUND("Showtime"));
  }
  return showtime;
};

const updateShowtimeById = async (id, updateBody) => {
  const showtime = await getShowtimeById(id);

  const { movieDoc } = await ensureMovieAndScreenExist({
    movie: updateBody.movie,
    screen: updateBody.screen,
  });

  const effectiveMovieDoc = movieDoc || showtime.movie;
  const effectiveScreen = updateBody.screen || showtime.screen;
  const { normalizedStart, normalizedEnd } = ensureValidTimeRange({
    startTime: updateBody.startTime || showtime.startTime,
    endTime: updateBody.endTime || showtime.endTime,
  });

  ensureShowtimeInMovieWindow({
    movieDoc: effectiveMovieDoc,
    startTime: normalizedStart,
    endTime: normalizedEnd,
  });

  await ensureNoOverlappingShowtimeInScreen({
    screen: effectiveScreen,
    startTime: normalizedStart,
    endTime: normalizedEnd,
    excludeShowtimeId: showtime._id,
  });

  Object.assign(showtime, updateBody);
  await showtime.save();
  return showtime;
};

const deleteShowtimeById = async (id) => {
  const showtime = await getShowtimeById(id);
  await showtime.softDelete();
  return showtime;
};

module.exports = {
  createShowtime,
  getShowtimes,
  getShowtimeById,
  updateShowtimeById,
  deleteShowtimeById,
};
