const express = require('express')
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Questionnaire = require('../models/Questionnaire');
const CompleteQuest = require('../models/CompleteQuest');

//Welcome Page
router.get('/', (req, res) => res.render('welcome'));

router.get('/test', (req, res) => res.render('test'));

router.get('/viewQuestionnaire', (req, res) => 
Questionnaire.find({}).sort({type: 'meeting'}).limit(1) //gets most recent doc, need to change so that all come through
.then(questionnaires => {
  console.log(questionnaires);
  if(questionnaires.length == 0){
      res.render('hold');
  }
  else{
    res.render('viewQuestionnaire', {
            q1: questionnaires[0].questions[0],
            q2: questionnaires[0].questions[1],
            q3: questionnaires[0].questions[2],
            type: questionnaires[0].type,
            //name: req.user.name
        });
    }
}
));
router.post('/viewQuestionnaire', (req, res) => {
    const { s1, s2, s3, comment, type} = req.body;
    console.log('completequest post method');
    console.log(req.body);
    var score = parseFloat((s1 + s2 + s3) / 3);
    console.log(score);
    const email = req.user.email;
    const newCompleteQuest = new CompleteQuest({
        email,
        score,
        type,
        comment
    });
  
    //save user
    newCompleteQuest.save()
    .then(stat => {
        req.flash('success_msg', 'Stats have been updated');
        res.redirect('playerHome');
    })
    .catch(err => console.log(err));
  });

//Coach Home Page
router.get('/coachHome', ensureAuthenticated, (req, res) => 
    res.render('coachHome', {
        name: req.user.name //pass the name that was entered into the database to dashboard
    })
);

//Player Home Page
router.get('/playerHome', ensureAuthenticated, (req, res) =>
    res.render('playerHome', {
        name: req.user.name //pass the name that was entered into the database to dashboard
    })
);
module.exports = router;
