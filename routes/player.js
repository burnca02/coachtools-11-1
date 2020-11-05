const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const Stat = require('../models/Stat');

//Connect DB again??
const mongoose = require('mongoose');
const db = 'mongodb+srv://yoda:maytheforce@cluster0.fvmkx.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true})
.then(() => console.log('Mongo DB Connected...'))
.catch(err => console.log(err));

//photo
router.get('/coachToolsLogo.png', (req, res) => {
  res.sendFile('coachToolsLogo.png', { root: '.' })
});

//player grades page
router.get('/playerGrades', ensureAuthenticated, (req, res) => 
  Stat.findOne({ email: req.user.email }).sort({$natural:-1}).limit(1)
  .then(stat => {
    console.log(stat.bench);
    res.render('playerTrends', {
          email: stat.email,
          bench: stat.bench,
          squat: stat.squat,
          dead: stat.dead,
          mile: stat.mile,
          height: stat.height,
          weight: stat.weight
        });
  }
));


//player trends page
router.get('/playerTrends', ensureAuthenticated, (req, res) => 
  Stat.findOne({ email: req.user.email }).sort({$natural:-1}).limit(1)
  .then(stat => {
    console.log(stat.bench);
    res.render('playerTrends', {
          email: stat.email,
          bench: stat.bench,
          squat: stat.squat,
          dead: stat.dead,
          mile: stat.mile,
          height: stat.height,
          weight: stat.weight
        });
  }
));

router.post('/updatestats', (req, res) => {
  //how to get it to recognize player email without them having to type it in?
  const { email, bench, squat, dead, mile, height, weight} = req.body;
  console.log(req.body);

  //Add new Stat to the database
  const newStat = new Stat({
      email,
      bench,
      squat,
      dead,
      mile,
      height,
      weight
  });

  //save user
  newStat.save()
  .then(stat => {
      req.flash('success_msg', 'Stats have been updated');
      res.redirect('/player/playerTrends');
  })
  .catch(err => console.log(err));
});

module.exports = router;
