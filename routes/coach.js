const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
var fileUpload = require('express-fileupload');
var template = require('../template');
var upload = require('../upload');
const csv = require('fast-csv');
const mongoose = require('mongoose');

const Roster = require('../models/Roster');
const Questionnaire = require('../models/Questionnaire');
const CompleteQuest = require('../models/CompleteQuest');
const Stat = require('../models/Stat');

//photo
router.get('/coachToolsLogo.png', (req, res) => {
  res.sendFile('coachToolsLogo.png', { root: '.' })
});

router.use(fileUpload());
//Connect DB again??
const db = 'mongodb+srv://yoda:maytheforce@cluster0.fvmkx.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true})
.then(() => console.log('Mongo DB Connected...'))
.catch(err => console.log(err));

router.get('/template', template.get);
router.post('/upload', upload.post);
//upload function
router.get('/upload', ensureAuthenticated, (req, res) => 
  res.render('coachHome', {
    name: req.user.name //pass the name that was entered into the database to dashboard
}));

router.get('/playerFeedback', ensureAuthenticated, (req, res) => {
  res.render('playerFeedback', {
    name: req.user.name
  });
});

router.get('/submitquest', ensureAuthenticated, (req, res) => {
  res.render('playerFeedback');
});

router.get('/questionnaire', ensureAuthenticated, (req, res) => 
  res.render('questionnaire', {
    name: req.user.name //pass the name that was entered into the database to dashboard
}));


router.post('/submitquest', (req,res) => {
  const { participants, whichpos, type, q1, q2, q3 } = req.body;
  console.log(req.body);
  console.log(participants);

  var participantsArr = [];
  //how to get list of specific email addresses for questionnaire to be sent to?
  if(participants == 'all'){
    console.log('All Participants');
    Roster.find({}), (err, results) => {
      console.log('Results');
      participantsArr.push(results.Email); //need to push all emails in here
    }
  } else {
    console.log('Participants by Position');
    Roster.find({ Pos: whichpos }, function (err, results) { //find all the documents where Pos = whichpos
      console.log(results); //works
      console.log(results.Email); //doesn't work
      if (err){ 
          console.log(err); 
      } 
      else{ 
          participantsArr.push(results.Email); //push only emails from results
          console.log("All participants added by Position");
          console.log(participantsArr); //doesn't work
      } 
    }); 
  }
  var questions = [q1, q2, q3];
  const newQuestionnaire = new Questionnaire({
    participantsArr,
    type,
    questions
  });
    console.log(newQuestionnaire);
    //save user
    newQuestionnaire.save() //save to database
    .then(user => {
        res.redirect('/coach/playerFeedback');
    })
    .catch(err => console.log(err));
});

router.get('/viewResponse', ensureAuthenticated, (req, res, next) => 
  CompleteQuest.find({})
  .then(completeQuests => { //completeQuests will be array of all completed questionnaires(all types)
    res.render('viewResponse', {
          //loop to show all values of all completed questionnaires
          email: completeQuests[0].email,
          type: completeQuests[0].type,
          score: completeQuests[0].score,
          comment: completeQuests[0].comment
        });
  }
));

router.get('/practiceTrainingStats', ensureAuthenticated, (req, res) => 
  Stat.find({}).sort({$natural:-1})
  .then(stat => {
    console.log(stat.bench);
    res.render('practiceTrainingStats', {
          name: req.user.name,
          email: stat[0].email,
          bench: stat[0].bench,
          squat: stat[0].squat,
          dead: stat[0].dead,
          mile: stat[0].mile,
          height: stat[0].height,
          weight: stat[0].weight
        });
}));
router.get('/practiceStats', ensureAuthenticated, (req, res) => 
  res.render('practiceStats', {
    name: req.user.name //pass the name that was entered into the database to dashboard
}));

module.exports = router;
