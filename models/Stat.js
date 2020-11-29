const mongoose = require('mongoose');

 const StatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
         type: String,
         required: true
     },
     bench: {
        type: String,
        required: true
    },
    squat: {
        type: String,
        required: true
    },
    dead: {
        type: String,
        required: true
    },
    mile: {
        type: String,
        required: true
    },
    height: {
        type: String,
        required: true
    },
    weight: {
        type: String,
        required: true
    }, 
 }, { timestamps: true })

 const Stat = mongoose.model('Stat', StatSchema);

 module.exports = Stat;