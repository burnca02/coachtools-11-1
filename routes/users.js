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

//photo
router.get('/coachToolsLogo.png', (req, res) => {
    res.sendFile('coachToolsLogo.png', { root: '.' })
  });

//Register Page
router.get('/register', (req, res) => res.render('register'));

//Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2, school, userType } = req.body;

    console.log(req.body);
    let errors = [];
    //Check required fields
    if(!name || !email || !password || !password2 || !school || !userType){
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
    if(errors.length > 0) 
    {
        res.render('register', 
        {
            errors,
            name,
            email,
            password,
            password2,
            school,
            userType
        });
    } 
    else
    {
        //validation passed
        User.findOne({ email: email })
        .then(user => {
            if(user) {
                //User exists
                errors.push({ msg: 'Email is already in use.'});
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2,
                    school,
                    userType
                });
            }
             else {
                if(userType == 'player')
                {
                    //We want to check their email addresss matches the information in the roster.
                    Roster.findOne({ FullName: name, School : school})
                    .then(player => {
                        if(player.Email != email)
                        {
                            errors.push({msg: 'Ask your coach for email registration.'});
                            res.render('register', {
                                errors,
                                name,
                                email,
                                password,
                                password2,
                                school,
                                userType
                            });
                        }
                        else 
                        {
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
                                        if(newUser.userType == 'coach') {
                                            req.flash('success_msg', 'You are now registered and can log in');
                                            res.redirect('/users/login');
                                        } else {
                                            req.flash('success_msg', 'You are registered. Please fill in benchmark data');
                                            req.session.name = name;
                                            req.session.email = email; //This will be passed to the benchmarks so that users do not fill out the information.
                                            res.redirect('/functions/benchmarks');
                                        }
                                    })
                                    .catch(err => console.log(err));
                                });
                            });
                        }
                        console.log("This is a valid email" + player.Email);
                    })
                    .catch(err => {
                        errors.push({msg: "Verify that you are using the same name as the Coach's Roster Database."});
                        res.render('register', {
                            errors,
                            name,
                            email,
                            password,
                            password2,
                            school,
                            userType
                        });
                    });
                }
            }
        });
    }
});

//Login Handle
router.post('/login', (req, res, next) => {
    const {email} = req.body;
    req.session.email = email; //Creating a session id for email. This will carry over in all the website.
    console.log('Email is ' + req.session.email);
    User.findOne({ email: email })
        .then(user => {
            req.session.school = user.school;
            req.session._id = user._id; //Passing the ID to make searches easier.
            if(user.userType == 'coach') {
                console.log('User type is ' + user.userType);
                passport.authenticate('local', {
                    successRedirect: '/coachHome',
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
        });
});

// router.post('/login', (req, res, next) => {
//     passport.authenticate('local', {
//         successRedirect: '/playerHome',
//         failureRedirect: '/users/playerlogin',
//         failureFlash: true
//     })(req, res, next);
// });

//logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;