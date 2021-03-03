/**
 * Last Modified Date: Fall 2020 
 * Authors: Ricardo Hernandez, Cameron Burns, and Kayl Murdough
 * This file relates the game grading that will be done by coaches. This will be used in player grade feedback homepage.
 */

const mongoose = require('mongoose');

const GameGradeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    school: {
       type: String,
       required: true
   },
   int1: {
       type: Array, //int1[0]= score
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
   playType: {
       type: String,
       required: true,
       default: 'NONE'
   },
   pos: {
       type: String,
       required: true
   },  
   grade: { //overall game grade for that day
       type: String,
       required: true
   },
   date: {
       type: Date,
       default: Date.now
   }
})

const GameGrade = mongoose.model('GameGrade', GameGradeSchema);

module.exports = GameGrade;