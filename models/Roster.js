/**
 * This file contains the model being used for the roster Database. 
 * Authors: Ricardo Hernandez, Cam Burns, and Kayl Murdough
 * Date: Fall Semester 2020
 */
var mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
    Email:String,
    Number: 
    {
      type: Number,
      default: -1
    },
    FullName:  String, // String is shorthand for {type: String}
    Pos:   String,
    GradYear: String,
    Hometown: String,
    School: String, //Their current school
    Active: Boolean, //Are they on the active line?
    Grade: 
    {
      type: Number,
      default: -1
    }
  },{ collection: 'Roster' }); //By addding this, it makes sure that the name of the collection in the MonngoDB schedule will be named 'Roster'

var Roster = mongoose.model('Roster', playerSchema);
 
module.exports = Roster;
