//Middleware d'authentification
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; //Pour récupérer le TOKEN
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');//Décodage du token, en le vérifiant avec la clé secrète
    const userId = decodedToken.userId; //Récupération du userId
    if (req.body.userId && req.body.userId !== userId) {
      throw 'ID non valable';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Requête non authentifiée')
    });
  }
};