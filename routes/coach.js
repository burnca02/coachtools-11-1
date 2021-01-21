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
const PracticeStat = require('../models/PracticeStat');

router.use(express.static("public"));

//photo
router.get('/coachToolsLogo.png', (req, res) => {
  res.sendFile('coachToolsLogo.png', { root: '.' })
});

router.use(fileUpload());
//Connect DB again??
const db = 'mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true&useNewUrlParser=true';
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true, useFindAndModify: false})
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
/*
This method is called when a coach submits a questionnaire. It takes all fields on the questionnaire 
as input. The query then searches the Roster database to find the appropriate emails for the 
questionnaire to be sent to. The method then creates the new questionnaire and redirects to the 
playerFeedback screem.
*/
router.post('/submitquest', async(req,res) => {
  const { participants, whichpos, type, q1, q2, q3 } = req.body;
      var participantsArr = [];
      console.log('inside submit quest');
      if(participants == 'all'){
        await Roster.find({School : req.session.school}, 'Email')
        .then(results => {
          for(var i = 0; i < results.length; i++){
            participantsArr.push(results[i].Email);
            results[i].Attendance[1]++; //increment the # of questionnaires given [taken, given]
          }
        });
      } else {
        await Roster.find({ Pos: whichpos, School: req.session.school }, 'Email')//find all the documents where Pos = whichpos
        .then(results => {
          console.log('inside if');
          console.log('results' + results[0].Attendance);
          for(var i = 0; i < results.length; i++){
            participantsArr.push(results[i].Email);
            Roster.findOneAndUpdate(results[i]._id)
            .then(result => {
              result.Attendance[1]++; //increment players given questionnaires
            })
          }});
      }
    var questions = [q1, q2, q3];
    const newQuestionnaire = new Questionnaire({
      participants: participantsArr, //make sure variables passed match the model or refer to model variables
      type,
      questions,
      school: req.user.school
    });
    //save user
    newQuestionnaire.save() //save to database
    .then(user => {
        res.redirect('/coach/playerFeedback');
    })
    .catch(err => console.log(err));
  // }
});
/*
This method is called when the coach hits 'View Responses' on the player feedback screen. The
method takes the questionnaire type as input. The queries below find all completed questionnaires for the users school and the FullNames associated with each
questionnaire. Currently the method is not pulling the questions from the Questionnaire database, only
the scores from the CompletedQuestionnaire database.
*/
router.post('/viewResponse', ensureAuthenticated, async(req, res) => {
  const {type} = req.body;
  await CompleteQuest.find({type: type, school: req.session.school}) //.sort({email: 1})
  .then(completeQuests => { //completeQuests will be array of all completed questionnaires(all types)
    console.log('completequests ' + completeQuests);
    var quests = [];
    var dates = [];
    for(var i = 0; i < completeQuests.length; i++){
      var condition = completeQuests[i].qID;
      var email = completeQuests[i].email;
      var date = String(completeQuests[i].date);
      var dateSplit = date.split(" ");
      var newString = dateSplit[0];
      newString = newString.concat(", " + dateSplit[1] + " " + dateSplit[2] + " " + dateSplit[3]);

      dates.push(newString);
      console.log(newString);
      Questionnaire.findOne({_id: condition}) //We need to look into this because it is returning null and there is no such thing as a qID.
      .then(quest => {
        quests[i] = quest.questions[i];
      });
    }
    Roster.findOne({email: email})
      .then(player => {
        name = player.FullName;
      });
    res.render('viewResponse', {
        'type': type,
        'name': req.session.name,
        'completeQuests': completeQuests,
        'quests': quests,
        'date' : dates
    });
  }
)});
/*
This method is the get for the practice training stats page. The query below pulls the most recent stats
for each player. This data populates the table on practiceTrainingStats.ejs
*/
router.get('/practiceTrainingStats', ensureAuthenticated, (req, res) => 
  Stat.find({}).sort({$natural:-1}).limit(1)
  .then(stats => {
    res.render('practiceTrainingStats', {
          'stats': stats,
          'name': req.user.name
    });
  })
);
/*
This method is the get for the practice stats page. The query below gets all intangibles from the database
and sends them to the ejs page. The intangibles populate the dropdown menu on practiceStats.ejs
*/
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

router.get('/gameGrade', ensureAuthenticated, (req, res) => 
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
  res.render('gameGrade', { //need to send all stats data here too
        'positions': positions,
        'name': req.user.name
      });
  }).catch(err => console.log(err))
);
/*
This method is the get for the player comparison page. The query below sends the names of all players 
from the user's school to populate the 2 drop down menus on playerComp.ejs
*/
router.get('/playerComp', ensureAuthenticated, (req, res) => 
  Roster.find({School: req.user.school})
  .then(players => {
      const names = [];
      for(var i = 0; i < players.length; i++) {
        names[i] = players[i].FullName;
      }
      res.render('playerComp', {
        name: req.user.name,
        'players': names
    })
  })
);
/*
This method is called once the submit button is pressed on the player comparison page. It takes the two
player names as inputs and then finds both players' practice stats. Eventually it will also pull both
players' game grades and attendance rates once that data is available in the database.
*/
router.post('/dispComp', ensureAuthenticated, async(req, res) => {
    const {name1, name2} = req.body; 
    await Roster.findOne({'FullName': name1})
    .then(player => {
      const email1 = player.Email;
      const pos1 = player.Pos;
      Roster.findOne({'FullName': name2})
      .then(player => {
        const email2 = player.Email;
        const pos2 = player.Pos;
        PracticeStat.findOne({'email': email1}).sort({$natural: -1})
        .then(stat => {
          var practice1 = '';
          if(stat == null){
            practice1 = 'No Grade'
          } else {
            practice1 = stat.grade;
          }
          PracticeStat.findOne({'email': email2}).sort({$natural: -1})
          .then(stat => {
            var practice2 = '';
            if(stat == null){
              practice2 = 'No Grade'
            } else {
              practice2 = stat.grade;
            }
            //This will get the information needed for the graph. 
            Stat.find({ email: email1 }).sort({createdAt:1}) //This query will be used to populate the graph.
            .then(stats =>
            {
              Stat.find({ email: email2 }).sort({createdAt:1}) //This query will be used to populate the graph.
              .then(stats2 =>
                {
                  res.render('dispComp', {
                    'name1': name1,
                    'name2': name2,
                    'pos1': pos1,
                    'pos2': pos2,
                    'practice1': practice1,
                    'practice2': practice2,
                    name: req.user.name, //pass the name that was entered into the database to dashboard
                    'graph1': stats,
                    'graph2': stats2
                  })
                })  
            })
          })
        })
    })
  })
});


/**
 * This method will just take you to the roster page and sort the school roster by position in alphabetical order.
 */
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


/*
This method searches the roster databases and finds all unique position codes in a school's roster. 
These position codes are then sent to submitIntangibles.ejs to display in a dropdown menu for the coach.
*/
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


/**
 * This post method deals with the sorting function available in the coach's side for sorting a roster by position, or school year. 
 * You have the ability to sort by Position, graduation year, or showing the whole roster. Initially all rosters will be ordered alphabetically by position. 
 */
router.post('/table', (req,res) => 
  {    
    const type = req.body.type;
  
    console.log("Did we get here");
    if(type == "wr") //Given the type selected in the sort roster function, the query will only search for that position.
    {
      //We add the school name in the find query because we only care about searching the roster database of the coach's school.
      Roster.find( {"Pos" : "WR", "School" :req.session.school})
        .then(results => {
            res.render('roster', {players: results,
                                  name : req.session.name,
                                  school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else if(type == "qb") //Will sort by quarterback
    {
      Roster.find( {"Pos" : "QB", "School" :req.session.school})
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else if(type == 'k') //Will sort by Kicker
    {
      Roster.find( {"Pos" : "K", "School" :req.session.school})
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else if(type == 'lb') //Will sort by Linebackers
    {
      Roster.find( {"Pos" : "LB" , "School" :req.session.school })
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else if( type == 'gy') //Will sort by grad year ascending
    {
      Roster.find({ "GradYear": { "$exists": true }, "School" :req.session.school }).sort({'GradYear': 1}) 
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else if(type == 'gyd') //Will sort by grad year descending
    {
      Roster.find({ "GradYear": { "$exists": true }, "School" :req.session.school }).sort({'GradYear': -1})
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else //Otherwise view the whole roster alphabetically. 
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
