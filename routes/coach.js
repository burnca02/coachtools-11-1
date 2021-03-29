const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
var fileUpload = require('express-fileupload');
var template = require('../template');
const csv = require('fast-csv');
// const upload = require('../upload');
const mongoose = require('mongoose');
const multer = require('multer')
const fs = require("fs");
const MongoClient = require('mongodb').MongoClient
const uri = "mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true";

const Roster = require('../models/Roster');
const Questionnaire = require('../models/Questionnaire');
const CompleteQuest = require('../models/CompleteQuest');
const Stat = require('../models/Stat');
const Intangibles = require('../models/Intangibles');
const Exercises= require('../models/Exercise');
const PracticeStat = require('../models/PracticeStat');
const GameGrade = require('../models/GameGrade');
const Exercise = require('../models/Exercise');

//router.use(multer({dest:'/uploads'}).single('playbook')); 
// const tmpobj = tmp.dirSync();
// console.log('Dir: ', tmpobj.name);
// // Manual cleanup
// tmpobj.removeCallback();

router.use(express.static("public"));

//photo
router.get('/coachToolsLogo.png', (req, res) => {
  res.sendFile('coachToolsLogo.png', { root: '.' })
});

// router.use(fileUpload());

router.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp/',
  debug : true
}));
//Connect DB again??
const db = 'mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true&useNewUrlParser=true';
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true, useFindAndModify: false})
.then(() => console.log('Mongo DB Connected...'))
.catch(err => console.log(err));

router.get('/template', template.get);
// router.post('/upload', upload.post);

router.get('/pbUpload2', ensureAuthenticated, (req, res) => {
  res.render('pbUpload2', {
    school: req.session.school
  });
}); 
//upload function
router.get('/upload', ensureAuthenticated, (req, res) => 
  res.render('coachHome', {
    name: req.user.name //pass the name that was entered into the database to dashboard
}));
router.get('/playbookUpload', ensureAuthenticated, (req, res) => {
  const path = 'public/uploads/' +req.session.school + ' Playbook.pdf';
  var exists = "true";

    try {
      if (fs.existsSync(path)) {
        //file exists
        console.log("File exisits");
      }
      else{
        exists = "false";
        console.log("File does not exist");
      }
    } catch(err) {
      console.error(err)
    }
  res.render('playbookUpload', {
    name: req.user.name,
    'inDirectory': exists
  });
}); 

router.get('/viewPDF', ensureAuthenticated, (req, res) => {
  res.render('viewPDF', {
    name: req.user.name
  });
}); 

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

router.get('/questionnaire', ensureAuthenticated, (req, res) => {
  console.log('inside questionnaire');
  Roster.find({school: req.user.school})
  .then(roster => {
    const positions = [];
    for(var i = 0; i < roster.length; i++){
      if(!(positions.includes(roster[i].Pos))){ //adds only unique positions to array, no duplicates
        positions.push(roster[i].Pos);
        console.log('added' + positions[i]);
      }
    }
    console.log('positions COACH.js ' + positions);
    res.render('questionnaire', { //need to send all stats data here too
          'positions': positions,
          'name': req.user.name
    });
  }).catch(err => console.log(err))
});
/*
This method is called when a coach submits a questionnaire. It takes all fields on the questionnaire 
as input. The query then searches the Roster database to find the appropriate emails for the 
questionnaire to be sent to. The method then creates the new questionnaire and redirects to the 
playerFeedback screem.
*/
router.post('/submitquest', async(req,res) => {
  const { participants, whichpos, type, q1, q2, q3, timeout} = req.body;
  let errors = [];
  if(q1 == '' || q2 == '' || q3 == ''){
    errors.push({msg: "Please enter 3 questions"});
  }
  if(errors.length > 0){
    Roster.find({school: req.user.school})
    .then(roster => {
      const positions = [];
      for(var i = 0; i < roster.length; i++){
        if(!(positions.includes(roster[i].Pos))){ //adds only unique positions to array, no duplicates
          positions.push(roster[i].Pos);
          console.log('added' + positions[i]);
        }
      }
      console.log('positions COACH.js ' + positions);
      res.render('questionnaire', { //need to send all stats data here too
            errors,
            'positions': positions,
            'name': req.user.name
      });
    }).catch(err => console.log(err))
  }
      var participantsArr = [];
      console.log('inside submit quest');
      if(participants == 'all'){
        await Roster.find({School : req.session.school}, 'Email')
        .then(results => {
          for(var i = 0; i < results.length; i++){
            participantsArr.push(results[i].Email);
            //results[i].Attendance[1]++; //increment the # of questionnaires given [taken, given]
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
      timeout,
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
router.get('/viewResponse', ensureAuthenticated, (req, res) => {
  res.render('coachHome', {
    name: req.user.name
  });
}); 
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
    // Roster.findOne({email: email})
    //   .then(player => {
    //     name = player.FullName;
    //   });
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
router.get('/practiceTrainingStats', ensureAuthenticated, (req, res) => {
  const school = req.user.school;
  Exercise.findOne({school: school}).sort({$natural:-1})
  .then(exercise => {
    console.log("exercise " + exercise);
    if(exercise == null){
      res.redirect('/coach/submitExercises');
    }
  }),
  Stat.find({school: school}).sort({$natural:-1})
  .then(stats => {
    Intangibles.find({school: req.user.school})
    .then(intangibles => {
    const positions = [];
    for(var i = 0; i < intangibles.length; i++){
      if(!(positions.includes(intangibles[i].pos))){ //adds only unique positions to array, no duplicates
        positions.push(intangibles[i].pos);
        console.log('added' + positions[i]);
      }
    }
    Exercises.findOne({school: req.session.school}).sort({$natural:-1})
    .then(exercises => {
      res.render('practiceTrainingStats', {
        'stats': stats,
        'positions': positions,
        'exercises': exercises,
        'name': req.user.name
      });
    })
  })
  })
});
/* Post method to change position group */
router.post('/practiceTrainingStats', ensureAuthenticated, (req, res) => 
  Stat.find({}).sort({$natural:-1})
  .then(stats => {
    Exercises.findOne({school: req.session.school}).sort({$natural:-1})
    .then(exercises => {
      res.render('practiceTrainingStats', {
        'stats': stats,
        'positions': positions,
        'exercises': exercises,
        'name': req.user.name
      });
    })
  })
);
/*
This method is the get for the practice stats page. The query below gets all intangibles from the database
and sends them to the ejs page. The intangibles populate the dropdown menu on practiceStats.ejs
*/
router.get('/practiceStats', ensureAuthenticated, (req, res) => {
    Intangibles.find({school: req.user.school})
    .then(intangibles => {
      console.log("if check");
      if(intangibles.length == 0){
        res.redirect("/coach/submitIntangibles");
      }
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
});

router.get('/gameGrade', ensureAuthenticated, (req, res) => 
  // console.log("in coach gameGrade")
  Intangibles.find({school: req.user.school})
  .then(intangibles => {
    console.log("if check");
    if(intangibles.length == 0){
      res.redirect("/coach/submitIntangibles");
    }
    const positions = [];
    for(var i = 0; i < intangibles.length; i++){
      if(!(positions.includes(intangibles[i].pos))){ //adds only unique positions to array, no duplicates
        positions.push(intangibles[i].pos);
        console.log('added' + positions[i]);
      }
    }
    console.log('positions COACH.js ' + positions);
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
    let errors = [];
    if(name1 == '' || name2 == ''){
      errors.push({msg: "Please select two players to compare."})
    }
    console.log(errors.length);
    if(errors.length > 0){
      Roster.find({School: req.user.school})
      .then(players => {
        const names = [];
        for(var i = 0; i < players.length; i++) {
          names[i] = players[i].FullName;
        }
        res.render('playerComp', {
          errors,
          name: req.user.name,
          'players': names
        })
      })
    }
    else {
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
              GameGrade.findOne({'email': email1}).sort({$natural: -1})
              .then(game => {
                var game1 = '';
                if(game == null){
                  game1 = 'No Grade'
                } else {
                  game1 = game.grade;
                }
                console.log("game1 " + game1);
                GameGrade.findOne({'email': email2}).sort({$natural: -1})
                .then(game => {
                  var game2 = '';
                  if(game == null){
                    game2 = 'No Grade'
                  } else {
                    game2 = game.grade;
                  }
                  console.log("game2 " + game2);
                  //This will get the information needed for the graph. 
                  Stat.find({ email: email1 }).sort({createdAt:1}) //This query will be used to populate the graph.
                  .then(stats => {
                    Stat.find({ email: email2 }).sort({createdAt:1}) //This query will be used to populate the graph.
                    .then(stats2 => {
                        res.render('dispComp', {
                          errors,
                          'name1': name1,
                          'name2': name2,
                          'pos1': pos1,
                          'pos2': pos2,
                          'practice1': practice1,
                          'practice2': practice2,
                          'game1': game1,
                          'game2': game2,
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
          })
        })
      }
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

router.get('/depthChart', ensureAuthenticated, async(req, res) => {
  const offPlayersPos1= ['QB','RB','FB','WR','TE','LT','LG','C','RG','RT']
  const defPlayersPos = ['CB','DB','DE','DL','DT','FS','ILB','LB','MLB','OLB','SS']
  const spePlayersPos = ['K/P','LS']
  await Roster.find({ "Pos": { "$exists": true}, "School" :req.session.school, "Pos": { "$in" : offPlayersPos1}}).sort({'Pos': 1, 'Rank' : 1})
  .then(offPlayers => {
      Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school, "Pos": { "$in" : defPlayersPos}}).sort({'Pos': 1, 'Rank' : 1})
      .then(defPlayers => {
          Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school, "Pos": { "$in" : spePlayersPos}}).sort({'Pos': 1, 'Rank': 1})
          .then(spePlayers => {
            Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school, "Pos": "QB" }).sort({'Pos': 1})
              .then(aPlayers => {
                res.render('depthChart', {
                    players: aPlayers,
                    offPlayersPos : offPlayersPos1,
                    "defPlayersPos" : defPlayersPos,
                    "spePlayersPos" : spePlayersPos,
                    "offPlayers" : offPlayers, 
                    "defPlayers" : defPlayers,
                    "spePlayers" : spePlayers,
                    name: req.session.name,
                    school: req.session.school})
            }).catch(error => console.error(error))
          }).catch(error => console.error(error))
      }).catch(error => console.error(error))
  }).catch(error => console.error(error))
});

//BUG WITH RELOADING!!!!NOT SURE HOW TO FIX!!!DATA ISN'T STORED
router.post('/depthChart', ensureAuthenticated, async(req, res) => {
  const type = req.body.type;
  const offPlayersPos1 = ['QB','RB','FB','WR','TE','LT','LG','C','RG','RT']
  const defPlayersPos = ['CB','DB','DE','DL','DT','FS','ILB','LB','MLB','OLB','SS']
  const spePlayersPos = ['K/P','LS']
  await Roster.find({ "Pos": { "$exists": true}, "School" :req.session.school, "Pos": { "$in" : offPlayersPos1}}).sort({'Pos': 1, 'Rank' : 1})
  .then(offPlayers => {
      Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school, "Pos": { "$in" : defPlayersPos}}).sort({'Pos': 1, 'Rank' : 1})
      .then(defPlayers => {
          Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school, "Pos": { "$in" : spePlayersPos}}).sort({'Pos': 1, 'Rank': 1})
          .then(spePlayers => {
            Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school }).sort({'Pos': 1})
              .then(aPlayers => {
                if (type != 'full') {
                  Roster.find( {"Pos" : type, "School" :req.session.school })
                    .then(results => {
                      res.render('depthChart', {
                        players: results, 
                        aPlayers: aPlayers,
                        offPlayersPos : offPlayersPos1,
                        "defPlayersPos" : defPlayersPos,
                        "spePlayersPos" : spePlayersPos,
                        "offPlayers" : offPlayers, 
                        "defPlayers" : defPlayers,
                        "spePlayers" : spePlayers,
                        name : req.session.name,
                        school: req.session.school})
                    })
                    .catch(error => console.error(error))
                }
                else //Otherwise view the whole roster alphabetically. 
                {
                    Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school }).sort({'Pos': 1})
                    .then(results => {
                      res.render('depthChart', {
                        players: results, 
                        aPlayers: aPlayers,
                        offPlayersPos : offPlayersPos1,
                        "defPlayersPos" : defPlayersPos,
                        "spePlayersPos" : spePlayersPos,
                        "offPlayers" : offPlayers, 
                        "defPlayers" : defPlayers,
                        "spePlayers" : spePlayers,
                        name : req.session.name,
                        school: req.session.school
                      })
                    })
                    .catch(error => console.error(error))
                }
              }).catch(error => console.error(error))
          }).catch(error => console.error(error))
      }).catch(error => console.error(error))
  }).catch(error => console.error(error))
});
//Error with reloading here - the get function cant get the current position
//Can we store a session variable or something?
router.get('/position', ensureAuthenticated, async(req, res) => {
  // console.log("in coach call of position")
  await Roster.find({ "Pos": { "$exists": true}, "School" :req.session.school, "Pos": 'QB'}).sort({'Pos': 1, 'Rank' : 1})
            .then(posPlayers => {
              var emails = [];
              for (var i = 0; i < posPlayers.length; i++) {
                emails.push(posPlayers[i].Email)
              }
                GameGrade.find({'email': {"$exists":true}, 'email': emails}).sort({$natural:-1})
                .then(grade => {
                  var grades = [];
                  for (var i = 0; i < posPlayers.length; i++) {
                    var f = false
                    for (var j = 0; j < grade.length; j++) {
                      if (posPlayers[i].Email == grade[j].email) {
                        grades.push(grade[j].grade)
                        f = true
                      }
                    }
                    if (f == false) {
                      grades.push('N/A')
                    }
                  }
                  PracticeStat.find({'email': {"$exists":true}, 'email': emails}).sort({$natural:-1})
                .then(stat => {
                  var stats = [];
                  for (var i = 0; i < posPlayers.length; i++) {
                    var f = false
                    for (var j = 0; j < stat.length; j++) {
                      if (posPlayers[i].Email == stat[j].email) {
                        stats.push(stat[j].grade)
                        f = true
                        break;
                      }
                    }
                    if (f == false) {
                      stats.push('N/A')
                    }
                  }
                res.render('position', {
                    pos : 'QB',
                    posPlayers : posPlayers,
                    gameGrades : grades,
                    practiceStats : stats,
                    name: req.session.name,
                    school: req.session.school})
                  }).catch(error => console.error(error))
                }).catch(error => console.error(error))
            }).catch(error => console.error(error))
})

//Error with reloading here - the get function cant get the current position
//Can we store a session variable or something?
router.get('/posSubmitRank', ensureAuthenticated, async(req, res) => {
  // console.log("in coach call of position")
  await Roster.find({ "Pos": { "$exists": true}, "School" :req.session.school, "Pos": 'QB'}).sort({'Pos': 1, 'Rank' : 1})
            .then(posPlayers => {
              var emails = [];
              for (var i = 0; i < posPlayers.length; i++) {
                emails.push(posPlayers[i].Email)
              }
                GameGrade.find({'email': {"$exists":true}, 'email': emails}).sort({$natural:-1})
                .then(grade => {
                  var grades = [];
                  for (var i = 0; i < posPlayers.length; i++) {
                    var f = false
                    for (var j = 0; j < grade.length; j++) {
                      if (posPlayers[i].Email == grade[j].email) {
                        grades.push(grade[j].grade)
                        f = true
                      }
                    }
                    if (f == false) {
                      grades.push('N/A')
                    }
                  }
                  PracticeStat.find({'email': {"$exists":true}, 'email': emails}).sort({$natural:-1})
                .then(stat => {
                  var stats = [];
                  for (var i = 0; i < posPlayers.length; i++) {
                    var f = false
                    for (var j = 0; j < stat.length; j++) {
                      if (posPlayers[i].Email == stat[j].email) {
                        stats.push(stat[j].grade)
                        f = true
                        break;
                      }
                    }
                    if (f == false) {
                      stats.push('N/A')
                    }
                  }
                res.render('position', {
                    pos : 'QB',
                    posPlayers : posPlayers,
                    gameGrades : grades,
                    practiceStats : stats,
                    name: req.session.name,
                    school: req.session.school})
                  }).catch(error => console.error(error))
                }).catch(error => console.error(error))
            }).catch(error => console.error(error))
})

router.post('/position', ensureAuthenticated, async(req, res) => {
  const pos = req.body.pos
  await Roster.find({ "Pos": { "$exists": true}, "School" :req.session.school, "Pos": pos}).sort({'Pos': 1, 'Rank' : 1})
            .then(posPlayers => {
              var emails = [];
              for (var i = 0; i < posPlayers.length; i++) {
                emails.push(posPlayers[i].Email)
              }
                GameGrade.find({'email': {"$exists":true}, 'email': emails}).sort({$natural:-1})
                .then(grade => {
                  var grades = [];
                  for (var i = 0; i < posPlayers.length; i++) {
                    var f = false
                    for (var j = 0; j < grade.length; j++) {
                      if (posPlayers[i].Email == grade[j].email) {
                        grades.push(grade[j].grade)
                        f = true
                      }
                    }
                    if (f == false) {
                      grades.push('N/A')
                    }
                  }
                  PracticeStat.find({'email': {"$exists":true}, 'email': emails}).sort({$natural:-1})
                .then(stat => {
                  var stats = [];
                  for (var i = 0; i < posPlayers.length; i++) {
                    var f = false
                    for (var j = 0; j < stat.length; j++) {
                      if (posPlayers[i].Email == stat[j].email) {
                        stats.push(stat[j].grade)
                        f = true
                        break;
                      }
                    }
                    if (f == false) {
                      stats.push('N/A')
                    }
                  }
                res.render('position', {
                    pos : pos,
                    posPlayers : posPlayers,
                    gameGrades : grades,
                    practiceStats : stats,
                    name: req.session.name,
                    school: req.session.school})
                  }).catch(error => console.error(error))
                }).catch(error => console.error(error))
            }).catch(error => console.error(error))
});

router.post('/submitRank', ensureAuthenticated, async (req, res) => {
  const rank = req.body.rank
  const pNames = req.body.playerNames
  const type = req.body.type
  for (var i = 0; i < rank.length; i++) {
    let doc = await Roster.findOneAndUpdate({FullName : pNames[i], School : req.session.school}, {Rank : rank[i]}, {new:true, upsert: true});
    doc.save();
  }
  const offPlayersPos1 = ['QB','RB','FB','WR','TE','LT','LG','C','RG','RT']
  const defPlayersPos = ['CB','DB','DE','DL','DT','FS','ILB','LB','MLB','OLB','SS']
  const spePlayersPos = ['K/P','LS'];
  await Roster.find({ "Pos": { "$exists": true}, "School" :req.session.school, "Pos": { "$in" : offPlayersPos1}}).sort({'Pos': 1, 'Rank' : 1})
  .then(offPlayers => {
      Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school, "Pos": { "$in" : defPlayersPos}}).sort({'Pos': 1, 'Rank' : 1})
      .then(defPlayers => {
          Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school, "Pos": { "$in" : spePlayersPos}}).sort({'Pos': 1, 'Rank': 1})
          .then(spePlayers => {
            Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school }).sort({'Pos': 1})
              .then(aPlayers => {
                if (type != 'full') {
                  Roster.find( {"Pos" : type, "School" :req.session.school })
                    .then(results => {
                      res.render('depthChart', {
                        players: results, 
                        aPlayers: aPlayers,
                        offPlayersPos : offPlayersPos1,
                        "defPlayersPos" : defPlayersPos,
                        "spePlayersPos" : spePlayersPos,
                        "offPlayers" : offPlayers, 
                        "defPlayers" : defPlayers,
                        "spePlayers" : spePlayers,
                        name : req.session.name,
                        school: req.session.school})
                    })
                    .catch(error => console.error(error))
                }
                else //Otherwise view the whole roster alphabetically. 
                {
                    Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school }).sort({'Pos': 1})
                    .then(results => {
                      res.render('depthChart', {
                        players: results, 
                        aPlayers: aPlayers,
                        offPlayersPos : offPlayersPos1,
                        "defPlayersPos" : defPlayersPos,
                        "spePlayersPos" : spePlayersPos,
                        "offPlayers" : offPlayers, 
                        "defPlayers" : defPlayers,
                        "spePlayers" : spePlayers,
                        name : req.session.name,
                        school: req.session.school
                      })
                    })
                    .catch(error => console.error(error))
                }
              }).catch(error => console.error(error))
          }).catch(error => console.error(error))
      }).catch(error => console.error(error))
  }).catch(error => console.error(error))
});

router.post('/posSubmitRank', ensureAuthenticated, async (req, res) => {
  const pos = req.body.pos
  // console.log("pos in posSubmit: " + pos)
  const rank = req.body.rank
  // console.log("ranks in posSubmit: " + rank)
  const pNames = req.body.playerNames
  // console.log("pNames in posSubmit: " + pNames)
  for (var i = 0; i < rank.length; i++) {
    let doc = await Roster.findOneAndUpdate({FullName : pNames[i], School : req.session.school}, {Rank : rank[i]}, {new:true, upsert: true});
    doc.save();
  }
  await Roster.find({ "Pos": { "$exists": true}, "School" :req.session.school, "Pos": pos}).sort({'Pos': 1, 'Rank' : 1})
            .then(posPlayers => {
              var emails = [];
              for (var i = 0; i < posPlayers.length; i++) {
                emails.push(posPlayers[i].Email)
              }
                GameGrade.find({'email': {"$exists":true}, 'email': emails}).sort({$natural:-1})
                .then(grade => {
                  var grades = [];
                  for (var i = 0; i < posPlayers.length; i++) {
                    var f = false
                    for (var j = 0; j < grade.length; j++) {
                      if (posPlayers[i].Email == grade[j].email) {
                        grades.push(grade[j].grade)
                        f = true
                      }
                    }
                    if (f == false) {
                      grades.push('N/A')
                    }
                  }
                  PracticeStat.find({'email': {"$exists":true}, 'email': emails}).sort({$natural:-1})
                .then(stat => {
                  var stats = [];
                  for (var i = 0; i < posPlayers.length; i++) {
                    var f = false
                    for (var j = 0; j < stat.length; j++) {
                      if (posPlayers[i].Email == stat[j].email) {
                        stats.push(stat[j].grade)
                        f = true
                        break;
                      }
                    }
                    if (f == false) {
                      stats.push('N/A')
                    }
                  }
                res.render('position', {
                    pos : pos,
                    posPlayers : posPlayers,
                    gameGrades : grades,
                    practiceStats : stats,
                    name: req.session.name,
                    school: req.session.school})
                  }).catch(error => console.error(error))
                }).catch(error => console.error(error))
            }).catch(error => console.error(error))
});

/*
This method searches the roster databases and finds all unique position codes in a school's roster. 
These position codes are then sent to submitIntangibles.ejs to display in a dropdown menu for the coach.
*/
router.get('/submitIntangibles', ensureAuthenticated, (req, res) => 
  Roster.find({School: req.user.school})
  .then(players => {
    console.log(players[0].Pos);
    const positions = [];
    for(var i = 0; i < players.length; i++){
      if(!(positions.includes(players[i].Pos))){ //adds only unique positions to array, no duplicates
        //if(typeof(players[i].Pos) !== 'undefined'){
          positions.push(players[i].Pos);
      }
    }
    console.log("all positions " + positions);
    res.render('submitIntangibles', {
        positions: positions 
      });
    }).catch(err => console.log(err))
);
/*
This method displays the submitExercises page.
*/
router.get('/submitExercises', ensureAuthenticated, (req, res) => 
  res.render('submitExercises', {
    name: req.user.name //pass the name that was entered into the database to dashboard
}));
/*
This method displays the submitPlays page.
*/
router.get('/submitPlays', ensureAuthenticated, (req, res) => 
  res.render('submitPlays', {
    name: req.user.name //pass the name that was entered into the database to dashboard
}));
/*
This method displays the updatePos page.
*/
router.get('/updatePos', ensureAuthenticated, (req, res) => {
  var OLPos = ['LT','LG','C','RG','RT']
  Roster.find({school: req.user.School, Pos: 'OL'})
  .then(players => {
    res.render('updatePos', {
      name: req.user.name, //pass the name that was entered into the database to dashboard
      'players': players,
      'OLPos': OLPos
    })
  })
});

router.post('/changePos', ensureAuthenticated, async (req, res) => {
  var {pos, name1} = req.body;
  console.log(req.body);
  console.log("pos: " + pos);
  console.log("name1: " + name1);
  console.log("user school " + req.session.school);
  var OLPos = ['LT','LG','C','RG','RT']
  const player = await Roster.findOne({FullName: name1, School: req.session.school});
  let playerPositions = pos;
  console.log("player: " + player)
  console.log("player.listPos: " + player.listPos)
  console.log("player.Email: " + player.Email)
  if (player.listPos != undefined) {
    player.listPos.push(pos);
    playerPositions = player.listPos;
  }
  let doc = await Roster.findOneAndUpdate({FullName: name1, School: req.session.school}, {listPos : playerPositions}, {new:true, upsert: true});
  doc.save();
  //   .then(player => {
  //     console.log("player " + player);
  //     if(player.listPos != pos){
  //       player.listPos.push(pos);
  //     }
  //     console.log("player after " + player);
  // })
  Roster.find({School: req.user.School, Pos: 'OL'})
  .then(players => {
    res.render('updatePos', {
      name: req.user.name, //pass the name that was entered into the database to dashboard
      'players': players,
      'OLPos': OLPos
    })
  })
});

/**
 * This post method deals with the sorting function available in the coach's side for sorting a roster by position, or school year. 
 * You have the ability to sort by Position, graduation year, or showing the whole roster. Initially all rosters will be ordered alphabetically by position. 
 */
router.post('/table', ensureAuthenticated, (req,res) => 
  {    
    const type = req.body.type;
    // console.log("type: " + type);
    // console.log("Did we get here");
    if (type != 'gy' && type != 'gyd' && type != 'full' && type != 'name' && type != 'pos'
              && type != 'rank' && type != 'num') {
      Roster.find( {"Pos" : type, "School" :req.session.school })
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else if( type == 'name')
    {
      Roster.find({ "FullName": { "$exists": true }, "School" :req.session.school }).sort({'FullName': 1})
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else if( type == 'pos')
    {
      Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school }).sort({'Pos': 1})
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
    else if( type == 'rank')
    {
      Roster.find({ "Rank": { "$exists": true }, "School" :req.session.school }).sort({'Rank': 1})
        .then(results => {
          res.render('roster', {players: results,
            name : req.session.name,
            school: req.session.school})
        })
        .catch(error => console.error(error))
    }
    else if( type == 'num')
    {
      Roster.find({ "Number": { "$exists": true }, "School" :req.session.school }).sort({'Number': 1})
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

//Upload playbook
router.post('/uploadPlaybook', function(req,res)
{
  // console.log(req);
  if (!req.files)
  {
    return res.status(400).send('No files were uploaded.');
  }
  var tmp_path = req.files.playbook.tempFilePath;
  console.log(tmp_path);

  /** The original name of the uploaded file
      stored in the variable "originalname". **/
  console.log(req.session.school);
  var target_path = 'public/uploads/' +req.session.school + ' Playbook.pdf';
  console.log(target_path);

  /** A better way to copy the uploaded file. **/

  var src = fs.createReadStream(tmp_path);
  var dest = fs.createWriteStream(target_path);
  src.pipe(dest);
  src.on('end', function() { res.redirect('/coach/playbookUpload'); });
  src.on('error', function(err) { res.render('playbookUpload', {
    name: req.user.name
  }); })
});

module.exports = router;
