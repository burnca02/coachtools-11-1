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
            _id: questionnaires[0]._id.toString()
            //name: req.user.name
        });
    }
}
));

router.post('/viewQuestionnaire', (req, res) => {
    const { q1, q2, q3, comment, qtype, qid} = req.body;
    const name = req.user.name;
    //console.log(req.body);
    var score = [q1, q2, q3];
    var qID = qid;
    const email = req.user.email;
    const school = req.user.school;
    console.log('type' + qtype);
    const type = qtype;
    const newCompleteQuest = new CompleteQuest({
        qID,
        name,
        email,
        school,
        score,
        type,
        comment
    });
    //remove player from questionnaire participants list
    Questionnaire.findOneAndUpdate({_id: qID})
    .then(result => {
        console.log('result' + result);
        const index = result.participants.indexOf(email);
        if (index > -1) {
            console.log('remove email');
            result.participants.splice(index, 1);
        }
        console.log(result.participants);
        result.save();
    });
    //save completed questionnaire
    newCompleteQuest.save()
    .then(quest => {
        req.flash('success_msg', 'Questionnaire has been submitted');
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

      router.get('/depthChart', ensureAuthenticated, (req, res) => 

      db.collection('Roster').find({ "Pos": { "$exists": true }, "School": req.session.school}).sort({'Pos': 1}).toArray()
      .then(results => {
          res.render('depthChart', {players: results,
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
router.get('/coachHome', ensureAuthenticated, (req, res) => 
    res.render('coachHome', {
        name: req.user.name //pass the name that was entered into the database to dashboard
    })
);
module.exports = router;
