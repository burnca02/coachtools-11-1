/**
 * Last Date Modified: Fall 2020 
 * Authors: Ricardo Hernandez, Cameron Burns, and Kayl Murdough
 * This file relates to the intangibles section in which the coaches will grade.
 */
const mongoose = require('mongoose');

 const IntangiblesSchema = new mongoose.Schema({
    school: {
        type: String,
        required: true
    },
    pos: {
        type: String,
        required: true
    },
    scale: {
        type: String,
        required: true
    },
    ints: {
        type: Array, //Array of preset intangibles for practice/game grading by school/position and importance levels
        required: false,
        default: ['alignment', 'assignment', 'technique', 'execution', '', '', '', '']
    }
 })
 const Intangibles = mongoose.model('Intangibles', IntangiblesSchema);

 module.exports = Intangibles;