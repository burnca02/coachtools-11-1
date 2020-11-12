const express = require('express')
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const csv = require('fast-csv');

const app = express();

//Passport config
require('./config/passport')(passport);

//DB Config
const db = require('./config/keys').MongoURI;

//Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true})
.then(() => console.log('Mongo DB Connected...'))
.catch(err => console.log(err));

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//app.use(fileUpload());

//Bodyparser
app.use(express.urlencoded( { extended: false}));

//Express Session 
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));


//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash
app.use(flash());

//Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/functions', require('./routes/functions'));
app.use('/player', require('./routes/player'));
app.use('/coach', require('./routes/coach'));

app.use(express.static("public"));

//photo
//app.get('/coachToolsLogo.png', (req, res) => {
  //res.sendFile('coachToolsLogo.png', { root: '.' })
//});

//send nav.html to coachHome for sidebar
//app.get('/nav.html', (req, res) => {
  //res.sendFile('nav.html', { root: '.' })
//});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log('Server started on port ${PORT}'));
