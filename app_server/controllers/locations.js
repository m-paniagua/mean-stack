var request = require("request");
var apiOptions = {
    // set server for cloud9
    server: 'https://getting-mean-manuelpaniagua.c9users.io/'
};

if (process.env.NODE_ENV === 'production') {
    // set server for heroku
    apiOptions.server = 'https://thawing-mountain-83285.herokuapp.com/';
}

var renderHomePage = function(req, res) {
    /*var message;
    if(!(resBody instanceof Array)) {
        message = 'API lookup error';
        resBody = [];
    } else {
        if(!resBody.length) {
            message = 'No places found nearby';
        }
    }*/
    res.render('locations-list', { 
        title: 'Loc8r - find a place to work with wifi',
        pageHeader: {
            title: 'Loc8r',
            strapline: 'Find places to work with wifi near you!'
        },
        sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint?  Let Loc8r help you find the place you're looking for.",
        /*locations: resBody,
        message: message*/
    });
}
// GET home page
module.exports.homelist = function(req, res) {
    /*var requestOptions, path;
    path = 'api/locations';
    requestOptions = {
        url: apiOptions.server + path,
        method: 'GET',
        json: {},
        qs: {
            lng: -118.457197,
            lat: 34.264995,
            maxDistance: 20
        }
    };
    request(requestOptions, function(err, response, body) {
        var i, data;
        data = body;
        // console.log(body);
        if(response.statusCode === 200 && data.length) {
            for(i = 0; i < data.length; i++) {
                data[i].distance = _formatDistance(data[i].distance);
            }
        }
        
        renderHomePage(req, res, body);
    });*/
    renderHomePage(req, res);
};

var _isNumeric = function(distance) {
    return !isNaN(parseFloat(distance) && isFinite(distance));
};

var _formatDistance = function(distance) {
    var numDistance, unit;
    if(distance && _isNumeric(distance)) {
        if(distance > 1) {
            // round km to 1 decimal place
            numDistance = parseFloat(distance).toFixed(1);
            unit = 'km';
        } else {
            // if less than 1 km, display as meters
            numDistance = parseInt(distance * 1000, 10);
            unit ='m';
        }
        return numDistance + unit;
    } else {
        return '?';
    }
};

var renderDetailPage = function(req, res, locDetail) {
    res.render('location-info', {
        title: locDetail.name,
        pageHeader: {title: locDetail.name},
        sidebar: {
            context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
            callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
        },
        location: locDetail
    });
};

var _showError = function (req, res, status) {
    var title, content;
    if (status === 404) {
        title = "404, page not found";
        content = "Oh dear. Looks like we can't find this page. Sorry.";
    } else {
        title = status + ", something's gone wrong";
        content = "Something, somewhere, has gone just a little bit wrong.";
    }
    res.status(status);
    res.render('generic-text', {
        title : title,
        content : content
    });
};

var getLocationInfo = function(req, res, callback) {
    var requestOptions, path;
    path = "api/locations/" + req.params.locationid;
    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {}
    };
    request(requestOptions, function(err, response, body) {
        var data = body;
        if(response.statusCode === 200) {
            data.coords = {
                lng : body.coords[0],
                lat : body.coords[1]
            };
            callback(req, res, data);
        } else {
            _showError(req, res, response.statusCode);
        }
        
    });
};

/* GET 'Location info' page */
module.exports.locationInfo = function(req, res){
    getLocationInfo(req, res, function(req, res, responseData) {
        renderDetailPage(req, res, responseData);
    });
};

var renderReviewForm = function(req, res, locDetail) {
    res.render('location-review-form', { 
        title: 'Add review',
        pageHeader: {
            title: 'Review' + locDetail.name
        },
        error: req.query.err,
        url: req.originalUrl
    });
};

// GET review page
module.exports.addReview = function(req, res) {
    getLocationInfo(req, res, function(req, res, responseData) {
        renderReviewForm(req, res, responseData);
    });
};

module.exports.doAddReview = function(req, res) {
    var requestOptions, path, locationid, postdata;
    // get location id
    locationid = req.params.locationid;
    console.log('location id is: ' + locationid);
    path = 'api/locations/' + locationid + '/reviews';
    // create data object to send to API
    postdata = {
        author: req.body.name,
        rating: parseInt(req.body.rating, 10),
        reviewText: req.body.review
    };
    // set request options
    requestOptions = {
        url: apiOptions.server + path,
        method: "POST",
        json: postdata
    };
    // make request
    if(!postdata.author || !postdata.rating || !postdata.reviewText) {
        res.redirect('/location/' + locationid + '/review/new?err=val');
    } else {
        request(requestOptions, function(err, response, body) {
            if(response.statusCode === 201) {
                res.redirect('/location/' + locationid);
            } else if (response.statusCode === 400 && body.name && body.name === "ValidationError"){
                res.redirect('/location/' + locationid + '/review/new?err=val');
            } else {
                _showError(req, res, response.statusCode);
            }
        });
    }
    
};
