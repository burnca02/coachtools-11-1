const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
//const csv = require('fast-csv');
var fileUpload = require('express-fileupload');
var template = require('../template');

const Player = require('../models/Player');

//photo
router.get('/coachToolsLogo.png', (req, res) => {
  res.sendFile('coachToolsLogo.png', { root: '.' })
});

router.use(fileUpload());
//Connect DB again??
const mongoose = require('mongoose');
const db = 'mongodb+srv://yoda:maytheforce@cluster0.fvmkx.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true})
.then(() => console.log('Mongo DB Connected...'))
.catch(err => console.log(err));

const multer = require('multer');
const upload = multer({
    dest: 'uploads/' // this saves your file into a directory called "uploads"
  });
  
var storage = multer.diskStorage({  
    destination:(req,file,cb)=>{  
        cb(null,'./uploads');  
    },  
    filename:(req,file,cb)=>{  
        cb(null,file.originalname);  
    }  
});
var uploads = multer({storage:storage}); 
//var csv         = require('csvtojson');

router.get('/template', template.get);
//upload function
// router.post('/upload', (req,res) => 
// {
//     if (!req.files)
//        return res.status(400).send('No files were uploaded.');
    
//     var rosterFile = req.files.file;

//     var players = [];
        
//     csv.parseString(rosterFile.data.toString(), {
//         headers: true,
//         ignoreEmpty: true
//     })
//     .on("data", function(data){
//         const newPlayer = new Player({
//           GradYear,
//           FirstName,
//           LastName,
//           Position
//         })
//         //data['_id'] = new mongoose.Player();
        
//         players.push(data);
//     })
//     .on("end", function(){
//         Roster.create(players, function(err, documents) {
//             if (err) throw err;
//         });
//                 // Sorting by the position Alhpabetically.
//         res.redirect('/coachHome');
//     });
    
// })

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

exports.post = function (req, res) {
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
};

module.exports = router;