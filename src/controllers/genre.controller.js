const { genreService } = require('../services');
const { asyncHandler, ResponseHandler, pick } = require('../utils');
const { messages } = require('../constants');

const createGenre = asyncHandler(async (req, res) => {
    const genre = await genreService.createGenre(req.body);
    ResponseHandler.created(res, {
        message: messages.CRUD.CREATED('Genre'),
        data: genre,
    });
});

const getGenres = asyncHandler(async (req, res) => {
    const filter = {};
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await genreService.getGenres(filter, options);

    ResponseHandler.paginated(res, {
        message: messages.CRUD.LIST_FETCHED('Genres'),
        data: result.results,
        meta: result.meta
    });
});

const getGenre = asyncHandler(async (req, res) => {
    const genre = await genreService.getGenreById(req.params.id);
    ResponseHandler.success(res, {
        message: messages.CRUD.FETCHED('Genre'),
        data: genre,
    });
});

const updateGenre = asyncHandler(async (req, res) => {
    const genre = await genreService.updateGenreById(req.params.id, req.body);
    ResponseHandler.success(res, {
        message: messages.CRUD.UPDATED('Genre'),
        data: genre,
    });
});

const deleteGenre = asyncHandler(async (req, res) => {
    await genreService.deleteGenreById(req.params.id);
    ResponseHandler.success(res, {
        message: messages.CRUD.DELETED('Genre'),
    });
});

module.exports = {
    createGenre,
    getGenres,
    getGenre,
    updateGenre,
    deleteGenre,
};
