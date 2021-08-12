// Importation du module password-validator pour la gestion du MDP, augmenter la sécurité vis a vis de l'utilisateur afin qu'il respecte un certains cadres
const passwordValidator = require('password-validator');

const schemaPassword = new passwordValidator();

schemaPassword
    .is().min(8) // Minimum length 8
    .is().max(100) // Maximum length 100
    .has().uppercase() // Must have uppercase letters
    .has().lowercase() // Must have lowercase letters
    .has().digits(2) // Must have at least 2 digits
    .has().not().spaces() // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

// console.log(schemaPassword.validate('validPASS123'));
// // => true
// console.log(schemaPassword.validate('invalidPASS'));
// // => false

module.exports = schemaPassword;