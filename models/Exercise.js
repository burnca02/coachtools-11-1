/**
 * Last Date Modified: January 2020
 * Authors: Ricardo Hernandez, Cameron Burns, and Kayl Murdough
 * This file relates to the exercises submitted from the submitExercises page on coach side
 */
const mongoose = require('mongoose');

 const ExerciseSchema = new mongoose.Schema({
    school: {
        type: String,
        required: true
    },
    exercises: {
        type: Array, //Array of preset exercises for team, set by coach
        required: false,
        default: ['Bench', 'Squat', 'DeadLift', 'HangClean']
    }
 })
 const Exercise = mongoose.model('Exercise', ExerciseSchema);

 module.exports = Exercise;