/**
 * This file contains the model being used for the roster Database. 
 * Authors: Ricardo Hernandez and Cam Burns
 * Date: Fall Semester 2020
 */
var mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
    Email: 
    {
      type: String,
      default: undefined
    },
    Number: 
    {
      type: Number,
      default: -1
    },
    FullName:  String, // String is shorthand for {type: String}
    Pos:   String,
    GradYear: String,
    Height: String,
    Weight: Number,
    Hometown: String,
    School: String, //Their current school
    Active: Boolean, //Are they on the active line?
    Grade: 
    {
      type: Number,
      default: -1
    }
  },{ collection: 'Roster' });

var Roster = mongoose.model('Roster', playerSchema);
 
module.exports = Roster;
