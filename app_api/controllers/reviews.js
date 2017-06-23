var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

module.exports.reviewsCreate = function(req, res) {
    // set locationid
    var locationid = req.params.locationid;
    if(locationid) {
        // find location, only return reviews array
        Loc.findById(locationid).select('reviews').exec(function(err, location) {
            if(err) {
                // if theres an error
                sendJsonResponse(res, 400, err);
            } else {
                // add new review
                doAddReview(req, res, location);
            }
        })
    };
};

var doAddReview = function(req, res, location) {
    if(!location) {
        // if no location is found
        sendJsonResponse(res, 404, {'message': 'locationid not found'});
    } else {
        // push to reviews array
        location.reviews.push({
            author: req.body.author,
            rating: req.body.rating,
            reviewText: req.body.reviewText
        });
        // save updated location document
        location.save(function(err, location) {
            var thisReview;
            if(err) {
                // if error updating
                sendJsonResponse(res, 400, err);
            } else {
                // calculate new rating
                updateAverageRating(location._id);
                // get last element in reviews array
                thisReview = location.reviews[location.reviews.length - 1];
                // return new response
                sendJsonResponse(res, 201, thisReview);
            }
        });
    }
};

var updateAverageRating = function(locationid) {
    Loc.findById(locationid).select('rating reviews').exec(function(err, location) {
        if(!err) {
            doSetAverageRating(location);
        }
    });
};

var doSetAverageRating = function(location) {
    var i, reviewCount, ratingAverage, ratingTotal;
    // if reviews array not empty
    if(location.reviews && location.reviews.length > 0) {
        // get array length
        reviewCount = location.reviews.length;
        // initialize total
        ratingTotal = 0;
        for(i = 0; i < reviewCount; i++) {
            // add all ratings from reviews array to total
            ratingTotal += location.reviews[i].rating;
        }
        // calculate average
        ratingAverage = parseInt(ratingTotal / reviewCount, 10);
        // set new average
        location.rating = ratingAverage;
        // save updated location
        location.save(function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log('average rating updated to:', ratingAverage);
            }
        });
    }
};

module.exports.reviewsReadOne = function(req, res) {
    if(req.params.locationid && req.params.reviewid) {
        Loc.findById(req.params.locationid).select('name reviews').exec(function(err, location) {
            var response, review;
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
            if(location.reviews && location.reviews.length > 0) {
                // mongoose id function to search subdocument
                review = location.reviews.id(req.params.reviewid);
                if(!review) {
                    // if review with reviewid does not exist
                    console.log('reviewid not found')
                    sendJsonResponse(res, 404, { 'message': 'reviewid not found'});
                } else {
                    response = {
                        location: {
                            name: location.name,
                            id: req.params.locationid
                        },
                        review: review
                    };
                    // send review
                    sendJsonResponse(res, 200, response);
                }
            } else {
                // review not found
                sendJsonResponse(res, 404, {'message': 'no reviews found'});
            }
        });
    } else {
        // reviewid or locationid not provided
        sendJsonResponse(res, 404, {"message": "Not found, locationid and reviewid are both required"});
    }
};

module.exports.reviewsUpdateOne = function(req, res) {
    if (!req.params.locationid || !req.params.reviewid) {
    sendJsonResponse(res, 404, {"message": "Not found, locationid and reviewid are both required"});
    return;
  }
  Loc.findById(req.params.locationid).select('reviews').exec(function(err, location) {
        var thisReview;
        if (!location) {
          sendJsonResponse(res, 404, {"message": "locationid not found"});
          return;
        } else if (err) {
          sendJsonResponse(res, 400, err);
          return;
        }
        if (location.reviews && location.reviews.length > 0) {
          thisReview = location.reviews.id(req.params.reviewid);
          if (!thisReview) {
            sendJsonResponse(res, 404, {"message": "reviewid not found"});
          } else {
            thisReview.author = req.body.author;
            thisReview.rating = req.body.rating;
            thisReview.reviewText = req.body.reviewText;
            location.save(function(err, location) {
              if (err) {
                sendJsonResponse(res, 404, err);
              } else {
                updateAverageRating(location._id);
                sendJsonResponse(res, 200, thisReview);
              }
            });
          }
        } else {
          sendJsonResponse(res, 404, {"message": "No review to update"});
        }
      }
  );
};

module.exports.reviewsDeleteOne = function(req, res) {
    if (!req.params.locationid || !req.params.reviewid) {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }
  Loc
    .findById(req.params.locationid)
    .select('reviews')
    .exec(
      function(err, location) {
        if (!location) {
          sendJsonResponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 400, err);
          return;
        }
        if (location.reviews && location.reviews.length > 0) {
          if (!location.reviews.id(req.params.reviewid)) {
            sendJsonResponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            location.reviews.id(req.params.reviewid).remove();
            location.save(function(err) {
              if (err) {
                sendJsonResponse(res, 404, err);
              } else {
                updateAverageRating(location._id);
                sendJsonResponse(res, 204, null);
              }
            });
          }
        } else {
          sendJsonResponse(res, 404, {
            "message": "No review to delete"
          });
        }
      }
  );
};