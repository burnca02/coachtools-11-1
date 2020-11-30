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
    positions.push(intangibles[i].pos);
  }
  console.log(positions);
  res.render('practiceStats', { //need to send all stats data here too
        'positions': positions,
        'name': req.user.name
      });
  }).catch(err => console.log(err))
);
//This method provides dispPracticeStats with the list of players for the position selected along with
//their intangibles and respective grades
router.post('/dispPracticeStats', async(req, res) => {
    const {pos} = req.body;
    const ints = [];
    Roster.find({Pos: pos, School: req.user.school}) 
    .then(players => {
      Intangibles.find({school: req.user.school, pos: pos})
      .then(intangibles => {
      const positions = [];
      for(var i = 0; i < intangibles.length; i++){
        if(!(positions.includes(intangibles[i].pos))){ //adds only unique positions to array, no duplicates
          positions.push(intangibles[i].pos);
        }
      }
      if(players.length == 0){
        res.render('practiceStats');
      } else {
        PracticeStat.find({school: req.user.school}).sort({date:-1})
        .then(stats => {
          res.render('dispPracticeStats', {
                'players': players,
                'ints': intangibles[0].ints,
                'scale': intangibles.scale,
                'positions': positions,
                'stats': stats,
                'name': req.user.name   
              });
        })
      }
    }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});
//This function add a practice grade to the database once they are submitted by the coach
router.post('/addPracticeGrade', async (req, res) => {
  const {playerName, date, scale, grade1, grade2, grade3, grade4, grade1imp, grade2imp, grade3imp, grade4imp} = req.body;
  console.group(req.body);

  var email;
  var school = req.user.school;
  await Roster.findOne({FullName: playerName, School: school})
  .then(result => {
    console.log(result);
    email = result.Email;
  }).catch(err => console.log(err));
  console.log('email' + email);
  int1 = [grade1, 1];
  int2 = [grade2, 2];
  int3 = [grade3, 3];
  int4 = [grade4, 4];
  //Calculating the day's overall practice grade
  var grade = Math.round((((grade1/scale)*.4) + ((grade2/scale)*.3) + ((grade3/scale)*.2) + ((grade4/scale)*.1)) * 100);

  const newPracticeStat = new PracticeStat({
    email,
    school,
    int1,
    int2,
    int3,
    int4,
    grade,
    date
  });
  console.log(newPracticeStat);
  newPracticeStat.save();
  res.redirect('dispPracticeStats');
});
//This function saves Intangibles to the database once they are set by the coach
router.post('/addIntang', (req, res) => {
  const {pos, scale, i1, i2, i3, i4, il1, il2, il3, il4} = req.body;
  const ints = [i1, i2, i3, i4, il1, il2, il3, il4];
  const newIntangible = new Intangibles({
    school: req.user.school,
    pos,
    scale,
    ints
  });
  newIntangible.save();
  res.redirect('/coach/submitIntangibles');
});

// router.post('/updatePracticeStats', (req, res) => {
//   const {pos} = req.body;
//   console.log(pos);
//   PracticeStat.findOneAndUpdate({position: pos, school: req.user.school})
//   .then(stats => { 
//   console.log(stats);
//   res.render('practiceStats', {
//         stats: stats      
//       });
//   });
// });

module.exports = router;
