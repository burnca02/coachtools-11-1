const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
//var upload = require('../upload');
const mongoose = require('mongoose');

const Roster = require('../models/Roster');
const PracticeStat = require('../models/PracticeStat');

router.use(express.static("public"));

//Connect DB again??
const db = 'mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true&useNewUrlParser=true';
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true})
.then(() => console.log('Mongo DB Connected...'))
.catch(err => console.log(err));

router.get('/dispPracticeStats', ensureAuthenticated, (req, res) => 
  res.render('dispPracticeStats', {
    name: req.user.name //pass the name that was entered into the database to dashboard
}));

router.post('/dispPracticeStats', (req, res) => {
    const {pos} = req.body;
    console.log(pos);
    console.log(req.user.school);
    Roster.find({Pos: pos})
    .then(players => { 
    console.log(players);
    res.render('dispPracticeStats', {
          'players': players     
        });
    });
});

router.post('/updatePracticeStats', (req, res) => {
  const {pos} = req.body;
  console.log(pos);
  PracticeStat.findOneAndUpdate({position: pos, school: req.user.school})
  .then(stats => { 
  console.log(stats);
  res.render('practiceStats', {
        stats: stats      
      });
  });
});

module.exports = router;