//Importation du modèle à respecter pour le mot de passe
const schemaPassword = require('../models/password');

//Rédaction du middleware 
module.exports = (req, res, next) => {
    if(!schemaPassword.validate(req.body.password)){ // Si le mot de passe ne respecte pas les caractéristiques demandées
        res.writeHead(400, '{"message":"Mot de passe requis : 8 caractères minimun. Au moins 1 Majuscule, 1 minuscule. Sans espaces"}', {
            'content-type': 'application/json' // Affichage du message suivant
        });
        res.end('Format de mot de passe incorrect');
    }else{
        next();
    }
}
