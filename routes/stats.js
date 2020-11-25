const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
//var upload = require('../upload');
const mongoose = require('mongoose');

const Roster = require('../models/Roster');
const PracticeStat = require('../models/PracticeStat');
const Intangibles = require('../models/Intangibles');

router.use(express.static("public"));

//Connect DB again??
const db = 'mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true&useNewUrlParser=true';
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true})
.then(() => console.log('Mongo DB Connected...'))
.catch(err => console.log(err));

router.get('/dispPracticeStats', ensureAuthenticated, (req, res) => 
  Intangibles.find({school: req.user.school})
  .then(intangibles => {
  const positions = [];
  for(var i = 0; i < intangibles.length; i++){
    positions[i] = intangibles[i].pos;
  }
  console.log(positions);
  res.render('practiceStats', { //need to send all stats data here too
        'positions': positions,
        'name': req.user.name
      });
  }).catch(err => console.log(err))
);

router.post('/dispPracticeStats', async(req, res) => {
    const {pos} = req.body;
    const ints = [];
    console.log(req.user.school);
    Roster.find({Pos: pos, School: req.user.school}) 
    .then(players => {
      Intangibles.findOne({school: req.user.school})
      .then(intangibles => {
      console.log(intangibles);
      console.log(intangibles.ints);
      const positions = [];
      for(var i = 0; i < intangibles.length; i++){
        positions[i] = intangibles[i].pos;
      }
      if(players.length == 0){
        res.render('practiceStats');
      } else {
        res.render('dispPracticeStats', { //need to send all stats data here too
              'players': players,
              'ints': intangibles.ints,
              'positions': positions,
              'name': req.user.name   
            });
      }
    }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

router.post('/addPracticeGrade', (req, res) => {
  const {player, intang1, intang2, intang3, intang4, grade1, grade2, grade3, grade4, scale} = req.body;
  console.group(req.body);

  var email;
  var school = req.user.school;
  Roster.findOne({name: player})
  .then(result => {
    email = result.Email;
  });

  int1 = [intang1, grade1, scale];
  int2 = [intang2, grade2, scale];
  int3 = [intang3, grade3, scale];
  int4 = [intang4, grade4, scale];

  const newPracticeStat = new PracticeStat({
    email,
    school,
    int1,
    int2,
    int3,
    int4
  });
  newPracticeStat.save();

  res.redirect('dispPracticeStats');
});

router.post('/addIntang', (req, res) => {
  const {pos, i1, i2, i3, i4, il1, il2, il3, il4} = req.body;
  const ints = [i1, i2, i3, i4, il1, il2, il3, il4];
  const newIntangible = new Intangibles({
    school: req.user.school,
    pos,
    ints
  });
  newIntangible.save();
  res.redirect('/coach/submitIntangibles');

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
