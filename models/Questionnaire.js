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
    school: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: 'meeting'
    },
    grade: {
        type: String,
        required: false,
        default: 'null'
    },
    date: {
        type: Date,
        default: Date.now
    },
    completed: {
        type: String,
        required: true,
        default: 'false'
    }
 })

 const Questionnaire = mongoose.model('Questionnaire', QuestionnaireSchema);

 module.exports = Questionnaire;