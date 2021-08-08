const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const path = require('path');

const app = express();

const saucesRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');


mongoose.connect('mongodb+srv://thraceSoPeko:2BSoTH8rJMDMs1DjRubx@cluster0.h5ecw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //Header permettant d'accéder à notre API depuis n'importe quelle origine
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // d'ajouter les headers mentionnés aux requêtes envoyées vers notre API
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); //d'envoyer des requêtes avec les méthodes mentionnées
    next();
  });

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;

