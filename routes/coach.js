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
  });
});

router.get('/submitquest', ensureAuthenticated, (req, res) => {
  res.render('playerFeedback');
});

router.get('/questionnaire', ensureAuthenticated, (req, res) => 
  res.render('questionnaire', {
    name: req.user.name //pass the name that was entered into the database to dashboard
}));

router.get('/practiceStats', ensureAuthenticated, (req, res) => 
  res.render('practiceStats', {
    name: req.user.name //pass the name that was entered into the database to dashboard
}));


router.post('/submitquest', (req,res) => {
  const { participants, whichpos, type, q1, q2, q3 } = req.body;

  var participantsArr = [];
  //how to get list of specific email addresses for questionnaire to be sent to?
  if(participants == 'all'){
    console.log('All Participants');
    console.log(req.user.school);
    Roster.find({}, 'Email') //need school differentiator
    .then(results => {
      for(var i = 0; i < results.length; i++){
        participantsArr.push(results[i].Email);
      }
      console.log(participantsArr);
    });
  } else {
    console.log('Participants by Position');
    Roster.find({ Pos: whichpos }, 'Email')//find all the documents where Pos = whichpos
    .then(results => {
      for(var i = 0; i < results.length; i++){
        participantsArr.push(results[i].Email);
      }
      console.log(participantsArr);
    }); 
  }
  console.log('participantsArr' + participantsArr);
  var questions = [q1, q2, q3];
  const newQuestionnaire = new Questionnaire({
    participantsArr,
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
<<<<<<< Updated upstream
=======
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
  await Roster.find({ "Pos": { "$exists": true}, "School" :req.session.school, "listPos": { "$in" : offPlayersPos1}}).sort({'Pos': 1, 'Rank' : 1})
  .then(offPlayers => {
      Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school, "listPos": { "$in" : defPlayersPos}}).sort({'Pos': 1, 'Rank' : 1})
      .then(defPlayers => {
          Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school, "listPos": { "$in" : spePlayersPos}}).sort({'Pos': 1, 'Rank': 1})
          .then(spePlayers => {
            Roster.find({ "Pos": { "$exists": true }, "School" :req.session.school, "listPos": "QB" }).sort({'Pos': 1})
              .then(aPlayers => {
                res.render('depthChart', {
                    "players": aPlayers,
                    "offPlayersPos" : offPlayersPos1,
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
    let doc = await Roster.findOneAndUpdate({FullName : pNames[i], School : req.session.school}, {Rank : rank[i]}, {new:true, upsert: true}); //WITH MORE THAN 1 RANK BE CAREFUL
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
router.post('/table', (req,res) => 
=======
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
  Roster.findOneAndUpdate({School: req.session.school, FullName: name1})
    .then(player => {
      console.log("player " + player);
      if(player.listPos != pos){
        player.listPos.push(pos);
      }
      console.log("player after " + player);
  })
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
>>>>>>> Stashed changes
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
