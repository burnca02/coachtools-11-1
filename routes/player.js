const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const Stat = require('../models/Stat');
const PracticeStat = require('../models/PracticeStat');
const Exercise = require('../models/Exercise');

router.use(express.static("public"));

//Connect DB again??
const mongoose = require('mongoose');
const db = 'mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true&useNewUrlParser=true';
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true, useFindAndModify: false})
.then(() => console.log('Mongo DB Connected...'))
.catch(err => console.log(err));

router.get('/playerHome', ensureAuthenticated, (req, res) => 
    res.render('playerHome', {
        name: req.user.name //pass the name that was entered into the database to dashboard
    }));

/*
This method is the get for the playerGrades page. The query below searches the PracticeStat database 
for the most recent grade and sends it to playerGrades.ejs to be displayed. 
*/
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


/*
This method is the get for the playerTrends page. The query below first finds the most recent practice stat
for the user and then finds the rest to populate the table which appears on playerTrends.ejs.
*/
router.get('/playerTrends', ensureAuthenticated, (req, res) => 

  Stat.findOne({ email: req.session.email }).sort({createdAt:-1}).limit(1) // Query to find the most recent stat for the user.
  .then(stat => {
    Stat.find({ email: req.session.email }).sort({createdAt:1}) //This query will be used to populate the graph.
    .then(stats => {
      Exercise.findOne({'school': req.session.school}).sort({$natural:-1}) // Query to find the most recent exercises.
      .then(exercises => {
          console.log(stats.length);
          res.render('playerTrends', {
              email: stat.email,
              e1: stat.e1,
              e2: stat.e2,
              e3: stat.e3,
              e4: stat.e4,
              height: stat.height,
              weight: stat.weight,
              graph: stats,
              exercises : exercises,
              'name': req.session.name
            });
      })
    })
  }
));
/*
This method is called when a player wants to update their stats from the playerTrends page. It takes all form
fields as input and saves a new Stat to the Stat database for the user. 
*/
router.post('/updatestats', (req, res) => {
  //how to get it to recognize player email without them having to type it in?
  const {e1, e2, e3, e4, height, weight} = req.body;
  console.log(req.body);

  //Add new Stat to the database
  const newStat = new Stat({
      // _id: req.session._id, //MongoDB does not allow for ID's to be duplicated. You can create a database column for playerID, but not set _id.
      email: req.session.email,
      name: req.session.name,
      e1,
      e2,
      e3,
      e4,
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
