const express = require('express')
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Questionnaire = require('../models/Questionnaire');
const CompleteQuest = require('../models/CompleteQuest');
const MongoClient = require('mongodb').MongoClient
const uri = "mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true";

//Welcome Page
//router.get('/', (req, res) => res.render('welcome')); OLD WAY
router.get('/', (req, res) => res.render('landing')); //NEW WAY
//Landing Page
// router.get('/landing', (req,res) => {
    // res.render('landing')
// });
router.get('/aboutUs', (req, res) => res.render('aboutUs'));
router.get('/contactUs', (req, res) => res.render('contactUs'));
router.get('/test', (req, res) => res.render('test'));

/*
The following three methods serve almost the same purpose. They find the questionnaire
from the database and send it to viewQuestionnaire.ejs. There is one method for each questionnaire type.
*/
router.get('/viewMQuestionnaire', (req, res) => 
Questionnaire.find({type: "meeting"}).limit(1).sort({$natural: -1}) //gets most recent doc, need to change so that all come through
.then(questionnaires => {
  if(questionnaires.length == 0){
      res.render('hold');
  }
  else{
    res.render('viewQuestionnaire', {
            q1: questionnaires[0].questions[0],
            q2: questionnaires[0].questions[1],
            q3: questionnaires[0].questions[2],
            type: questionnaires[0].type,
            _id: questionnaires[0]._id.toString(),
            name: req.user.name
        });
    }
}
));
/**
 * THis method does the same as the above, but it deals with practice questionairres.
 */
router.get('/viewPQuestionnaire', (req, res) => 
Questionnaire.find({type: "practice"}).limit(1).sort({$natural: -1}) //gets most recent doc, need to change so that all come through
.then(questionnaires => {
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
/**
 * This method is for viewing training questionairres.
 */
router.get('/viewTQuestionnaire', (req, res) => 
Questionnaire.find({type: "training"}).limit(1).sort({$natural: -1}) //gets most recent doc, need to change so that all come through
.then(questionnaires => {
  if(questionnaires.length == 0){
      res.render('hold');
  }
  else{
    res.render('viewQuestionnaire', {
            q1: questionnaires[0].questions[0],
            q2: questionnaires[0].questions[1],
            q3: questionnaires[0].questions[2],
            type: questionnaires[0].type,
            _id: questionnaires[0]._id.toString(),
            //name: req.user.name
        });
    }
}
));
/*
This method is called when a player completes a questionnaire. It takes the fields from the 
completed questionnaire as input and saves a completed questionnaire to the database. Next, this
method removes the player who completed the questionnaire from the participants list so that they 
can no longer view the questionnaire.
*/
router.post('/viewQuestionnaire', async(req, res) => {
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
    await Questionnaire.findOneAndUpdate({_id: qID})
    .then(result => {
        console.log('result' + result);
        const index = result.participants.indexOf(email);
        if (index > -1) {
            console.log('remove email');
            result.participants.splice(index, 1);
        }
        result.save();
    });
    //save completed questionnaire
    console.log('saving complete questionnaire');
    newCompleteQuest.save()
    .then(quest => {
        req.flash('success_msg', 'Questionnaire has been submitted');
        res.redirect('playerHome');
    })
    .catch(err => console.log(err));
  });


  /**
   * This is for accessing the depth chart and for it to show up.
   */
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
    
    router.get('/position', ensureAuthenticated, async(req, res) => {
        const pos = req.body.pos
        console.log("pos in index: " + pos)
        await db.collection('Roster').find({ "Pos": { "$exists": true}, "School" :req.session.school, "Pos": pos}).sort({'Pos': 1, 'Rank' : 1}).toArray()
            .then(posPlayers => {
                res.render('position', {
                    posPlayers : posPlayers,
                    name: req.session.name,
                    school: req.session.school})
            }).catch(error => console.error(error))
      })
    //   router.get('/depthChart', ensureAuthenticated, (req, res) => 

    //   db.collection('Roster').find({ "Pos": { "$exists": true }, "School": req.session.school}).sort({'Pos': 1}).toArray()
    //   .then(results => {
    //       res.render('depthChart', {aPlayers : results, players: results,
    //                               name: req.user.name,
    //                               school: req.session.school   
    //                               }
    //                )
    //    })
    //    .catch(error => console.error(error))
    //    );
    router.get('/depthChart', ensureAuthenticated, async(req, res) => {
        const offPlayersPos1 = ['QB','RB','FB','WR','TE','LT','LG','C','RG','RT']
        const defPlayersPos = ['CB','DB','DE','DL','DT','FS','ILB','LB','MLB','OLB','SS']
        const spePlayersPos = ['K/P','LS']
        // console.log("Did we get in index router get");
        await db.collection('Roster').find({ "Pos": { "$exists": true}, "School" :req.session.school, "Pos": { "$in" : offPlayersPos1}}).sort({'Pos': 1, 'Rank' : 1}).toArray()
        .then(offPlayers => {
            db.collection('Roster').find({ "Pos": { "$exists": true }, "School" :req.session.school, "Pos": { "$in" : defPlayersPos}}).sort({'Pos': 1, 'Rank' : 1}).toArray()
              .then(defPlayers => {
                db.collection('Roster').find({ "Pos": { "$exists": true }, "School" :req.session.school, "Pos": { "$in" : spePlayersPos}}).sort({'Pos': 1, 'Rank': 1}).toArray()
                  .then(spePlayers => {
                    // db.collection('Roster').find({ "Pos": { "$exists": true }, "School" :req.session.school }).sort({'Pos': 1}).toArray()
                    db.collection('Roster').find({ "Pos": 'QB', "School" :req.session.school }).toArray()
                      .then(aPlayers => {
                        res.render('depthChart', {
                            players : aPlayers,
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


  }).catch(console.error)

//Player Home Page
router.get('/playerHome', ensureAuthenticated, (req, res) =>
    res.render('playerHome', {
        name: req.user.name //pass the name that was entered into the database to dashboard
    })
);
module.exports = router;
