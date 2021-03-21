/**
 * Last Modified Date: Fall 2020 
 * Authors: Ricardo Hernandez, Cameron Burns, and Kayl Murdough
 * This file relates to the completedQuestionairre that will be sent back to the coach once a player has submitted the questionairre.
 */

const mongoose = require('mongoose');

 const CompleteQuestSchema = new mongoose.Schema({
    qID: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    school: {
        type: String,
        required: true
    },
    score: {
        type: Array,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: 'meeting'
    },
    comment: {
        type: String,
        required: false,
        default: 'none'
    },
    date: {
        type: Date,
        default: Date.now
    }
 })

 const CompleteQuest = mongoose.model('CompleteQuest', CompleteQuestSchema);

 module.exports = CompleteQuest;