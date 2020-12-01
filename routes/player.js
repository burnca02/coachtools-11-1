const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const Stat = require('../models/Stat');
const PracticeStat = require('../models/PracticeStat');

router.use(express.static("public"));

//Connect DB again??
const mongoose = require('mongoose');
const db = 'mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true&useNewUrlParser=true';
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true})
.then(() => console.log('Mongo DB Connected...'))
.catch(err => console.log(err));

router.get('/playerHome', ensureAuthenticated, (req, res) => 
    res.render('playerHome', {
        name: req.user.name //pass the name that was entered into the database to dashboard
    }));

//player grades page
router.get('/playerGrades', ensureAuthenticated, (req, res) => 
  PracticeStat.find({ email: req.user.email }).sort({date:-1})// This query will get the most recent practice grade.
  .then(stats => {
        res.render('playerGrades', {
              'stats': stats,
              'name': req.session.name
        })
        .catch(err => {
            res.render('playerGrades', {
            'stats': "Not Available",
            'name': req.session.name
            })
            console.log(err)}
          );
}));

router.get('/meetingGrade', (req, res) => res.render('meetingGrade'));
router.get('/practiceGrade', (req, res) => res.render('practiceGrade'));
//router.get('/viewQuestionnaire', (req, res) => res.render('viewQuestionnaire'));


//player trends page
router.get('/playerTrends', ensureAuthenticated, (req, res) => 

  Stat.findOne({ email: req.session.email }).sort({createdAt:-1}).limit(1) // Query to find the most recent stat for the user.
  .then(stat => 
  {
    Stat.find({ email: req.session.email }).sort({createdAt:1}) //This query will be used to populate the graph.
    .then(stats =>
    {
      console.log(stat.bench);
      res.render('playerTrends', 
        {
          email: stat.email,
          bench: stat.bench,
          squat: stat.squat,
          dead: stat.dead,
          mile: stat.mile,
          height: stat.height,
          weight: stat.weight,
          graph: stats
        });
    })
        console.log(req.session);

  }
));

router.post('/updatestats', (req, res) => {
  //how to get it to recognize player email without them having to type it in?
  const {bench, squat, dead, mile, height, weight} = req.body;
  console.log(req.body);

  //Add new Stat to the database
  const newStat = new Stat({
      // _id: req.session._id, //MongoDB does not allow for ID's to be duplicated. You can create a database column for playerID, but not set _id.
      email: req.session.email,
      name: req.session.name,
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
