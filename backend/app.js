const express       = require('express'); // Importation du frameword Express de Node.js pour posséder un ensemble de fonctionnalités robustes
const bodyParser    = require('body-parser'); // Importation du module body-parser pour la gestion des données
const mongoose      = require('mongoose'); // Importation de mongoose pour la structure des données, modèles entre Node.js & MongoDB
const dotenv        = require('dotenv').config(); // Importation de dotenv pour stocker les variables d'environnements secrêtes
const helmet        = require('helmet'); // Importation de Helmet pour la protection de l'application de certaines vulnérabilités connues du web - utile pour les en-tête HTTP
const mongoSanitize = require('express-mongo-sanitize'); // Importation de mongo-sanitize pour nettoyer le corps des requêtes.
const rateLimit     = require('express-rate-limit'); // Afin de fixer un taux limite pour les requêtes à destination de l'API
const path          = require('path');  // fournit un moyen de travailler avec les répertoires et les chemins de fichiers.
const session = require('cookie-session'); // Ce module fournit des sessions "invités", ce qui signifie que tout visiteur aura une session, qu'il soit authentifié ou non. Si une session est nouvelle, 
//un Set-Cookie sera produit indépendamment du remplissage de la session.



// Utilisation de rateLimit avec le package importé
const limiter = rateLimit({         
  windowMs: 15 * 60 * 1000,       // = 15 minutes
  max: 100
})

// Utilisation d'express
const app = express();

//Gestion du cookie
const expiryDate = new Date( Date.now() + 60 * 60 * 1000 ); // 1 hour
app.use(session({
  name: 'session',
  keys: process.env.SEC_SES,
  cookie: { secure: true, // secure - Garantit que le navigateur n’envoie le cookie que sur HTTPS.
            httpOnly: true, // httpOnly - Garantit que le cookie n’est envoyé que sur HTTP(S), pas au JavaScript du client, ce qui renforce la protection contre les attaques de type cross-site scripting.
            domain: 'http://localhost:3000', //domain - Indique le domaine du cookie ; utilisez cette option pour une comparaison avec le domaine du serveur dans lequel l’URL est demandée. S’ils correspondent, vérifiez ensuite l’attribut de chemin.
            expires: expiryDate //expires - Utilisez cette option pour définir la date d’expiration des cookies persistants.
          }
  })
);

// Utilisation du package rateLimit
app.use(limiter);

// Sécurisation des entêtes HTTP
app.use(helmet());
// ...is equivalent to this:
// app.use(helmet.contentSecurityPolicy()); définit l’en-tête Content-Security-Policy pour la protection contre les attaques de type cross-site scripting et autres injections intersites.
// app.use(helmet.dnsPrefetchControl());
// app.use(helmet.expectCt());
// app.use(helmet.frameguard()); définit l’en-tête X-Frame-Options pour fournir une protection clickjacking.
// app.use(helmet.hidePoweredBy()); supprime l’en-tête X-Powered-By.
// app.use(helmet.hsts()); définit l’en-tête Strict-Transport-Security qui impose des connexions (HTTP sur SSL/TLS) sécurisées au serveur.
// app.use(helmet.ieNoOpen()); définit X-Download-Options pour IE8+.
// app.use(helmet.noSniff()); définit X-Content-Type-Options pour protéger les navigateurs du reniflage du code MIME d’une réponse à partir du type de contenu déclaré.
// app.use(helmet.permittedCrossDomainPolicies());
// app.use(helmet.referrerPolicy()); Ceci définit les options personnalisées pour le middleware `referrerPolicy`.
// app.use(helmet.xssFilter()); définit X-XSS-Protection afin d’activer le filtre de script intersites (XSS) dans les navigateurs Web les plus récents.

// Connexion à MongoDB, mongoose va récupérer les variables d'environnements dans le dossier .env
mongoose.connect(process.env.MONGODB_URI,
  { dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


// Gestion des entêtes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //Header permettant d'accéder à notre API depuis n'importe quelle origine
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // d'ajouter les headers mentionnés aux requêtes envoyées vers notre API
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); //d'envoyer des requêtes avec les méthodes mentionnées
    next();
  });

// Protection des attaques XSS via le package HELMET
// Active le filtrage XSS. Plutôt que d'assainir la page, le navigateur empêchera le rendu de la page si une attaque est détectée.
app.use((req, res, next) => {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
});

// Parsing de toutes les requêtes entrantes
app.use(bodyParser.json());

  //Protection des données contre l'injection SQL dans les inputs
app.use(mongoSanitize({
    replaceWith: '_'
}))
  

// Gestion des images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Importation des routes user et sauce 
const saucesRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

//Utilisation des routes de l'API
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;