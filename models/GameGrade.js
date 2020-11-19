const mongoose = require('mongoose');

 const GameGradeSchema = new mongoose.Schema({
     email: {
         type: String,
         required: true
     },
     grade: {
        type: String,
        required: true
    },
     int1: {
        type: Array, //int1[0]= intangible1 name, int1[1]= score
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
    date: {
        type: Date,
        default: Date.now
    }
 })

 const GameGrade = mongoose.model('GameGrade', GameGradeSchema);

 module.exports = GameGrade;