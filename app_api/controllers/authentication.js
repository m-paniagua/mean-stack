var passport = require("passport");
var mongoose = require("mongoose");
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.register = function(req, res) {
    // error if any missing fields
  if(!req.body.name || !req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }
    // create new user
  var user = new User();
  
    // set email and name
  user.name = req.body.name;
  user.email = req.body.email;
  
    // call setPassword method
  user.setPassword(req.body.password);
  
    // save new user to mongoDB
  user.save(function(err) {
    var token;
    if (err) {
      sendJSONresponse(res, 404, err);
    } else {
      token = user.generateJWT();
      sendJSONresponse(res, 200, {
        "token" : token
      });
    }
  });

};

module.exports.login = function(req, res) {
    // error if missing fields
  if(!req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }

  passport.authenticate('local', function(err, user, info){
    var token;

    if (err) {
      sendJSONresponse(res, 404, err);
      return;
    }

    if(user){
      token = user.generateJWT();
      sendJSONresponse(res, 200, {
        "token" : token
      });
    } else {
      sendJSONresponse(res, 401, info);
    }
  })(req, res);

};