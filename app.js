const express = require('express')
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const csv = require('fast-csv');
const multer = require('multer');



const app = express();

//Passport config
require('./config/passport')(passport);

//DB Config
const db = require('./config/keys').MongoURI;

//Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true ,useUnifiedTopology: true,useFindAndModify: false})
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
app.use('/stats', require('./routes/stats'));

app.use(express.static("public"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
