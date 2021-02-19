/**
 * Last Modified Date: Fall 2020 
 * Authors: Ricardo Hernandez, Cameron Burns, and Kayl Murdough
 * This file relates the game grading that will be done by coaches. This will be used in player grade feedback homepage.
 */

const mongoose = require('mongoose');

const GameGradeSchema = new mongoose.Schema({

grades: [{
    email: String,
    int1: Array, //int1[0]= intangible1 name, int1[1]= score, int[2]= importanceLevel
    int2: Array,
    int3: Array,
    int4: Array,
    grade: String
}],
playType: {
    type: String,
    required: true,
    default: "NONE"
},
pos: {
    type: String,
    required: true,
    default: "N/A"
},
school: {
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