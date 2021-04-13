const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
//var upload = require('../upload');
const mongoose = require('mongoose');

const Roster = require('../models/Roster');
const PracticeStat = require('../models/PracticeStat');
const SeasonalPracticeStat = require('../models/SeasonalPracticeStats');
const SeasonalGameGrade = require('../models/SeasonalGameGrades');
const Intangibles = require('../models/Intangibles');
const Exercise = require('../models/Exercise');
const Play = require('../models/Play');
const Period = require('../models/Period');
const GameGrade = require('../models/GameGrade');

router.use(express.static("public"));

//Connect DB again??
const db = 'mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true&useNewUrlParser=true';
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true, useFindAndModify: false})
.then(() => console.log('Mongo DB Connected...'))
.catch(err => console.log(err));

/*
This is the get method for dispPracticeStats.ejs. The query below finds the intangibles to populate the
dropdown similar to on practiceStats.
*/
router.get('/dispPracticeStats', ensureAuthenticated, (req, res) => 
  Intangibles.find({school: req.user.school})
  .then(intangibles => {
  const positions = [];
  for(var i = 0; i < intangibles.length; i++){
    if(!(positions.includes(intangibles[i].pos))){
      positions.push(intangibles[i].pos);
    }
  }
  res.render('practiceStats', { //need to send all stats data here too
        'positions': positions,
        'name': req.user.name
      });
  }).catch(err => console.log(err))
);
/*
This method provides dispPracticeStats with the list of players for the position selected along with
their intangibles and respective grades
*/
router.post('/dispPracticeStats', async(req, res) => {
    const {pos} = req.body;
    const ints = [];
    await Roster.find({Pos: pos, School: req.session.school}) 
    .then(players => {
      Intangibles.find({school: req.session.school, pos: pos})
      .then(intangibles => {
      const positions = [];
      for(var i = 0; i < intangibles.length; i++){
        if(!(positions.includes(intangibles[i].pos))){ //adds only unique positions to array, no duplicates
          positions.push(intangibles[i].pos);
        }
        console.log(intangibles[0].scale);
      }
      if(players.length == 0){
        res.render('practiceStats');
      } else {
        SeasonalPracticeStat.find({school: req.session.school}).sort({date:-1})
        .then(stats => {
          Play.find({school: req.user.school})
          .then(plays => {
          if(plays.length == 0){
            res.redirect("/coach/submitPlays");
          }
          PracticeStat.find({school: req.user.school}) //for the practice stats by date, NEED position sorter
          .then(pStats => {
            console.log("pStats.length " + pStats.length);
            const dates = [];
            const originalDates = [];
            for(var i = 0; i < pStats.length; i++){
              var delimiter = " ";
              var count = 3;
              var date = pStats[i].date;
              // Repeativly search for the delimiter
              var lastIndex = -1;
              for (var j = 0; j < count; j++) {
                  // Begin to search from the position after the last matching index
                  lastIndex = date.toString().indexOf(delimiter, lastIndex + 1);
                  // Could not be found
                  if (lastIndex == -1) {
                      break;
                  }
              }
              var before = date.toString().substring(0, lastIndex);
              if(!(dates.includes(before))){ //adds only unique dates to array, no duplicates
                  dates.push(before);
                  originalDates.push(pStats[i].date);
              }
            }
            var playerEmails = []
            for (var m = 0; m < players.length; m++) {
              playerEmails.push(players[m].Email)
            }
            console.log("playerEmails: " + playerEmails)
            PracticeStat.find({school: req.user.school, "email": { "$in" : playerEmails}}).sort({date:-1}) //, "email": { "$in" : playerEmails}
            .then(grades => {
              console.log("grades.length " + grades.length);
              // var grades2 = []
              // for (var k = 0; k < grades.length; k++) {
              //   if (playerEmails.includes(grades[k].email)) {
              //     grades2.push(grades[k])
              //   }
              // }
              // console.log("grades2 length " + grades2.length);
              res.render('dispPracticeStats', {
                    'players': players,
                    'ints': intangibles[0].ints,
                    'scale': intangibles[0].scale,
                    'positions': positions,
                    'stats': stats,
                    'grades': grades,
                    'plays': plays[0].plays,
                    'dates': dates,
                    'originalDates': originalDates,
                    'name': req.user.name,
                  });
              })
            })
          })
        })
      }
    }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});
//This function add a practice grade to the database once they are submitted by the coach
/*
This method is called when a coach submits a practice grade for a player. All form fields are take
as input. The method calculates the grade for the day from the input and then saves all data to the
practiceStats database.
*/
router.post('/addPracticeGrade', async (req, res) => {
  const {playerName, date, scale, grade1, grade2, grade3, grade4} = req.body;
  console.log("Add Practice Grade");
  console.log(req.body);

  var email;
  var school = req.user.school;
  var numPlayers = parseInt(req.body.numPlayers);
  var players = playerName;
  console.log( numPlayers + " is the length");
  var name;

  console.log("playerName" + playerName);
  //This version currently works with the full form layout.

  for(var i = 0; i < numPlayers; i++) {
    //This is a temporary fix to a bug. If the number of players equals one, it does not return as an array. 
    //It returns as a string, otherwise if there are more than 1 name it will return as an array.
    if(numPlayers === 1) {
      name = playerName;
    }
    else {
      name = playerName[i];
    }
    /**
     * If all the grades have been filled out, then this is a valid practice stat. We do not want to add practice stats
     * if none of the information has been filled out. This may change if it it is done individually by player,
     * but as of now this is how it is done. 
    **/
    if(grade1[i] !== '' && grade2[i] !== '' && grade3[i] !== '' && grade4[i] !== '') {
      console.log('This has all of the fields submitted')
      await Roster.findOne({FullName: name, School: school})
      .then(result => {
        console.log(result);
        email = result.Email;
        console.log('email' + email);
  
      }).catch(err => console.log(err));

      var Numgrade1 = parseInt(grade1[i]);
      var Numgrade2 = parseInt(grade2[i]);
      var Numgrade3 = parseInt(grade3[i]);
      var Numgrade4 = parseInt(grade4[i]);


      const int1 = [Numgrade1, 1];
      const int2 = [Numgrade2, 2];
      const int3 = [Numgrade3, 3];
      const int4 = [Numgrade4, 4];

      //Calculating the day's overall practice grade
      var grade = Math.round((((Numgrade1/scale)*.4) + ((Numgrade2/scale)*.3) + ((Numgrade3/scale)*.2) + ((Numgrade4/scale)*.1)) * 100);

      console.log("The grade is " + grade);
        // Finding the overall season average. 
      //To get the season overall average we have to get the number all the stats from the specific player
      
      //This will create a practice stat. And a seasonal stat. We need to either create a new SeasonalPracticeStat 
      //or either update the current record in the database.
      await PracticeStat.find({email: email, school: school})
      .then(stats => {
          console.log("The number of stats that this player has is ");
          console.log(stats.length);
          var numOfStats = stats.length; //This is the number of data entries that the player has. We will need to figure out how to get the data so it works by each season.
          numOfStats++;
          var intagible1GradeAvg = 0;
          var intagible2GradeAvg = 0;
          var intagible3GradeAvg = 0;
          var intagible4GradeAvg = 0;
          var overall = 0;

          
          //Going through the number of stats and adding up the stats to get the overall. 
          for(var j = 0; j < numOfStats-1; j++) {
            intagible1GradeAvg += ((stats[j].int1[0] /scale)*100);
            intagible2GradeAvg += ((stats[j].int2[0] /scale)*100);
            intagible3GradeAvg += ((stats[j].int3[0] /scale)*100);
            intagible4GradeAvg += ((stats[j].int4[0] /scale)*100);
            overall += parseInt(stats[j].grade);
          }
          overall += grade; // add the new grade to the overall as well
          console.log("intangible1avg #1 " + intagible1GradeAvg);

          //Getting the averages. 
          if(numOfStats-1 != 0){ //when there is already a stat in the database
            intagible1GradeAvg = Math.round((intagible1GradeAvg + ((Numgrade1 / scale) * 100))/ numOfStats); 
            console.log("intangible1avg #2 " + intagible1GradeAvg);
            intagible2GradeAvg = Math.round((intagible2GradeAvg + ((Numgrade2 / scale) * 100))/ numOfStats);
            intagible3GradeAvg = Math.round((intagible3GradeAvg + ((Numgrade3 / scale) * 100))/ numOfStats);
            intagible4GradeAvg = Math.round((intagible4GradeAvg + ((Numgrade4 / scale) * 100))/ numOfStats);
            overall = Math.round(overall / numOfStats);
          }
          else{ //when its the first stat
            intagible1GradeAvg = Math.round((Numgrade1 / scale) * 100);
            intagible2GradeAvg = Math.round((Numgrade2 / scale) * 100);
            intagible3GradeAvg = Math.round((Numgrade3 / scale) * 100);
            intagible4GradeAvg = Math.round((Numgrade4 / scale) * 100);
            overall = Math.round(grade);
          }

          /**
            This will find and update the player in the seasonal practice stat table. This is beneficial because there will be no duplicates in the season practice stats table.
            If the player has no record in the table, the it will create it automatically. 

            We still want to keep practice stats so that players and coaches can see their practice grade trends.
           */
          SeasonalPracticeStat.findOneAndUpdate({email: email, school: school},
            {
              // email,
              // school,
              Current : grade, //The most recent practice grade.
              Overall : overall,
              Intagible1Average: intagible1GradeAvg,
              Intagible2Average: intagible2GradeAvg,
              Intagible3Average: intagible3GradeAvg,
              Intagible4Average: intagible4GradeAvg
            }, {new:true, upsert: true} 
            ,function(err,doc)
            {
              if(err)
                return console.log(err);
              console.log(doc);
            });
        }).catch(err => console.log(err));

      //Adding a new practice stat
      const newPracticeStat = new PracticeStat({
        email,
        school,
        int1,
        int2,
        int3,
        int4,
        grade,
        date
      });
      console.log("new Practice Stat " + newPracticeStat);
      newPracticeStat.save();
    }
  }
  res.redirect('dispPracticeStats');
});
/*
This function is called when a coach submits game grades from the dispGameGrades.ejs page. This function compiles all data
submitted in the form and saves it to the database before reloading dispGameGrade.ejs
*/
router.post('/addGameGrade', async (req, res) => {
  //this function will take in a variable length form. 
  console.log("inside addGameGrade");
  const {playerName, pos, playType, date, scale, grade1, grade2, grade3, grade4} = req.body;

  console.log(req.body);

  var email;
  var school = req.user.school;
  var numPlayers = parseInt(req.body.numPlayers);
  var players = playerName;
  console.log("playerNames" + playerName);
  console.log( numPlayers + " is the length");
  var name;
  //const grades = [];

  //This version currently works with the full form layout.
  for(var i = 0; i < numPlayers; i++) {
    //This is a temporary fix to a bug. If the number of players equals one, it does not return as an array. 
    //It returns as a string, otherwise if there are more than 1 name it will return as an array.
    if(numPlayers === 1) {
      name = playerName;
    }
    else {
      name = playerName[i];
    }
    /**
     * If all the grades have been filled out, then this is a valid game grade. We do not want to add game grades
     * if none of the information has been filled out. This may change if it it is done individually by player,
     * but as of now this is how it is done. 
    **/
    if(grade1[i] !== '' && grade2[i] !== '' && grade3[i] !== '' && grade4[i] !== '') {
      console.log('This has all of the fields submitted')
      console.log('name ' + name);
      await Roster.findOne({FullName: name, School: school})
      .then(result => {
        email = result.Email;
      }).catch(err => console.log(err));

      var Numgrade1 = parseInt(grade1[i]);
      var Numgrade2 = parseInt(grade2[i]);
      var Numgrade3 = parseInt(grade3[i]);
      var Numgrade4 = parseInt(grade4[i]);

      const int1 = [Numgrade1, 1];
      const int2 = [Numgrade2, 2];
      const int3 = [Numgrade3, 3];
      const int4 = [Numgrade4, 4];

      //Calculating the day's overall game grade
      var grade = Math.round((((Numgrade1/scale)) + ((Numgrade2/scale)) + ((Numgrade3/scale)) + ((Numgrade4/scale))) * 25);

      console.log("The grade is " + grade);
        // Finding the overall season average. 
      //To get the season overall average we have to get the number all the stats from the specific player
      
      //This will create a game stat. And a seasonal stat. We need to either create a new SeasonalGameGrade
      //or either update the current record in the database.
      await GameGrade.find({email: email, school: school}) //NEEDS TO LOOK UP grades.email
      .then(stats => {
          console.log("The number of game stats that this player has is " + stats.length);
          var numOfStats = stats.length; //This is the number of data entries that the player has. We will need to figure out how to get the data so it works by each season.
          numOfStats++; //Add one for the new stat
          var intagible1GradeAvg = 0;
          var intagible2GradeAvg = 0;
          var intagible3GradeAvg = 0;
          var intagible4GradeAvg = 0;
          var overall = 0;

          
          //Going through the number of stats and adding up the stats to get the overall. 
          //Gets total for each intangible stat
          for(var j = 0; j < numOfStats-1; j++) {
            intagible1GradeAvg += ((stats[j].int1[0] /scale)*100);
            intagible2GradeAvg += ((stats[j].int2[0] /scale)*100);
            intagible3GradeAvg += ((stats[j].int3[0] /scale)*100);
            intagible4GradeAvg += ((stats[j].int4[0] /scale)*100);
            overall += parseInt(stats[j].grade);
          }
          overall += grade; // add the new grade to the overall as well
          console.log("intangible1avg #1 " + intagible1GradeAvg);

          //Getting the averages. 
          if(numOfStats-1 != 0){ //when there is already a stat in the database
            intagible1GradeAvg = Math.round((intagible1GradeAvg + ((Numgrade1 / scale) * 100))/ numOfStats); 
            console.log("intangible1avg #2 " + intagible1GradeAvg);
            intagible2GradeAvg = Math.round((intagible2GradeAvg + ((Numgrade2 / scale) * 100))/ numOfStats);
            intagible3GradeAvg = Math.round((intagible3GradeAvg + ((Numgrade3 / scale) * 100))/ numOfStats);
            intagible4GradeAvg = Math.round((intagible4GradeAvg + ((Numgrade4 / scale) * 100))/ numOfStats);
            overall = Math.round(overall / numOfStats);
          }
          else{ //when its the first stat
            intagible1GradeAvg = Math.round((Numgrade1 / scale) * 100);
            intagible2GradeAvg = Math.round((Numgrade2 / scale) * 100);
            intagible3GradeAvg = Math.round((Numgrade3 / scale) * 100);
            intagible4GradeAvg = Math.round((Numgrade4 / scale) * 100);
            overall = Math.round(grade);
          }

          /**
            This will find and update the player in the seasonal game stat table. This is beneficial because there will be no duplicates in the season game stats table.
            If the player has no record in the table, the it will create it automatically. 

            We still want to keep practice stats so that players and coaches can see their game grade trends.
           */
          SeasonalGameGrade.findOneAndUpdate({email: email, school: school},
            {
              // email,
              // school,
              Current : grade, //The most recent game grade.
              Overall : overall,
              Intagible1Average: intagible1GradeAvg,
              Intagible2Average: intagible2GradeAvg,
              Intagible3Average: intagible3GradeAvg,
              Intagible4Average: intagible4GradeAvg
            }, {new:true, upsert: true} 
            ,function(err,doc)
            {
              if(err)
                return console.log(err);
              console.log(doc);
            });
        }).catch(err => console.log(err));
 
        //Adding a new game grade
        const newGameGrade = new GameGrade({
          email,
          int1,
          int2,
          int3,
          int4,
          grade,
          playType,
          pos,
          school,
          date
        });
        console.log(newGameGrade);
        newGameGrade.save();
        }
    }
    res.redirect('dispGameGrade');
});
router.get('/statsByDate', ensureAuthenticated, (req, res) => 
  Intangibles.find({school: req.user.school})
  .then(intangibles => {
  const positions = [];
  for(var i = 0; i < intangibles.length; i++){
    if(!(positions.includes(intangibles[i].pos))){
      positions.push(intangibles[i].pos);
    }
  }
  res.render('statsByDate', { //need to send all stats data here too
        'positions': positions,
        'name': req.user.name
      });
  }).catch(err => console.log(err))
);
router.post('/statsByDate', async(req,res) => {
  const {pos} = req.body;
  console.log(req.body);
    await Roster.find({Pos: pos, School: req.session.school}) 
    .then(players => {
      Intangibles.find({school: req.session.school, pos: pos})
      .then(intangibles => {
      const positions = [];
      for(var i = 0; i < intangibles.length; i++){
        if(!(positions.includes(intangibles[i].pos))){ //adds only unique positions to array, no duplicates
          positions.push(intangibles[i].pos);
        }
        console.log(intangibles[0].scale);
      }
      console.log("players.length " + players.length);
      // if(players.length == 0){
      //   res.render('practiceStats');
      // } else {
      //   SeasonalPracticeStat.find({school: req.session.school}).sort({date:-1})
      //   .then(stats => {
      //     Play.find({school: req.user.school})
      //     .then(plays => {
      //     if(plays.length == 0){
      //       res.redirect("/coach/submitPlays");
      //     }
          var playerEmails = []
            for (var m = 0; m < players.length; m++) {
              playerEmails.push(players[m].Email)
            }
            console.log("playerEmails: " + playerEmails)
          PracticeStat.find({school: req.user.school, email: { "$in" : playerEmails}}) //for the practice stats by date, NEED position sorter
          .then(pStats => {
            const dates = [];
            const originalDates = [];
            for(var i = 0; i < pStats.length; i++){
              var delimiter = " ";
              var count = 3;
              var date2 = pStats[i].date;
              // Repeativly search for the delimiter
              var lastIndex = -1;
              for (var j = 0; j < count; j++) {
                  // Begin to search from the position after the last matching index
                  lastIndex = date2.toString().indexOf(delimiter, lastIndex + 1);
                  // Could not be found
                  if (lastIndex == -1) {
                      break;
                  }
              }
              var before = date2.toString().substring(0, lastIndex);
              if(!(dates.includes(before))){ //adds only unique dates to array, no duplicates
                  console.log("date being pushed " + before);
                  dates.push(before);
                  originalDates.push(pStats[i].date);
              }
            }
            // PracticeStat.find({School: req.user.school, date: date, email: { "$in" : playerEmails}}).sort({date:-1})
            // .then(grades => {
            //   console.log("grades.length " + grades.length);
              // var grades2 = []
              // for (var k = 0; k < grades.length; k++) {
              //   if (playerEmails.includes(grades[k].email)) {
              //     grades2.push(grades[k])
              //   }
              // }
              // console.log("grades2 length " + grades2.length);
              //console.log(dates);
              console.log("ORIGINAL DATES " + originalDates);
              var grades = [];
                res.render('dispStatsByDate', {
                    'players': players,
                    'ints': intangibles[0].ints,
                    'scale': intangibles[0].scale,
                    'positions': positions,
                    'pos': pos, //position submitted from first form
                    'grades': grades,
                    'dates': dates,
                    'originalDates': originalDates,
                    'name': req.user.name
                });
              })
            // })
      // }
    }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});
router.post('/date', async(req,res) => {
  const {pos, date} = req.body;
  console.log(req.body);
  await Roster.find({Pos: pos, School: req.session.school}) 
    .then(players => {
      Intangibles.find({school: req.session.school, pos: pos})
      .then(intangibles => {
      const positions = [];
      for(var i = 0; i < intangibles.length; i++){
        if(!(positions.includes(intangibles[i].pos))){ //adds only unique positions to array, no duplicates
          positions.push(intangibles[i].pos);
        }
        console.log(intangibles[0].scale);
      }
      console.log("players.length " + players.length);
      var playerEmails = [];
      for (var m = 0; m < players.length; m++) {
        playerEmails.push(players[m].Email);
      }
      console.log("playerEmails: " + playerEmails);
      PracticeStat.find({school: req.user.school, email: { "$in" : playerEmails}}) //for the practice stats by date, NEED position sorter
      .then(pStats => {
        const dates = [];
        const originalDates = [];
        for(var i = 0; i < pStats.length; i++){
          var delimiter = " ";
          var count = 3;
          var date2 = pStats[i].date;
          // Repeativly search for the delimiter
          var lastIndex = -1;
          for (var j = 0; j < count; j++) {
              // Begin to search from the position after the last matching index
              lastIndex = date2.toString().indexOf(delimiter, lastIndex + 1);
              // Could not be found
              if (lastIndex == -1) {
                  break;
              }
          }
          var before = date2.toString().substring(0, lastIndex);
          if(!(dates.includes(before))){ //adds only unique dates to array, no duplicates
              dates.push(before);
              originalDates.push(pStats[i].date);
          }
        }
        console.log("DATE " + date);
        var splitDate = date.split(' ');
        var hour = splitDate[4].split(':');
        console.log('hour ' + hour);
        // if(parseInt(hour[0]) >= 20) { //21 for example
        //   hour[0] = parseInt(hour[0] - 20); //1
        //   const str = '0';
        //   hour[0] = str.concat(hour[0]); //01
        //   splitDate[2] = parseInt(splitDate[2]) + 1; //Temporary Fix - Going to get tricky with changes in months/years
        // }
        // else {
        //   hour[0] = parseInt(hour[0]) + 4; 
        // }
        console.log('hour[0] ' + hour[0]);
        var hourString = hour.join();
        var finalHourString = hourString.replace(',',':');
        finalHourString = finalHourString.replace(',',':');
        console.log(finalHourString);
        var numRep = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        var letterRep = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var month = letterRep.indexOf(splitDate[1]);
        console.log('myDate ' + splitDate[3] + '-' + numRep[month] + '-' + splitDate[2] + 'T' + finalHourString + '.000Z');
        var myDate = new Date(splitDate[3] + '-' + numRep[month] + '-' + splitDate[2] + 'T' + finalHourString + '.000Z'); //"2016-05-18T16:00:00Z"
        PracticeStat.find({school: req.user.school, date: myDate, email: { "$in" : playerEmails}})
        .then(grades => {
          console.log("grades.length " + grades.length); //coming up as 0
          res.render('dispStatsByDate', {
            'players': players,
            'ints': intangibles[0].ints,
            'scale': intangibles[0].scale,
            'positions': positions,
            'grades': grades,
            'pos': pos,
            'dates': dates,
            'originalDates': originalDates,
            'name': req.user.name
          });
        })
      })
    })
  })
})
/*
This function is called when a coach adds an intangible on submitIntangibles.ejs. The intangble is
then saved to the Intangibles database. 
*/
router.post('/addIntang', (req, res) => {
  console.log("in post method");
  const {pos, scale, i1, i2, i3, i4} = req.body;
  let errors = [];
  if(i1 == '' || i2 == '' || i3 == '' || i4 == ''){
    errors.push({msg: "Please Enter 4 Intangibles"});
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
        errors,
        positions: positions 
      });
    }).catch(err => console.log(err))
  }
  else{
    const ints = [i1, i2, i3, i4];
    console.log("intangibles added");
    const newIntangible = new Intangibles({
      school: req.user.school,
      pos,
      scale,
      ints
    });
    newIntangible.save();
    res.redirect('/coach/submitIntangibles');
  }
});
/*
This function is called when a coach adds exercises on submitExercises.ejs
*/
router.post('/addExercises', (req, res) => {
  const {e1, e2, e3, e4} = req.body;
  let errors =[];
  if(e1 == '' || e2 == '' || e3 == '' || e4 == ''){
    errors.push({msg: "Please Enter 4 Exercises"});
    res.render('submitExercises', {
      errors,
      name: req.user.name //pass the name that was entered into the database to dashboard
    })
  }
  else{
    const newExercise = new Exercise({
      school: req.user.school,
      exercises: [e1, e2, e3, e4]
    });
    console.log(newExercise);
    newExercise.save(); //not working 
    console.log("exercises saved");
    res.redirect('/coach/practiceTrainingStats');
  } 
});
/*
This function is called when a coach adds plays on submitPlays.ejs
*/
router.post('/addPlays', (req, res) => {
  const {p1, p2, p3, p4} = req.body;
  let errors =[];
  if(p1 == '' || p2 == '' || p3 == '' || p4 == ''){
    errors.push({msg: "Please Enter 4 Plays"});
    res.render('submitPlays', {
      errors,
      name: req.user.name //pass the name that was entered into the database to dashboard
    })
  }
  else{
    Play.findOneAndUpdate({school: req.session.school},
      {
        school : req.user.school, //The most recent game grade.
        plays: [p1,p2,p3,p4]
      }, {new:true, upsert: true} 
      ,function(err,doc)
      {
        if(err)
          return console.log(err);
        else
          console.log("plays saved");
          res.redirect('/coach/gameGrade');
        console.log(doc);
      });
  }
});
/*
This function is called when a coach adds practice periods on submitPeriod.ejs
*/
router.post('/addPeriods', (req, res) => {
  const {p1, p2, p3, p4} = req.body;
  let errors =[];
  if(p1 == '' || p2 == '' || p3 == '' || p4 == ''){
    errors.push({msg: "Please Enter 4 Periods"});
    res.render('submitPeriod', {
      errors,
      name: req.user.name //pass the name that was entered into the database to dashboard
    })
  }
  else{
    Period.findOneAndUpdate({school: req.session.school},
      {
        school : req.user.school, //The most recent game grade.
        periods: [p1,p2,p3,p4]
      }, {new:true, upsert: true} 
      ,function(err,doc)
      {
        if(err)
          return console.log(err);
        else
          console.log("periods saved");
          res.redirect('/coach/gameGrade');
        console.log(doc);
      });
  }
});
/*
This is the get method for dispGameGrade.ejs. The query below finds the intangibles to populate the
dropdown similar to on gameGrade.
*/
router.get('/dispGameGrade', ensureAuthenticated, async (req, res) => 
  await Intangibles.find({school: req.user.school})
  .then(intangibles => {
  const positions = [];
  for(var i = 0; i < intangibles.length; i++){
    if(!(positions.includes(intangibles[i].pos))){
      positions.push(intangibles[i].pos);
    }
  }
  console.log("GET " + positions);
    res.render('gameGrade', { //need to send all stats data here too
      'positions': positions,
      'name': req.user.name
    });
  }).catch(err => console.log(err))
);
/*
This method is called when a coach submits a position from gameGrade.ejs. The query pull the names
from the database the are the position requested by the coach and send them to dispGameGrade to populate
tables. 
*/
router.post('/dispGameGrade', async(req, res) => {
  const {pos} = req.body;
    const ints = [];
    console.log("pos in POST " + pos);
    Roster.find({Pos: pos, School: req.user.school}) 
    .then(players => {
      //console.log('playerList ' + players);
      Intangibles.find({school: req.user.school, pos: pos})
      .then(intangibles => {
      const positions = [];
      const scale = intangibles[0].scale;
      for(var i = 0; i < intangibles.length; i++){
        if(!(positions.includes(intangibles[i].pos))){ //adds only unique positions to array, no duplicates
          positions.push(intangibles[i].pos);
        }
      }
      console.log("positions in gameGradePost " + positions);
      if(players.length == 0){
        res.render('gameGrade');
      } else {
        SeasonalGameGrade.find({school: req.session.school}).sort({date:-1})
        .then(stats => {
          //console.log("gamegrade stats " + stats);
          Play.find({school: req.user.school})
          .then(plays => {
            if(plays.length == 0){
              res.redirect("/coach/submitPlays");
            }
            // for(var i = 0; i < players.length; i++) {
            //   for(var j = 0; j < stats.length; j++) {
            //     console.log('email match 1 ' + players[i].Email  + ' = ' + stats[j].email);
            //   }
            // }
            res.render('dispGameGrade', {
                  'players': players,
                  'ints': intangibles[0].ints,
                  scale: scale,
                  'positions': positions,
                  'stats': stats,
                  'plays': plays[0].plays,
                  'name': req.user.name   
            });
          })
        })
      }
    }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

module.exports = router;
