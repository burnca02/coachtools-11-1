const express = require('express')
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Questionnaire = require('../models/Questionnaire');
const CompleteQuest = require('../models/CompleteQuest');
const MongoClient = require('mongodb').MongoClient
const uri = "mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true";

//Welcome Page
router.get('/', (req, res) => res.render('welcome'));

router.get('/test', (req, res) => res.render('test'));

router.get('/viewQuestionnaire', (req, res) => 
Questionnaire.find({type: "meeting"}).limit(1).sort({$natural: -1}) //gets most recent doc, need to change so that all come through
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


  MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
      const db = client.db('test');
      const rosterCollection = db.collection('Roster');
  
          //Coach Home Page`
      router.get('/coachHome', ensureAuthenticated, (req, res) => 
  
      db.collection('Roster').find({ "Pos": { "$exists": true }, "School": req.session.school}).sort({'Pos': 1}).toArray()
      .then(results => {
          res.render('coachHome', {players: results,
                                  name: req.user.name,
                                  school: req.session.school   
                                  }
                   )
      })
      .catch(error => console.error(error))
      );
    
      router.get('/roster', ensureAuthenticated, (req, res) => 

      db.collection('Roster').find({ "Pos": { "$exists": true }, "School": req.session.school}).sort({'Pos': 1}).toArray()
      .then(results => {
          res.render('roster', {players: results,
                                  name: req.user.name,
                                  school: req.session.school   
                                  }
                   )
    })
    .catch(error => console.error(error))
    );
  })
  .catch(console.error)

//Player Home Page
router.get('/playerHome', ensureAuthenticated, (req, res) =>
    res.render('playerHome', {
        name: req.user.name //pass the name that was entered into the database to dashboard
    })
);
module.exports = router;
