require('dotenv').config()

// const SECRET_KEY = process.env.EMAIL_API_KEY;
// const username = process.env.MONGODB_USERNAME;
// const password = process.env.MONGO_PASSWORD;


const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// const PORT = process.env.PORT || 5000;
const cors = require('cors');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');


const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = process.env.MONGODB_URL || `mongodb+srv://azufelt:manager01@cluster0.ctdx0.mongodb.net/BackendNodeProject?retryWrites=true&w=majority`;
//use ^^^ that keeps username & password confidential
//MAx's veresion below
// const MONGODB_URI = 'mongodb+srv://azufelt:manager01@cluster0.ctdx0.mongodb.net/BackendNodeProject';


const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');


const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const corsOptions = {
  origin: "https://backendnodeproject.herokuapp.com/",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const options = {
  family: 4
};

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});


mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });

// mongoose
//   .connect(
//     MONGODB_URI)
//   .then(result => {
//     app.listen(3000);
//   })
//   // .then(result => {
//   //   User.findOne().then(user => {
//   //     if (!user) {
//   //       const user = new User({
//   //         name: 'Ashley',
//   //         email: 'ashley.zufelt@gmail.com',
//   //         cart: {
//   //           items: []
//   //         }
//   //       });
//   //       user.save();
//   //     }
//   //   });
//   //   app.listen(3000);
//   // })
//   .catch(err => {
//     console.log(err);
//   });