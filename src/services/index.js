const authService = require('./auth.service');
const genreService = require('./genre.service');
const emailService = require('./email.service');
const theaterService = require('./theater.service');
const geocodeService = require('./geocode.service');
const promotionService = require('./promotion.service')

module.exports = {
  authService,
  genreService,
  emailService,
  theaterService,
  geocodeService,
  promotionService,
};