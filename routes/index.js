const express = require('express')
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const MongoClient = require('mongodb').MongoClient
const uri = "mongodb+srv://hernri01:Capstone2020@cluster0.3ln2m.mongodb.net/test?authSource=admin&replicaSet=atlas-9q0n4l-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true&useUnifiedTopology=true";

MongoClient.connect(uri, { useUnifiedTopology: true })
.then(client => {
    const db = client.db('test');
    const rosterCollection = db.collection('Roster');

        //Coach Home Page`
    router.get('/coachHome', ensureAuthenticated, (req, res) => 

    db.collection('Roster').find({ "Pos": { "$exists": true }, "School": req.session.school}).sort({'Pos': 1}).toArray()
    .then(results => {
        req.session.school = req.user.school;
        console.log(req.session);

        res.render('coachHome', {players: results,
                                name: req.user.name,
                                school: req.session.school   
                                }
                 )
    })
    .catch(error => console.error(error))
    );
})
.catch(console.error)


//Welcome Page
router.get('/', (req, res) => res.render('welcome'));



//Player Home Page
router.get('/playerHome', ensureAuthenticated, (req, res) => 
    res.render('playerHome', {
        name: req.user.name,
        email: req.user.email
    }));

module.exports = router;
