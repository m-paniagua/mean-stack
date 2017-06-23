var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

// calculate radians
var theEarth = (function() {
  var earthRadius = 6371; // km is 6371, miles is 3959
    // miles to radians
  var getDistanceFromRads = function(rads) {
      console.log('radians = ' + rads * earthRadius);
    return parseFloat(rads * earthRadius);
  };
    // radians to miles
  var getRadsFromDistance = function(distance) {
      console.log('miles = ' + distance / earthRadius);
    return parseFloat(distance / earthRadius);
  };

  return {
    getDistanceFromRads: getDistanceFromRads,
    getRadsFromDistance: getRadsFromDistance
  };
})();

var buildLocationList = function(req, res, results, stats) {
  var locations = [];
  results.forEach(function(doc) {
    locations.push({
      distance: theEarth.getDistanceFromRads(doc.dis),
      name: doc.obj.name,
      address: doc.obj.address,
      rating: doc.obj.rating,
      facilities: doc.obj.facilities,
      _id: doc.obj._id
    });
  });
  console.log('locations: ' + locations);
  return locations;
};

/* GET list of locations */
module.exports.locationsListByDistance = function(req, res) {
    // convert longitude to number
  var lng = parseFloat(req.query.lng);
  console.log('lng =' + lng);
    // convert latitude to number
  var lat = parseFloat(req.query.lat);
  console.log('lat =' + lat);
    // convert max distance to number
  var maxDistance = parseFloat(req.query.maxDistance);
  console.log('maxDistance =' + maxDistance);
  // point parameter
  var point = {
    type: "Point",
    coordinates: [lng, lat]
  };
  console.log('pont: ' + point.coordinates);
  var geoOptions = {
    spherical: true,
    // max distance to radians
    maxDistance: theEarth.getRadsFromDistance(maxDistance),
    // max number of results
    num: 10
  };
  console.log('geoOptions: ' + geoOptions.num);
  if (!lng || !lat || !maxDistance) {
    console.log('locationsListByDistance missing params');
    sendJsonResponse(res, 404, {
      "message": "lng, lat and maxDistance query parameters are all required"
    });
    return;
  }
  Loc.geoNear(point, geoOptions, function(err, results, stats) {
    var locations;
    console.log('Geo Results', results);
    console.log('Geo stats', stats);
    if (err) {
      console.log('geoNear error:', err);
      sendJsonResponse(res, 404, err);
    } else {
        // return results
      locations = buildLocationList(req, res, results, stats);
      sendJsonResponse(res, 200, locations);
    }
  });
};

module.exports.locationsCreate = function(req, res) {
    // create json from form fields
    Loc.create({
        name: req.body.name,
        address: req.body.address,
        facilities: req.body.facilities.split(","),
        coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
        openingTimes: [{
            days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1
        },{
            days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2
        }]
    }, function(err, location) {
        if(err) {
            sendJsonResponse(res, 400, err);
        } else {
            sendJsonResponse(res, 201, location);
        }
    })
};

module.exports.locationsReadOne = function(req, res) {
    // check if locationid provided
    if(req.params.locationid) {
        Loc.findById(req.params.locationid).exec(function(err, location) {
        if(!location) {
            // if location with locationid does not exist
            console.log('locationid not found');
            sendJsonResponse(res, 404, { 'message': 'locationid not found'});
            return;
        } else if(err) {
            // if error
            console.log(err);
            sendJsonResponse(res, 404, err);
            return;
        }
        // if location found
        console.log('Location found');
        sendJsonResponse(res, 200, location);
    });
    } else {
        // if no locationid included
        console.log('No locationid in request');
        sendJsonResponse(res, 404, { 'message': 'No locationid in request'});
    }
    
};

module.exports.locationsUpdateOne = function(req, res) {
    if(!req.params.locationid) {
        sendJsonResponse(res, 404, { 'message': 'Not found, locationid required'});
        return;
    }
    // search by id, return everything except reviews and rating
    Loc.findById(req.params.locationid).select('-reviews -rating').exec(function(err, location) {
        if(!location) {
            sendJsonResponse(res, 404, {'message': 'locationid not found'});
            return;
        } else if(err) {
            sendJsonResponse(res, 404, err);
            return;
        }
        location.name = req.body.name;
        location.address = req.body.address;
        location.facilities = req.body.facilities.split(',');
        location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
        location.openingTimes = [{
            days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1
            }, {
            days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2
        }];
        location.save(function(err, location) {
            if(err) {
                sendJsonResponse(res, 404, err);
            } else {
                sendJsonResponse(res, 200, location);
            }
        });
    });
};

module.exports.locationsDeleteOne = function(req, res) {
    var locationid = req.params.locationid;
    if(locationid) {
        Loc.findByIdAndRemove(locationid).exec(function(err, location) {
            if(err) {
                sendJsonResponse(res, 404, err);
                return;
            }
            sendJsonResponse(res, 204, null);
        });
    } else {
        sendJsonResponse(res, 404, {'message': 'No locationid'});
    }
};