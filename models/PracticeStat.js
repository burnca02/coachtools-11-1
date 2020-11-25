const mongoose = require('mongoose');

 const PracticeStatSchema = new mongoose.Schema({
     email: {
         type: String,
         required: true
     },
     school: {
        type: String,
        required: true
    },
     int1: {
        type: Array, //int1[0]= intangible1 name, int1[1]= score, int[2]= importanceLevel
        required: true
    },
    int2: {
        type: Array,
        required: true
    },
    int3: {
        type: Array,
        required: true
    },
    int4: {
        type: Array,
        required: true
    },
    grade: { //overall practice grade for that day
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
 })

 const PracticeStat = mongoose.model('PracticeStat', PracticeStatSchema);

 module.exports = PracticeStat;