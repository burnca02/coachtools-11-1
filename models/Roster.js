var mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
    FirstName:  String, // String is shorthand for {type: String}
    LastName: String,
    Pos:   String,
    GradYear: Number
  },{ collection: 'Roster' });

var Roster = mongoose.model('Roster', playerSchema);
 
module.exports = Roster;