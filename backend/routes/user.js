const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

const passwordCheck = require('../middleware/passwordCheck');

router.post('/signup', passwordCheck, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;