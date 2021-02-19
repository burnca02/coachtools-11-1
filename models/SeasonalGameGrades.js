/**
 * Last Modified Date: January 2021
 * Authors: Cam Burns, Ricardo Hernandez 
 * This file relates to the seasonal stats of each player. Update the seasonal stats each time the player gets graded.
 * Code written by Ricardo Hernandez for practice stats and adapted to game grades by Cam Burns.
 */

const mongoose = require('mongoose');

 const SeasonalGameGradeSchema = new mongoose.Schema({
     email: {
         type: String,
         required: true
    },
    school: {
        type: String, 
        required: true
    },
    Current: { //This is the most recent Game Grade. 
        type: Number,
        default: 0
    },
    Overall: {
        type: Number, //The overall season average. The average of all the scores 
        default: 0
    },
    Intagible1Average: { //The overall season average of the first intagible as defined by the coach. 
        type: Number,
        default: 0
    },
    Intagible2Average: {//The overall season average of the second intagible as defined by the coach. 
        type: Number,
        default: 0
    },
    Intagible3Average: { //The overall season average of the third intagible as defined by the coach. 
        type: Number,
        default: 0
    },
    Intagible4Average: { //The overall season average of the fourth intagible as defined by the coach. 
        type: Number,
        default: 0
    },
 })

 const SeasonalGameGrades = mongoose.model('SeasonalGameGrades', SeasonalGameGradesSchema);

 module.exports = SeasonalGameGrades;