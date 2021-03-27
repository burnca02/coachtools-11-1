/**
 * This file will be used to upload roster information through a CSV file.
 * Author: Ricardo Hernandez 
 * Date: Fall Semester 2020
 */
const csv = require('fast-csv');
var mongoose = require('mongoose');
const Roster = require('../models/Roster');
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
var fileUpload = require('express-fileupload');
const fs = require("fs");

router.use(fileUpload());

//router.use(multer({dest:'/uploads'}).single('playbook')); 
// const tmpobj = tmp.dirSync();
// console.log('Dir: ', tmpobj.name);
// // Manual cleanup
// tmpobj.removeCallback();

router.use(express.static("public"));

router.post('/upload', ensureAuthenticated, async(req, res) => {
    if (!req.files)
    return res.status(400).send('No files were uploaded.');


    /**
    * This function will delete all of the data in the database. This is necessary so that whenever the coach
    * uploads another roster there will be no duplicates and it willl be a clean slate.
    * 
    * This an async function so that we give time for the query to finish before adding new players to the rosters database. Otherwises, the page loads before all the data is in the query.
    */
    async function deleteData(){
    const mongo = await mongoose.connection.db.collection('Roster').deleteMany({School: req.session.school});
    } 

    deleteData();


    //  upload roster.
    var rosterFile = req.files.file;
    var players = [];
    
    csv.parseString(rosterFile.data.toString(), {
    headers: true,
    ignoreEmpty: true
    })
    .on("data", function(data){ //"data" is each row. So a row has player information. This data is passed as a json array.
    data['_id'] = new mongoose.Types.ObjectId(); //Creating a uniqueID.
    data['School'] = req.session.school; //Add the school name to the specific player.
    data['Active'] = false; //All players are inactive by default.
    data['Rank']   = 1;
    console.log("data.Pos: " + data.Pos)
    data['listPos']= [data.Pos];
    //data['Attendance'] = [0, 0];
    //  data['Rank'] = 0;
    console.log(data);
    players.push(data);
    })
    .on("end", function(){
    //Will add all of the information from the csv file in the Roster database.
    Roster.create(players, function(err, documents) {
        //  console.log(players);
        if (err) throw err;
    });

    });
    console.log("Uploaded to database");
    res.redirect('/coach/roster');
});

module.exports = router;
   