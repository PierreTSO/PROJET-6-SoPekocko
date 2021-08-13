const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

// Importation passwordCheck pour la sécurité du MDP généré par l'utilisateur
const passwordCheck = require('../middleware/passwordCheck');

router.post('/signup', passwordCheck, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;