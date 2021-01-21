/**
 * Last Modified Date: January 2021
 * Authors: Ricardo Hernandez 
 * This file relates to the seasonal stats of each player. Update the seasonal stats each time the player gets graded
 */

const mongoose = require('mongoose');

 const SeasonalPracticeStatsSchema = new mongoose.Schema({
     email: {
         type: String,
         required: true
    },
    school: {
        type: String, 
        required: true
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

 const SeasonalPracticeStats = mongoose.model('SeasonalPracticeStats', SeasonalPracticeStatsSchema);

 module.exports = SeasonalPracticeStats;