const express = require('express');

const authRoute = require('./auth.route');
const genreRoute = require('./genre.route');
const newsRoute = require('./news.route');
const screenRoute = require('./screen.route');
const userRoute = require('./user.route');

const router = express.Router();

const routes = [
    { path: '/auth', route: authRoute },
    { path: '/genres', route: genreRoute },
    { path: '/news', route: newsRoute },
    { path: '/screens', route: screenRoute }
    ,{ path: '/users', route: userRoute }
];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
