var express = require('express');
var router = express.Router();
var ctrlLocations = require("../controllers/locations");
var ctrlOthers = require("../controllers/others");

// Locations pages
/* GET home page. */
router.get('/', ctrlOthers.angularApp);

/*router.get('/location/:locationid', ctrlLocations.locationInfo);
router.get('/location/:locationid/review/new', ctrlLocations.addReview);
router.post('/location/:locationid/review/new', ctrlLocations.doAddReview);*/

// other pages
// router.get('/about', ctrlOthers.about);

module.exports = router;
