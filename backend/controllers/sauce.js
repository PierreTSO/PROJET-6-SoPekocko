const Sauce = require('../models/Sauce');
// const fs = require('fs');

exports.createSauce = (req, res, next) => {
    // On stocke les données envoyées par le front-end sous forme de form-data dans une variable en les transformant en objet js
    const sauceObject = JSON.parse(req.body.sauce);
    // On supprime l'id généré automatiquement et envoyé par le front-end. L'id de la sauce est créé par la base MongoDB lors de la création dans la base
    delete sauceObject._id;
    // Création d'une instance du modèle Sauce
    const sauce = new Sauce({
      ...sauceObject,
      // On modifie l'URL de l'image, on veut l'URL complète, quelque chose dynamique avec les segments de l'URL
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: []
    });
    // Sauvegarde de la sauce dans la base de données
    sauce.save()
      // On envoi une réponse au frontend avec un statut 201 sinon on a une expiration de la requête
      .then(() => res.status(201).json({
        message: 'Sauce enregistrée !'
      }))
      // On ajoute un code erreur en cas de problème
      .catch(error => res.status(400).json({
        error
      }));
  };

  exports.modifySauce = (req, res, next) => {
    let sauceObject = {};
    req.file ? ( // condition ? Instruction si vrai
      Sauce.findOne({
        _id: req.params.id
      }).then((sauce) => {
        // Suppression ancienne image du serveur
        const filename = sauce.imageUrl.split('/images/')[1]
        fs.unlinkSync(`images/${filename}`)
      }),
      sauceObject = {
        // Modification données et on ajoute la nouvelle image
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      }
    ) : ( // Condition : Instruction si faux
      // Si la modification ne contient pas de nouvelle image
      sauceObject = {
        ...req.body
      }
    )
    Sauce.updateOne({
        _id: req.params.id
      }, {
        ...sauceObject,
        _id: req.params.id
      })
      .then(() => {
        res.status(201).json({
          message: 'La sauce a été modifié correctement!',
        });
      })
      .catch((error) => {
        res.status(400).json({
          error: error,
        });
      });
  };  

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
      })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({
              _id: req.params.id
            })
            .then(() => {
              res.status(200).json({
                message: 'Sauce supprimée !',
              });
            })
            .catch((error) => {
              res.status(400).json({error: error});
            });
        });
      })
      .catch((error) => res.status(500).json({error}));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
      _id: req.params.id,
    })
    .then((sauce) => {res.status(200).json(sauce)})
    .catch((error) => {res.status(404).json({error: error})
    });
};  

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
      .then((sauce) => {res.status(200).json(sauce)})
      .catch((error) => {res.status(400).json({error: error})
    });
};

exports.likeDislike = (req,res, next) => {
  //Récupération Like déja présent
  let like = req.body.like;
  //Récupération de l'Id de l'utilisateur
  let userId = req.body.userId;
  //Récupération de l'Id de la sauce en question
  let sauceId = req.params.id

  //Condition si Like ou Dislike

  if(like === 1){ //L'utilisateur like
    Sauce.updateOne(
        {_id: sauceId},
        {
          $push: {usersLiked: userId},
          $inc: {likes: +1}
        }
    )
    .then(() => res.status(200).json({message:'Vous avez aimé !'}))
    .catch((error) => res.status(400).json({error}))
  }
  if(like === -1) { //L'utilisateur n'aime pas
    Sauce.updateOne(
      {_id: sauceId},
      {
        $push: {usersDisliked: userId},
        $inc: {dislikes: +1}
      }
    )
    .then(() => res.status(200).json({message:"Vous n'avez pas aimé !"}))
    .catch((error) => res.status(400).json({error}))
  }

}