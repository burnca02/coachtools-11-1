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
const Intangibles = require('../models/Intangibles');

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

router.get('/gameStats', ensureAuthenticated, (req, res) => {
  res.render('gameStats', {
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

// router.post('/upload', (req,res) => {
//     if (!req.files)
//         return res.status(400).send('No files were uploaded.');

//     /**
//      * This function will delete all of the data in the database. This is necessary so that whenever the coach
//      * uploads another roster there will be no duplicates and it willl be a clean slate.
//      * 
//      * This an async function so that we give time for the query to finish before adding new players to the rosters database. 
//      */
//     async function deleteData(){
//       const mongo = await mongoose.connection.db.collection('Roster').deleteMany({School: req.session.school});
//     } 

//   deleteData();
        
//         var rosterFile = req.files.file;

//         var players = [];
            
//         csv.parseString(rosterFile.data.toString(), {
//             headers: true,
//             ignoreEmpty: true
//         })
//         .on("data", function(data){
//             data['_id'] = new mongoose.Types.ObjectId();
//             data['School'] = req.session.school;
//             data['Email'] = null;

//             players.push(data);
//         })
//         .on("end", function(){
//             Roster.create(players, function(err, documents) {
//                 if (err) throw err;
//             });
//           });
//         console.log("Uploaded to database 2");
//         res.redirect('/coach/roster');
// });

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
  console.log('type ' + type);
  await CompleteQuest.find({type: type, school: req.user.school}).sort({email: 1})
  .then(completeQuests => { //completeQuests will be array of all completed questionnaires(all types)
    console.log('completequests ' + completeQuests);
    var quests = [];
    for(var i = 0; i < completeQuests.length; i++){
      var condition = completeQuests[i].qID;
      var email = completeQuests[i].email;
      console.log('email ' + email);
      console.log(condition);
      Questionnaire.findOne({_id: condition})
      .then(quest => {
        console.log('quest' + quest);
        quests[i] = quest.questions;
      });
      Roster.findOne({email: email})
      .then(player => {
        console.log('name' + name);
        quests[i] = quest.questions;
      });
    }
    console.log('quests' + quests);
    res.render('viewResponse', {
        'type': type,
        'name': name,
        'completeQuests': completeQuests,
        'quests': quests
    });
  }
)});

router.get('/practiceTrainingStats', ensureAuthenticated, (req, res) => 
  Stat.find({}).sort({$natural:-1})
  .then(stats => {
    res.render('practiceTrainingStats', {
          'stats': stats,
          'name': req.user.name
    });
  })
);

router.get('/practiceStats', ensureAuthenticated, (req, res) => 
  Intangibles.find({school: req.user.school})
  .then(intangibles => {
  const positions = [];
  for(var i = 0; i < intangibles.length; i++){
    if(!(positions.includes(intangibles[i].pos))){ //adds only unique positions to array, no duplicates
      positions.push(intangibles[i].pos);
      console.log('added' + positions[i]);
    }
  }
  console.log('positions' + positions);
  res.render('practiceStats', { //need to send all stats data here too
        'positions': positions,
        'name': req.user.name
      });
  }).catch(err => console.log(err))
);

router.get('/roster', ensureAuthenticated, (req, res) => 
  Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school }).sort({'Pos': 1})
  .then(results => {
  res.render('roster', {players: results,
    name : req.session.name,
    school: req.session.school})
  })
  .catch(error => console.error(error))
);

router.get('/depthChart', ensureAuthenticated, (req, res) => 
  Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school }).sort({'Pos': 1})
  .then(results => {
  res.render('depthChart', {players: results,
    name : req.session.name,
    school: req.session.school})
  })
  .catch(error => console.error(error))
);
//This method searches the roster databases and finds all unique position codes in a school's roster. 
//These position codes are then sent to submitIntangibles.ejs to display in a dropdown menu for the coach.
router.get('/submitIntangibles', ensureAuthenticated, (req, res) => 
  Roster.find({School: req.user.school})
  .then(players => {
  const positions = [];
  for(var i = 0; i < players.length; i++){
    if(!(positions.includes(players[i].Pos))){ //adds only unique positions to array, no duplicates
      positions.push(players[i].Pos);
      console.log('addedint' + positions[i]);
    }
  }
  console.log(positions);
  res.render('submitIntangibles', {
      'positions': positions 
    });
  }).catch(err => console.log(err))
);

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
