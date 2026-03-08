const { theaterService } = require('../services');
const { asyncHandler, ResponseHandler, pick } = require('../utils');
const { messages } = require('../constants');


const createTheater = asyncHandler(async (req, res) => {
    const theater = await theaterService.createTheater(req.body);
    ResponseHandler.created(res, {
        message: messages.CRUD.CREATED('Theater'),
        data: theater,
    });
});

const getTheaters = asyncHandler(async (req, res) => {
    const filter = pick(req.query, ['search', 'lat', 'lng', 'maxDistance']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'select', 'populate']);
    const result = await theaterService.getTheaters(filter, options);

    ResponseHandler.paginated(res, {
        message: messages.CRUD.LIST_FETCHED('Theaters'),
        data: result.results,
        meta: result.meta,
    });
});

const getTheater = asyncHandler(async (req, res) => {
    const theater = await theaterService.getTheaterById(req.params.id);
    ResponseHandler.success(res, {
        message: messages.CRUD.FETCHED('Theater'),
        data: theater,
    });
});

const updateTheater = asyncHandler(async (req, res) => {
    const theater = await theaterService.updateTheaterById(req.params.id, req.body);
    ResponseHandler.success(res, {
        message: messages.CRUD.UPDATED('Theater'),
        data: theater,
    });
});

const deleteTheater = asyncHandler(async (req, res) => {
    await theaterService.deleteTheaterById(req.params.id);
    ResponseHandler.success(res, {
        message: messages.CRUD.DELETED('Theater'),
    });
});

const updateCoordinatesByAddress = asyncHandler(async (req, res) => {
    const theater = await theaterService.updateCoordinatesByAddress(
        req.params.id
    );
    ResponseHandler.success(res, {
        message: messages.THEATER.GEOCODE_SUCCESS,
        data: theater,
    });
});

module.exports = {
    createTheater,
    getTheaters,
    getTheater,
    updateTheater,
    deleteTheater,
    updateCoordinatesByAddress,
};
