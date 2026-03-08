const express = require('express');
const router = express.Router();

const festivalController = require('../controllers/festival.controller');
const validate = require('../middlewares/validate.middleware');
const festivalValidation = require('../validators/festival.validator');

router.post('/', validate(festivalValidation.createFestival), festivalController.createFestival);

router.get('/', festivalController.getFestivals);

router.get('/:id', festivalController.getFestivalById);

router.put('/:id', validate(festivalValidation.updateFestival), festivalController.updateFestival);

router.delete('/:id', festivalController.deleteFestival);

module.exports = router;