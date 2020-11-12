const mongoose = require('mongoose');

 const CompleteQuestSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    score: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: 'meeting'
    },
    comment: {
        type: String,
        required: true,
        default: 'none'
    },
    date: {
        type: Date,
        default: Date.now
    }
 })

 const CompleteQuest = mongoose.model('CompleteQuest', CompleteQuestSchema);

 module.exports = CompleteQuest;