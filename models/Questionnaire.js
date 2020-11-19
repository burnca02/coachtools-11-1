const mongoose = require('mongoose');

 const QuestionnaireSchema = new mongoose.Schema({
     participants: {
         type: Array,
         required: true
     },
     questions: {
        type: Array,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: 'meeting'
    },
    date: {
        type: Date,
        default: Date.now
    }
 })

 const Questionnaire = mongoose.model('Questionnaire', QuestionnaireSchema);

 module.exports = Questionnaire;