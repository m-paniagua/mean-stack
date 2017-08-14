var express = require('express');
var router = express.Router();
var jwt = require("express-jwt");
var auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload'
});
var ctrlLocations = require("../controllers/locations");
var ctrlReviews = require("../controllers/reviews");
var ctrlAuth = require('../controllers/authentication');

// locations
// get all locations
router.get('/locations', ctrlLocations.locationsListByDistance);
// create location
router.post('/locations', ctrlLocations.locationsCreate);
// get specific location
router.get('/locations/:locationid', ctrlLocations.locationsReadOne);
// edit location
router.put('/locations/:locationid', ctrlLocations.locationsUpdateOne);
// delete location
router.delete('/locations/:locationid', ctrlLocations.locationsDeleteOne);

// reviews
// create review
router.post('/locations/:locationid/reviews', auth, ctrlReviews.reviewsCreate);
// get specific review
router.get('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsReadOne);
// edit review
router.put('/locations/:locationid/reviews/:reviewid', auth, ctrlReviews.reviewsUpdateOne);
// delete review
router.delete('/locations/:locationid/reviews/:reviewid', auth, ctrlReviews.reviewsDeleteOne);
// register account
router.post('/register', ctrlAuth.register);
// login
router.post('/login', ctrlAuth.login);

module.exports = router;