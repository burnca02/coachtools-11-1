const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
var fileUpload = require('express-fileupload');
var template = require('../template');
var upload = require('../upload');
const csv = require('fast-csv');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient
const uri = "mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true";

const Roster = require('../models/Roster');
const Questionnaire = require('../models/Questionnaire');
const CompleteQuest = require('../models/CompleteQuest');
const Stat = require('../models/Stat');

router.use(express.static("public"));

//photo
router.get('/coachToolsLogo.png', (req, res) => {
  res.sendFile('coachToolsLogo.png', { root: '.' })
});

router.use(fileUpload());
//Connect DB again??
const db = 'mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true&useNewUrlParser=true';
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true})
.then(() => console.log('Mongo DB Connected...'))
.catch(err => console.log(err));

router.get('/template', template.get);
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

router.get('/gameStats', ensureAuthenticated, (req, res) => {
  res.render('gameStats', {
  });
});

router.get('/submitquest', ensureAuthenticated, (req, res) => {
  res.render('playerFeedback');
});

router.get('/questionnaire', ensureAuthenticated, (req, res) => 
  res.render('questionnaire', {
    name: req.user.name //pass the name that was entered into the database to dashboard
}));

router.post('/upload', (req,res) => {
    if (!req.files)
            return res.status(400).send('No files were uploaded.');
        
        var rosterFile = req.files.file;

        var players = [];
            
        csv.parseString(rosterFile.data.toString(), {
            headers: true,
            ignoreEmpty: true
        })
        .on("data", function(data){
            data['_id'] = new mongoose.Types.ObjectId();
            
            players.push(data);
        })
        .on("end", function(){
            Roster.create(players, function(err, documents) {
                if (err) throw err;
            });

        });
        console.log("Uploaded to database");
        res.redirect('/coach/upload');
});

router.post('/submitquest', async(req,res) => {
  const { participants, whichpos, type, q1, q2, q3 } = req.body;
      var participantsArr = [];
        if(participants == 'all'){
          console.log('inside if');
          await Roster.find({School : req.session.school}, 'Email')
          .then(results => {
            for(var i = 0; i < results.length; i++){
              participantsArr.push(results[i].Email);
            }
          });
        } else {
          await Roster.find({ Pos: whichpos, School: req.session.school }, 'Email')//find all the documents where Pos = whichpos
          .then(results => {
          for(var i = 0; i < results.length; i++){
            participantsArr.push(results[i].Email);
          }});
        }
      console.log('arr:' + participantsArr);
    var questions = [q1, q2, q3];
    const newQuestionnaire = new Questionnaire({
      participants: participantsArr, //make sure variables passed match the model or refer to model variables
      type,
      questions
    });
    console.log('newQuest' + newQuestionnaire);
    //save user
    newQuestionnaire.save() //save to database
    .then(user => {
        res.redirect('/coach/playerFeedback');
    })
    .catch(err => console.log(err));
  // }
});

router.post('/viewResponse', ensureAuthenticated, async(req, res) => {
  console.log(req.body);
  const {type} = req.body;
  console.log(type);
  CompleteQuest.find({type: type, school: req.user.school}).sort({email: 1})
  .then(completeQuests => { //completeQuests will be array of all completed questionnaires(all types)
    console.log(completeQuests);
    var quests = [];
    for(var i = 0; i < completeQuests.length; i++){
      var condition = completeQuests[i].qID;
      console.log(condition);
      Questionnaire.findOne({_id: condition})
      .then(quest => {
        console.log('quest' + quest);
        quests[i] = quest.questions;
      });
    }
    console.log('quests' + quests);
    res.render('viewResponse', {
        'type': type,
        'completeQuests': completeQuests,
        'quests': quests
    });
  }
)});

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
router.post('/table', (req,res) => 
  {    
    const type = req.body.type;
  
    console.log("Did we get here");
    if(type == "wr")
    {
      Roster.find( {"Pos" : "WR", "School" :req.session.school})
        .then(results => {
            res.render('roster', {players: results,
                                  name : req.session.name,
                                  school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else if(type == "qb")
    {
      Roster.find( {"Pos" : "QB", "School" :req.session.school})
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else if(type == 'k')
    {
      Roster.find( {"Pos" : "K", "School" :req.session.school})
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else if(type == 'lb')
    {
      Roster.find( {"Pos" : "LB" , "School" :req.session.school })
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else if( type == 'gy')
    {
      Roster.find({ "GradYear": { "$exists": true }, "School" :req.session.school }).sort({'GradYear': 1})
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else if(type == 'gyd')
    {
      Roster.find({ "GradYear": { "$exists": true }, "School" :req.session.school }).sort({'GradYear': -1})
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else
    {
        Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school }).sort({'Pos': 1})
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    console.log(req.body)

})

module.exports = router;
