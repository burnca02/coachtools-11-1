const express = require('express')
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

//Welcome Page
router.get('/', (req, res) => res.render('welcome'));

//Coach Home Page
router.get('/coachHome', ensureAuthenticated, (req, res) => 
    res.render('coachHome', {
        name: req.user.name //pass the name that was entered into the database to dashboard
    }));

//Player Home Page
router.get('/playerHome', ensureAuthenticated, (req, res) => 
    res.render('playerHome', {
        name: req.user.name,
        email: req.user.email
    }));

module.exports = router;
