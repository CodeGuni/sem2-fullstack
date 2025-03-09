require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/database');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout/main');

// Authentication middleware
const ensureAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login');
};

const ensureDriver = (req, res, next) => {
  if (req.session.user && req.session.user.userType === 'Driver') return next();
  res.status(403).render('error', { title: 'Forbidden', message: 'Access restricted to Drivers only' });
};

// Routes
const homeController = require('./controllers/homeController');
const authController = require('./controllers/authController');
const g2Controller = require('./controllers/g2Controller');
const gController = require('./controllers/gController');

console.log('homeController:', homeController);
console.log('authController:', authController);
console.log('g2Controller:', g2Controller);
console.log('gController:', gController);

app.get('/', homeController.getHome);
app.get('/login', authController.getLogin);
app.post('/login', authController.postLogin);
app.post('/signup', authController.postSignup);
app.get('/logout', authController.logout);
app.get('/g2', ensureAuthenticated, ensureDriver, g2Controller.getG2);
app.post('/g2', ensureAuthenticated, ensureDriver, g2Controller.postG2);
app.get('/g', ensureAuthenticated, ensureDriver, gController.getG);
app.post('/g/update', ensureAuthenticated, ensureDriver, gController.updateG);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});