const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use((req, res) => {
   res.json({ message: 'Votre requête a bien été reçue !' }); 
});

app.use(bodyParser.json());

module.exports = app;