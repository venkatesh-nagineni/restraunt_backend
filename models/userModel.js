var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    confirmPassword: String,
    trusted: Boolean,
    phone: String,
    role: String,
    token: String
});

module.exports = mongoose.model('userSchema', userSchema, 'userDetails');