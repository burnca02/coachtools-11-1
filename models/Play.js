/**
 * Last Date Modified: Fall 2020 
 * Authors: Ricardo Hernandez, Cameron Burns, and Kayl Murdough
 * This file relates to the intangibles section in which the coaches will grade.
 */
const mongoose = require('mongoose');

 const PlaySchema = new mongoose.Schema({
    school: {
        type: String,
        required: true
    },
    plays: {
        type: Array, //Array of preset plays
        required: false,
        default: ['RUN', 'PASS', 'ZONE', 'MAN']
    }
 })
 const Play = mongoose.model('Play', PlaySchema);

 module.exports = Play;