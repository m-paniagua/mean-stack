var mongoose = require("mongoose");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    hash: String,
    salt: String
});

// save encrypted password
userSchema.methods.setPassword = function(password) {
    // generate random string
    this.salt = crypto.randomBytes(16).toString('hex');
    // encrypt password
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

// validate log in
userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};

// create json web token
userSchema.methods.generateJWT = function() {
    // create expiry date object
    var expiry = new Date();
    // set expiry date for 7 days
    expiry.setDate(expiry.getDate() + 7);
    
    return jwt.sign({
        // pass payload
        _id: this.id,
        email: this.email,
        name: this.name,
        // unix time in seconds
        exp: parseInt(expiry.getTime() / 1000)
    }, process.env.JWT_SECRET);  // send secret for hashing algo
};

mongoose.model('User', userSchema);