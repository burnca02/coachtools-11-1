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
    Number: Number,
    FullName:  String, // String is shorthand for {type: String}
    Pos:   String,
    listPos: Array,
    GradYear: String,
    Height: String,
    Weight: Number,
    Hometown: String,
<<<<<<< Updated upstream
    School: String //Their current school
  },{ collection: 'Roster' });
=======
    School: String, //Their current school
    Active: Boolean, //Are they on the active line?
    Attendance: Array, // [questionnaires taken, questionnaires given]
    Rank: Array,
    Grade: {
      type: Number,
      default: -1
    },
  },{ collection: 'Roster' }); //By addding this, it makes sure that the name of the collection in the MonngoDB schedule will be named 'Roster'
>>>>>>> Stashed changes

var Roster = mongoose.model('Roster', playerSchema);
 
module.exports = Roster;
