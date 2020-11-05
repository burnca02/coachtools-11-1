const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
//const csv = require('fast-csv');
var fileUpload = require('express-fileupload');
var template = require('../template');
var upload = require('../upload');
const csv = require('fast-csv');
var mongoose = require('mongoose');
const Roster = require('../models/Roster');

//photo
router.get('/coachToolsLogo.png', (req, res) => {
  res.sendFile('coachToolsLogo.png', { root: '.' })
});

router.use(fileUpload());
//Connect DB again??
const db = 'mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true&useNewUrlParser=true';
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true})
.then(() => console.log('Mongo DB Connected...'))
.catch(err => console.log(err));

router.get('/template', template.get);

router.get('/upload', ensureAuthenticated, (req, res) => 
  res.render('coachHome', {
    name: req.user.name //pass the name that was entered into the database to dashboard
}));

router.get('/playerFeedback', ensureAuthenticated, (req, res) => 
  res.render('playerFeedback', {
    name: req.user.name //pass the name that was entered into the database to dashboard
}));

router.get('/questionnaire', ensureAuthenticated, (req, res) => 
  res.render('questionnaire', {
    name: req.user.name //pass the name that was entered into the database to dashboard
}));

router.post('/upload', upload.post);
//upload function
// router.post('/upload', (req,res) => 
// {
//     if (!req.files)
//        return res.status(400).send('No files were uploaded.');
    
//     var rosterFile = req.files.file;

//     var players = [];
        
//     csv.parseString(rosterFile.data.toString(), {
//         headers: true,
//         ignoreEmpty: true
//     })
//     .on("data", function(data){
//         const newPlayer = new Player({
//           GradYear,
//           FirstName,
//           LastName,
//           Position
//         })
//         //data['_id'] = new mongoose.Player();
        
//         players.push(data);
//     })
//     .on("end", function(){
//         Roster.create(players, function(err, documents) {
//             if (err) throw err;
//         });
//                 // Sorting by the position Alhpabetically.
//         res.redirect('/coachHome');
//     });
    
// })

module.exports = router;
