const express = require('express');
const router = express.Router();

//require player model
const Roster = require('../models/Roster');
const Stat = require('../models/Stat');

//photo
router.get('/coachToolsLogo.png', (req, res) => {
    res.sendFile('coachToolsLogo.png', { root: '.' })
  });

//Benchmarks Functions
router.get('/benchmarks', (req, res) => {
    res.render('benchmarks')
});

router.post('/benchmarks', (req, res, next) => {
    //how to get it to recognize player email without them having to type it in?
    const { email, bench, squat, dead, mile, height, weight} = req.body;
    console.log(req.body);

    //Add new Stat to the database
    const newStat = new Stat({
        _id: req.session._id,
        email,
        bench,
        squat,
        dead,
        mile,
        height,
        weight
    });

    //save user
    newStat.save()
    .then(stat => {
        req.flash('success_msg', 'You can now log in');
        res.redirect('/users/login');
    })
    .catch(err => console.log(err));
});


//Upload Functions
const multer = require('multer');
const upload = multer({
    dest: 'uploads/' // this saves your file into a directory called "uploads"
  }); 
        

// router.get('/views/coachHome.ejs', (req, res) => //This is the same as function(req,res)
// {
//     // Sorting by the position Alhpabetically.

//     db.collection('Roster').find({ "Pos": { "$exists": true }, "School" : req.session.school }).sort({'Pos': 1}).toArray()
//     .then(results => {
//         res.render('coachHome.ejs', {players: results})
//     })
//     .catch(error => console.error(error))
// })

module.exports = router;