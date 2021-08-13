
const multer = require('multer'); // Multer est un middleware Node. js pour la gestion multipart/form-data , qui est principalement utilisé pour télécharger des fichiers.

// Gestion des types de fichiers téléchargés
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Gestion de la sauvegarde des fichiers en local
const storage = multer.diskStorage({
  destination: (req, file, callback) => { // Fonction qui explique à Multer dans quel dossier enregistrer les fichiers
    callback(null, 'images');
  },
  filename: (req, file, callback) => { // Quelle nom de fichier utilisé
    const name = file.originalname.split(' ').join('_'); // Génération du nom avec élimination des espaces en remplaçant par underscore
    const extension = MIME_TYPES[file.mimetype]; // Gestion de l'extension du fichier
    callback(null, name + Date.now() + '.' + extension); // Création du nom de fichier entier
  }
});

module.exports = multer({
  storage: storage
}).single('image'); // Fichier unique 