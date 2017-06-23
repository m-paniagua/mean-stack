var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

// calculate kilometers
var meterConversion = (function() {
    var mToKm = function(distance) {
        return parseFloat(distance / 1000);
    };
    var kmToM = function(distance) {
        return parseFloat(distance * 1000);
    };
    return {
        mToKm : mToKm,
        kmToM : kmToM
    };
})();

/* GET list of locations */
module.exports.locationsListByDistance = function(req, res) {
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var maxDistance = parseFloat(req.query.maxDistance);
    if ((!lng && lng !== 0) || (!lat && lat !== 0) || !maxDistance) {
        console.log('locationsListByDistance missing params');
        sendJsonResponse(res, 404, {
            "message" : "lng, lat and maxDistance query parameters are all required"
        });
        return;
    }
    var point = {
        type: "Point",
        coordinates: [lng, lat]
    };
    var geoOptions =  {
        spherical: true,
        maxDistance: meterConversion.kmToM(maxDistance),
        num: 10
    };
    Loc.geoNear(point, geoOptions, function(err, results, stats) {
        var locations;
        console.log('Geo Results', results);
        console.log('Geo stats', stats);
        if (err) {
            console.log('geoNear error:', err);
            sendJsonResponse(res, 404, err);
        } else {
            locations = buildLocationList(req, res, results, stats);
            sendJsonResponse(res, 200, locations);
        }
    });
};

var buildLocationList = function(req, res, results, stats) {
    var locations = [];
    results.forEach(function(doc) {
        locations.push({
            distance: meterConversion.mToKm(doc.dis), 
            name: doc.obj.name,
            address: doc.obj.address,
            rating: doc.obj.rating,
            facilities: doc.obj.facilities,
            _id: doc.obj._id
        });
    });
    return locations;
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