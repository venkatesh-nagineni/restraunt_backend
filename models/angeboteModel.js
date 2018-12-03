var mongoose = require('mongoose');

var angeboteSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    AngeboteNo: String,
    AngeboteName: String,
    AngeboteImg: String,
    AngebotePrice: Number,
    AngeboteDesc: String
});

module.exports = mongoose.model('angeboteSchema', angeboteSchema, 'Angebote');