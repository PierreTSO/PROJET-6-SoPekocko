const bcrypt = require('bcrypt'); // Hashage du MDP pour prévenir des accès frauduleux aux comptes de vos utilisateurs en cas de faille de sécurité.
const User = require('../models/User'); // Importation du modèle utilisateur
const jwt = require('jsonwebtoken');
const cryptojs = require('crypto-js') // Importation du package crypto js pour hasher et protéger l'email dans la BDD

//Compte : pierre... mdp 12345

// Création d'un utilisateur
exports.signup = (req, res, next) => {
    // Cryptage de l'adresse mail, à partir d'une clé secrête dans une variable d'environnement
    var encryptedEmail = cryptojs.HmacSHA256(req.body.email, process.env.EMAIL_ENCRYPTION_KEY).toString();
    console.log(encryptedEmail);
    console.log(req.body.email);
    console.log(process.env.EMAIL_ENCRYPTION_KEY);
    //Hashage du MDP
    bcrypt.hash(req.body.password, 10) //Hashage du MDP avec un salage a 10
        .then(hash => {
            const user = new User({ //Instance de l'utilisateur qui crée son compte avec email et mdp hashé
                email: encryptedEmail, 
                password: hash
            });
            //Enregistrement dans la BDD
            user.save() //Sauvegarde dans la BDD
                .then(() => res.status(201).json({
                    message: 'Utilisateur crée !'
                }))
                .catch(error => res.status(400).json({
                    error
                }))
        })
        .catch(error => res.status(500).json({
            error
        }));
};

// Connexion de l'utilisateur
exports.login = (req, res, next) => {
    // Cryptage de l'adresse mail, à partir d'une clé secrête dans une variable d'environnement
    var encryptedEmail = cryptojs.HmacSHA256(req.body.email, process.env.EMAIL_ENCRYPTION_KEY).toString();
    console.log(encryptedEmail);
    console.log(req.body.email);
    console.log(process.env.EMAIL_ENCRYPTION_KEY);
    //Méthode findOne pour trouver un seul utilisateur de la BDD
    User.findOne({ //Recherche de l'utilisateur à partir de l'email crypté
            email: encryptedEmail
        })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    error: 'Utilisateur non trouvé !'
                })
            }
            //Utilisation de bcrypt pour comparer le mdp utilisé par l'utilisateur et le mdp hashé dans la BDD
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({
                            error: 'Mot de passe incorrecte !'
                        })
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({
                                userId: user._id
                            },
                            'RANDOM_TOKEN_SECRET', {
                                expiresIn: '24h'
                            }
                        )
                    });
                })
                .catch(error => res.status(500).json({
                    error
                }))
        })
        .catch(error => res.status(500).json({
            error
        }));
};