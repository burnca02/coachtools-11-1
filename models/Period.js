/**
 * Last Date Modified: Spring 2021
 * Authors: Ricardo Hernandez, Cameron Burns, and Kayl Murdough
 * This file relates to the intangibles section in which the coaches will grade.
 */
 const mongoose = require('mongoose');

 const PeriodSchema = new mongoose.Schema({
    school: {
        type: String,
        required: true
    },
    periods: {
        type: Array, //Array of preset periods
        required: false,
        default: ['1', '2', '3', '4']
    }
 })
 const Period = mongoose.model('Period', PeriodSchema);

 module.exports = Period;