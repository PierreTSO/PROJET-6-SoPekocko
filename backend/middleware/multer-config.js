const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => { //Fonction qui explique à Multer dans quel dossier enregistrer les fichiers
    callback(null, 'images');
  },
  filename: (req, file, callback) => { //Quelle nom de fichier utilisé
    const name = file.originalname.split(' ').join('_'); //Génération du nom avec élimination des espaces en remplçant par underscore
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension); //Création du nom de fichier entier
  }
});

module.exports = multer({storage: storage}).single('image'); //Fichier unique 