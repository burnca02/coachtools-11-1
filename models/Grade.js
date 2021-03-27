const mongoose = require('mongoose');

 const GradeSchema = new mongoose.Schema({
     email: {
         type: String,
         required: true,
     },
     grade: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }   
 })

 const Grade = mongoose.model('Grade', GradeSchema);

 module.exports = Grade;