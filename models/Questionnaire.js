/**
 * Last Modified Date: Fall 2020 
 * Authors: Ricardo Hernandez, Cameron Burns, and Kayl Murdough
 * This file relates to the questionairre which will be used for coaches to create and view questionairres.
 */

const mongoose = require('mongoose');

 const QuestionnaireSchema = new mongoose.Schema({
     participants: { //Whether the whole team will be included in the questionairre, or specific players.
         type: Array,
         required: true
     },
     questions: { //The questions being asked will be stored in an array.
        type: Array,
        required: true
    },
    school: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: 'meeting'
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    timeout: { //this represents the number of hours until the questionnaire is invalid
        type: Number,
        required: true, 
        default: 24
    }
 })

 const Questionnaire = mongoose.model('Questionnaire', QuestionnaireSchema);

 module.exports = Questionnaire;