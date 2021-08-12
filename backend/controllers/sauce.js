const Sauce = require('../models/Sauce'); // Importation du modèle
const fs = require('fs'); // Donne l'accès au file-system

// Création sauce
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


// Modifier une sauce
exports.modifySauce = (req, res, next) => {
  let sauceObject = {};
  req.file ? ( // condition ? Instruction si vrai
    Sauce.findOne({ // Recherche de la sauce existante
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
  Sauce.updateOne({ // Mise à jour de la sauce existante
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

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ // Recherche de la sauce existante via l'ID
      _id: req.params.id
    })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1]; // Suppression de l'image dans le dossier images
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ // Suppression de la sauce
            _id: req.params.id
          })
          .then(() => {
            res.status(200).json({
              message: 'Sauce supprimée !',
            });
          })
          .catch((error) => {
            res.status(400).json({
              error: error
            });
          });
      });
    })
    .catch((error) => res.status(500).json({
      error
    }));
};

// Afficher une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ // Recherche de la sauce existante via l'ID
      _id: req.params.id,
    })
    .then((sauce) => { 
      res.status(200).json(sauce)
    })
    .catch((error) => {
      res.status(404).json({
        error: error
      })
    });
};

// Afficher toutes les sauces
exports.getAllSauce = (req, res, next) => {
  Sauce.find() // Recherche de toutes les sauces dans la BDD
    .then((sauce) => {
      res.status(200).json(sauce)
    })
    .catch((error) => {
      res.status(400).json({
        error: error
      })
    });
};

// Fonction aimer ou ne pas aimer une sauce (Like - DisLike)
exports.likeDislike = (req, res, next) => {
  //Récupération Like déja présent
  let like = req.body.like;
  //Récupération de l'Id de l'utilisateur
  let userId = req.body.userId;
  //Récupération de l'Id de la sauce en question
  let sauceId = req.params.id

  //Condition si Like ou Dislike
  if (like === 1) { // L'utilisateur like
    Sauce.updateOne({ // MAJ de la sauce
        _id: sauceId
      }, {
        $push: {
          usersLiked: userId // Push de l'id de l'utilisateur qui like
        },
        $inc: {
          likes: +1 // Incrémentation +1 dans le tableau Like
        }
      })
      .then(() => res.status(200).json({
        message: 'Vous avez aimé !'
      }))
      .catch((error) => res.status(400).json({
        error
      }))
  } else if (like === -1) { //L'utilisateur n'aime pas
    Sauce.updateOne({
        _id: sauceId
      }, {
        $push: {
          usersDisliked: userId // Push de l'id de l'utilisateur qui disLike
        },
        $inc: {
          dislikes: +1 // Incrémentation +1 dans le tableau disLike
        }
      })
      .then(() => res.status(200).json({
        message: "Vous n'avez pas aimé !"
      }))
      .catch((error) => res.status(400).json({
        error
      }))
  } else if (like == 0) { // L'utilisateur souhaite retirer son Like ou disLike
    Sauce.findOne({
        _id: sauceId // Recherche de la sauce en question
      })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne({ // MAJ de la sauce
              _id: sauceId
            }, {
              $inc: {
                likes: -1 // Incrémentation négative pour supprimer le like
              },
              $pull: {
                usersLiked: userId
              }
            })
            .then(() => res.status(200).json({
              message: 'Le like a été retiré !'
            }))
            .catch(error => res.status(400).json({
              error
            }));
        }
        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne({
              _id: sauceId
            }, {
              $inc: {
                dislikes: -1 // Incrémentation négative pour supprimer le disLike
              },
              $pull: {
                usersDisliked: userId
              }
            })
            .then(() => res.status(200).json({
              message: 'Le disLike a été retiré !'
            }))
            .catch(error => res.status(400).json({
              error
            }));
        }
      })
  }
}