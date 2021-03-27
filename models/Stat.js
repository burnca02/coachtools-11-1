/**
 * Latest Date Modified: Fall 2020
 * Authors: Ricardo Hernandez, Cameron Burns, Kayl Murdough
 * This file contains the model that will be user to enter data into the stats database collection. This file relates to the benchmarks used for players in playerTrends. 
 * Stats is related to Benchmarks and specific excercises that Coaches use.
 */

const mongoose = require('mongoose');

 const StatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    pos: {
        type: String,
        required: true
    },
    email: {
         type: String,
         required: true
     },
     e1: {
        type: String,
        required: true
    },
    e2: {
        type: String,
        required: true
    },
    e3: {
        type: String,
        required: true
    },
    e4: {
        type: String,
        required: true
    },
    height: {
        type: String,
        required: true
    },
    weight: {
        type: String,
        required: true
    }, 
 }, { timestamps: true })

 const Stat = mongoose.model('Stat', StatSchema);

 module.exports = Stat;