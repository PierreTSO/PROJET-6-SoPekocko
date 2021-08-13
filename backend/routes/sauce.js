const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/sauce');

// Importation auth pour la gestion des tokens et des sessions d'utilisation
const auth = require('../middleware/auth');
// Importation multer pour la gestion des fichiers
const multer = require('../middleware/multer-config');

router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.get('/', auth, sauceCtrl.getAllSauce);
router.post('/:id/like', auth, sauceCtrl.likeDislike);


module.exports = router;