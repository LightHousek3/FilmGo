const { Genre } = require('../models');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

const createGenre = async (body) => {
    const existing = await Genre.findOne({ name: body.name });
    if (existing) {
        throw ApiError.conflict(messages.CRUD.ALREADY_EXISTS('Genre'));
    }
    return Genre.create(body);
};

const getGenres = async (filter, options) => {
    return Genre.paginate(filter, options);
};

const getGenreById = async (id) => {
    const genre = await Genre.findById(id);
    if (!genre) {
        throw ApiError.notFound(messages.CRUD.NOT_FOUND('Genre'));
    }
    return genre;
};

const updateGenreById = async (id, updateBody) => {
    const genre = await Genre.findByIdAndUpdate(id, updateBody, { new: true });
    return genre;
};

const deleteGenreById = async (id) => {
    const genre = await getGenreById(id);
    await genre.softDelete();
    return genre;
};

module.exports = {
    createGenre,
    getGenres,
    getGenreById,
    updateGenreById,
    deleteGenreById,
};
