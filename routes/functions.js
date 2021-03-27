const express = require('express');
const router = express.Router();

//require player model
const Roster = require('../models/Roster');
const Stat = require('../models/Stat');
const Exercise = require('../models/Exercise');

//photo
router.get('/coachToolsLogo.png', (req, res) => {
    res.sendFile('coachToolsLogo.png', { root: '.' })
  });

//Benchmarks Functions
router.get('/benchmarks', (req, res) => {
    Exercise.findOne({'school': req.session.school}).sort({$natural:-1})
    .then(exercise => {
        console.log(exercise);
        res.render('benchmarks', {
            //'name': req.user.name,
            exercise: exercise,
            'email': req.session.email
        });
    })
});
/**
 * This function deals with submitting benchmarks of each individual lift or exercise. This function will be used 
 * when someone is registering their account and whenever they are updating their stats. The method 
 * saves the benchmark data and redirects to the login screen.
 */
router.post('/benchmarks', (req, res, next) => {
    //how to get it to recognize player email without them having to type it in?
    const { email, e1, e2, e3, e4, height, weight} = req.body;
    console.log(req.body);
    console.log(req.session);

    //Add new Stat to the database
    const newStat = new Stat({
        // _id: req.session._id, /
        name: req.session.name,
        email,
        e1, 
        e2,
        e3,
        e4,
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

module.exports = router;