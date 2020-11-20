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
    grade: {
        type: String,
        required: true
    },
     int1: {
        type: Array, //int1[0]= intangible1 name, int[1]= gradingscale, int1[2]= grade
        required: false
    },
    int2: {
        type: Array,
        required: false
    },
    int3: {
        type: Array,
        required: false
    },
    int4: {
        type: Array,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
 })

 const PracticeStat = mongoose.model('PracticeStat', PracticeStatSchema);

 module.exports = PracticeStat;