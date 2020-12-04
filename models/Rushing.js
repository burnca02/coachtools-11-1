/**
 * Fall 2020 
 * Authors: Ricardo Hernandez, Cam Burns, Kayl Murdough.
 * This file relates to the rushing stats that will be uploaded through the game stats function in the Coach's functionalities.
 */

var mongoose = require('mongoose');

const RushingScehma = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
       type: String,
       required: true
   },
   school: {
       type: String,
       required: true
   },
   password: {
       type: String,
       required: true
   },
   date: {
       type: Date,
       default: Date.now
   },
   userType: {
       type: String,
       required: true
   }
})

const Rushing = mongoose.model('Rushing', RushingSchema);

module.exports = User;