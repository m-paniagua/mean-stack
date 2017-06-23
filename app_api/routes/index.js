var express = require('express');
var router = express.Router();
var ctrlLocations = require("../controllers/locations");
var ctrlReviews = require("../controllers/reviews");

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
router.post('/locations/:locationid/reviews', ctrlReviews.reviewsCreate);
// get specific review
router.get('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsReadOne);
// edit review
router.put('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsUpdateOne);
// delete review
router.delete('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsDeleteOne);

module.exports = router;