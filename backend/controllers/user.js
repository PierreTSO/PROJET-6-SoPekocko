const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const cryptojs = require('crypto-js')

//Compte : pierre... mdp 12345

exports.signup = (req, res, next) => {
    //Hashage du MDP
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            //Enregistrement dans la BDD
            user.save()
                .then(() => res.status(201).json({message : 'Utilisateur crée !'}))
                .catch(error => res.status(400).json({error}))
        })
        .catch(error => res.status(500).json({error}));
};

exports.login = (req, res, next) => {
    //Méthode findOne pour trouver un seul utilisateur de la BDD
    User.findOne({ email: req.body.email})
        .then(user => {
            if(!user){
                return res.status(401).json({error: 'Utilisateur non trouvé !'})
            }
            //Utilisation de bcrypt pour comparer le mdp utilisé par l'utilisateur et le mdp hashé dans la BDD
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if(!valid){
                        return res.status(401).json({error: 'Mot de passe incorrecte !'})
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            'RANDOM_TOKEN_SECRET',
                            {expiresIn: '24h'}
                        )
                    });
                })
                .catch(error => res.status(500).json({error}))
        })
        .catch(error => res.status(500).json({error}));
};