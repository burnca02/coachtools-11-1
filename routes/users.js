const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
//Users
const User = require('../models/User');
//Roster
const Roster = require('../models/Roster');
const { forwardAuthenticated } = require('../config/auth');
const e = require('express');

//Login Pages
router.get('/login', (req, res) => {
    res.render('login')
});
//terms and conditions
router.get('/terms', (req, res) => {
    res.render('terms')
});
router.get('/cookies', (req, res) => {
    res.render('cookies')
});

//photos
// router.get('/coachtoolsLogoBlack.png', (req, res) => {
//     res.sendFile('coachtoolsLogoBlack.png', { root: '.' })
//   });

// router.get('/coachToolsLogo.png', (req, res) => {
//     res.sendFile('coachToolsLogo.png', { root: '.' })
// });

//Register Page
router.get('/register', (req, res) => 
{
    User.distinct("school", function(error, results){
        console.log(results);
        res.render('register',
        {
            Schools : results
        })
      });
}
);

router.get('/teamRegister', (req, res) => 
{
    res.render('teamRegister');
}
);

//Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2, school, userType, terms} = req.body;

    console.log(req.body);
    let errors = [];
    if(school === 'School Not Listed' && userType === 'player') //If the school is not listed then you either sign up your team through the coach portal, or you cannot access it as a player.
    {
        errors.push({msg:"Your school does not have access to Coach Tools"});
    }
    if(school === 'School Not Listed' && userType === 'coach') //If the school is not listed then you either sign up your team through the coach portal, or you cannot access it as a player.
    {
        errors.push({msg:"You must register your team."});
        return res.redirect('/users/teamRegister');
    }
    //Check required fields
    if(!name || !email || !password || !password2 || !school || !userType){
        errors.push({msg: 'Please fill in all fields'});
    }
    //Check passwords match
    if(password !== password2) {
        errors.push({ msg: 'Passwords do not match'});
    }
    if(!terms) {
        errors.push({ msg: 'Please agree to the terms and conditions.'});
    }
    //Check password Length
    if(password.length < 6) {
        errors.push({ msg: 'Password must be at least characters'});
    }
    if(errors.length > 0) {
        User.distinct("school", function(error, results){
            console.log(results);
            res.render('register', 
            {
                errors,
                name,
                email,
                password,
                password2,
                school,
                userType,
                Schools : results
            });
        });
    } 
    else {
        //validation passed
        User.findOne({ email: email })
        .then(user => {
            if(user) {
                //User exists
                errors.push({ msg: 'Email is already in use.'});
                User.distinct("school", function(error, results){
                    console.log(results);
                    res.render('register', 
                    {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                        school,
                        userType,
                        Schools : results
                    });
                });
            }
            else if(userType == 'player'){
                //We want to check their email addresss matches the information in the roster.
                Roster.findOne({ FullName: name, School : school})
                .then(player => {
                    console.log("player.Email" + player.Email);
                    console.log("email" + email);
                    if(player.Email != email) {
                        errors.push({msg: 'Ask your coach for email registration.'});
                        User.distinct("school", function(error, results){
                            console.log(results);
                            res.render('register', 
                            {
                                errors,
                                name,
                                email,
                                password,
                                password2,
                                school,
                                userType,
                                Schools : results
                            });
                        });
                    }
                    else {
                        createUser(name, email, password, school, userType, req, res);
                    }
                }).catch(err => {
                    errors.push({msg: "Verify that you are using the same name as the Coach's Roster Database."});
                    User.distinct("school", function(error, results){ //This command will find all the schools so that it can be listed in the dropdown menu.
                        console.log(results);
                        res.render('register', 
                        {
                            errors,
                            name,
                            email,
                            password,
                            password2,
                            school,
                            userType,
                            Schools : results
                        });
                    });
                });
            }
            else {
                //when user is a coach
                createUser(name, email, password, school, userType, req, res);
            }
        });
    }
});

function createUser(name, email, password, school, userType, req, res) {
    //Add new User
    const newUser = new User({
        name,
        email,
        password,
        school,
        userType
    });

    //Hash Password
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            //set password to hashed
            newUser.password = hash;
            //save user
            req.session._id = newUser._id; //Passing the ID to make searches easier.
            newUser.save()
            .then(user => {
                console.log(newUser.userType);
                console.log("newUser saved");
                if(newUser.userType == 'coach') {
                    req.flash('success_msg', 'You are now registered and can log in');
                    res.redirect('/users/login');
                } else {
                    req.flash('success_msg', 'You are registered. Please fill in benchmark data');
                    req.session.name = name;
                    req.session.email = email; //This will be passed to the benchmarks so that users do not fill out the information.
                    req.session.school = school;
                    res.redirect('/functions/benchmarks');
                }
            })
            .catch(err => console.log(err));
        });
    });
}

//Login Handle
router.post('/login', (req, res, next) => {
    const {email} = req.body;
    req.session.email = email; //Creating a session id for email. This will carry over in all the website.
    console.log('Email is ' + req.session.email);
    User.findOne({ email: email })
        .then(user => {

            if(user === null) //If the user does not exist it will return null, then we show an error message that says that the email is not registered.
            {
                passport.authenticate('local', {
                    successRedirect: '/coach/depthChart', //coachHome originally
                    failureRedirect: '/users/login',
                    failureFlash: true
                })(req, res, next);
            }
            else //Otherwise, this user exists and we can move forward with the log in process. 
            {
                req.session.school = user.school;
                req.session._id = user._id; //Passing the ID to make searches easier.
                req.session.name = user.name;
                if(user.userType == 'coach') {
                    console.log('User type is ' + user.userType);
                    passport.authenticate('local', {
                        successRedirect: '/coach/depthChart', //coachHome originally
                        failureRedirect: '/users/login',
                        failureFlash: true
                    })(req, res, next);
                } else if (user.userType == 'player') {
                    console.log('User type is ' + user.userType);
                    passport.authenticate('local', {
                        successRedirect: '/playerHome',
                        failureRedirect: '/users/login',
                        failureFlash: true
                    })(req, res, next);
                }
            }
        });
});


//logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

router.get('/coachRegistration',(req,res) =>
{
    res.render('coachRegistration')
})

//Register Handle
router.post('/teamRegister', (req, res) => {
    const { name, email, password, password2, school, } = req.body;
    const userType = 'coach';

    console.log(req.body);
    let errors = [];
    if(school === 'School Not Listed' && userType === 'player') //If the school is not listed then you either sign up your team through the coach portal, or you cannot access it as a player.
    {
        errors.push({msg:"Your school does not have access to Coach Tools"});
    }
    if(school === 'School Not Listed' && userType === 'coach') //If the school is not listed then you either sign up your team through the coach portal, or you cannot access it as a player.
    {
        errors.push({msg:"You must register your team."});
        return res.redirect('/users/teamRegister');
    }
    //Check required fields
    if(!name || !email || !password || !password2 || !school ){
        errors.push({msg: 'Please fill in all fields'});
    }
    //Check passwords match
    if(password !== password2) {
        errors.push({ msg: 'Passwords do not match'});
    }
    //Check password Length
    if(password.length < 6) {
        errors.push({ msg: 'Password must be at least characters'});
    }
    if(errors.length > 0) {
        Roster.distinct("School", function(error, results){
            console.log(results);
            res.render('register', 
            {
                errors,
                name,
                email,
                password,
                password2,
                school,
                userType,
                Schools : results
            });
        });
    } 
    else {
        //validation passed
        User.findOne({ email: email })
        .then(user => {
            if(user) {
                //User exists
                errors.push({ msg: 'Email is already in use.'});
                Roster.distinct("School", function(error, results){
                    console.log(results);
                    res.render('register', 
                    {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                        school,
                        userType,
                        Schools : results
                    });
                });
            }
            else if(userType == 'player'){
                //We want to check their email addresss matches the information in the roster.
                Roster.findOne({ FullName: name, School : school})
                .then(player => {
                    console.log("player.Email" + player.Email);
                    console.log("email" + email);
                    if(player.Email != email) {
                        errors.push({msg: 'Ask your coach for email registration.'});
                        Roster.distinct("School", function(error, results){
                            console.log(results);
                            res.render('register', 
                            {
                                errors,
                                name,
                                email,
                                password,
                                password2,
                                school,
                                userType,
                                Schools : results
                            });
                        });
                    }
                    else {
                        createUser(name, email, password, school, userType, req, res);
                    }
                }).catch(err => {
                    errors.push({msg: "Verify that you are using the same name as the Coach's Roster Database."});
                    Roster.distinct("School", function(error, results){ //This command will find all the schools so that it can be listed in the dropdown menu.
                        console.log(results);
                        res.render('register', 
                        {
                            errors,
                            name,
                            email,
                            password,
                            password2,
                            school,
                            userType,
                            Schools : results
                        });
                    });
                });
            }
            else {
                //when user is a coach
                createUser(name, email, password, school, userType, req, res);
            }
        });
    }
});


router.use(express.static("public"));

module.exports = router;