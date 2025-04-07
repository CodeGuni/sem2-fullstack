require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/database');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(session({
  secret: process.env.SESSION_SECRET || 'kuch_v_nahi_labeya',
  resave: false,
  saveUninitialized: false
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout/main');

const ensureAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login');
};

const ensureDriver = (req, res, next) => {
  if (req.session.user && req.session.user.userType === 'Driver') return next();
  res.status(403).render('error', { title: 'Forbidden', message: 'Access restricted to Drivers only' });
};

const ensureAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.userType === 'Admin') return next();
  res.status(403).render('error', { title: 'Forbidden', message: 'Access restricted to Admins only' });
};

const homeController = require('./controllers/homeController');
const authController = require('./controllers/authController');
const g2Controller = require('./controllers/g2Controller');
const gController = require('./controllers/gController');
const appointmentController = require('./controllers/appointmentController');

/*
console.log('homeController:', homeController);
console.log('authController:', authController);
console.log('g2Controller:', g2Controller);
console.log('gController:', gController);
console.log('appointmentController:', appointmentController);
*/

app.get('/', homeController.getHome);
app.get('/login', authController.getLogin);
app.post('/login', authController.postLogin);
app.post('/signup', authController.postSignup);
app.get('/logout', authController.logout);
app.get('/g2', ensureAuthenticated, ensureDriver, g2Controller.getG2);
app.post('/g2', ensureAuthenticated, ensureDriver, g2Controller.postG2);
app.get('/g2/available-slots', ensureAuthenticated, ensureDriver, g2Controller.getAvailableSlots);
app.post('/g2/book', ensureAuthenticated, ensureDriver, appointmentController.bookAppointment);
app.post('/g2/reschedule', ensureAuthenticated, ensureDriver, appointmentController.rescheduleAppointment); 
app.get('/g', ensureAuthenticated, ensureDriver, gController.getG);
app.post('/g/update', ensureAuthenticated, ensureDriver, gController.updateG);
app.get('/appointments', ensureAuthenticated, ensureAdmin, appointmentController.getAppointments);
app.post('/appointments', ensureAuthenticated, ensureAdmin, appointmentController.postAppointment);
app.get('/appointments/available', ensureAuthenticated, ensureAdmin, appointmentController.getAvailableSlots);
app.post('/g/book', ensureAuthenticated, ensureDriver, gController.bookGAppointment);
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});