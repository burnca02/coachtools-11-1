const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
//const csv = require('fast-csv');
var fileUpload = require('express-fileupload');
var template = require('../template');
//var upload = require('../upload');
const csv = require('fast-csv');
var mongoose = require('mongoose');
const Roster = require('../models/Roster');

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

// router.post('/upload',uploads.single('csv'),(req,res)=>{  
//   //convert csvfile to jsonArray     
//  csv()  
//  .fromFile(req.file.path)  
//  .then((jsonObj)=>{  
//      console.log(jsonObj);  
//      //the jsonObj will contain all the data in JSONFormat.
//      //but we want columns Test1,Test2,Test3,Test4,Final data as number .
//      //becuase we set the dataType of these fields as Number in our mongoose.Schema(). 
//      //here we put a for loop and change these column value in number from string using parseFloat(). 
//      //here we use parseFloat() beause because these fields contain the float values.
//      for(var x=0;x<jsonObj;x++){  
//           temp = parseFloat(jsonObj[x].Test1)  
//           jsonObj[x].Test1 = temp;  
//           temp = parseFloat(jsonObj[x].Test2)  
//           jsonObj[x].Test2 = temp;  
//           temp = parseFloat(jsonObj[x].Test3)  
//           jsonObj[x].Test3 = temp;  
//           temp = parseFloat(jsonObj[x].Test4)  
//           jsonObj[x].Test4 = temp;  
//           temp = parseFloat(jsonObj[x].Final)  
//           jsonObj[x].Final = temp;  
//       } 
//       //insertmany is used to save bulk data in database.
//      //saving the data in collection(table)
//       csvModel.insertMany(jsonObj,(err,data)=>{  
//              if(err){  
//                  console.log(err);  
//              }else{  
//                  res.redirect('/coachHome');  
//              }  
//       });  
//     });  
//  });  

//  //insertmany is used to save bulk data in database.
//     //saving the data in collection(table)
//     Player.insertMany(jsonObj,(err,data)=>{  
//       if(err){  
//           console.log(err);  
//       }else{  
//           res.redirect('/');  
//       }  
// });

// router.post = function (req, res) {
//   if (!req.files)
//       return res.status(400).send('No files were uploaded.');
   
//   var rosterFile = req.files.file;

//   var players = [];
       
//   csv.parseString(rosterFile.data.toString(), {
//        headers: true,
//        ignoreEmpty: true
//    })
//    .on("data", function(data){
//        data['_id'] = new mongoose.Types.ObjectId();
        
//        players.push(data);
//    })
//    .on("end", function(){
//        Roster.create(players, function(err, documents) {
//           if (err) throw err;
//        });
//        res.redirect('/');
//    });
// };

module.exports = router;
