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
    GradYear: String,
    Height: String,
    Weight: Number,
    Hometown: String,
    School: String //Their current school
  },{ collection: 'Roster' });

var Roster = mongoose.model('Roster', playerSchema);
 
module.exports = Roster;
