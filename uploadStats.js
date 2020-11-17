/**
 * This file will be used to upload game stats. This file is similar to upload.js
 * Author: Ricardo Hernandez 
 * Date: Fall Semester 2020
 */
const csv = require('fast-csv');
var mongoose = require('mongoose');
const Roster = require('./models/Roster');
 
exports.post =  function (req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');


    /**
     * This function will delete all of the data in the database. This is necessary so that whenever the coach
     * uploads another roster there will be no duplicates and it willl be a clean slate.
     * 
     * This an async function so that we give time for the query to finish before adding new players to the rosters database. 
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
     .on("data", function(data){
         data['_id'] = new mongoose.Types.ObjectId();
         data['School'] = req.session.school;
         data['Email'] = null;
          
         players.push(data);
     })
     .on("end", function(){
         Roster.create(players, function(err, documents) {
            //  console.log(players);
            if (err) throw err;
         });

     });
     console.log("Uploaded to database");
     res.redirect('/roster');
};