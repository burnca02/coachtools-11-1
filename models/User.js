const mongoose = require('mongoose');

 const UserSchema = new mongoose.Schema({
     name: {
         type: String,
         required: true
     },
     email: {
        type: String,
        required: true
    },
    school: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    userType: {
        type: String,
        required: true
    }
 })

 const User = mongoose.model('User', UserSchema);

 module.exports = User;