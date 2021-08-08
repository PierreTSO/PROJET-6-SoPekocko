const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//2 utilisateurs locopeio.. pierre.fournier.. mdp : 12345

const userSchema = mongoose.Schema({
    // userId: { type: String, required: true, unique: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

//Pour ne pas avoir plusieurs utilisateurs avec la même adresse mail
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);