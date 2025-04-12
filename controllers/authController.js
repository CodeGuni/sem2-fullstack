/*
 * File: authController.js
 * Author: Gunpreet Singh
 * Student ID: 9022194
 * Purpose: Handles authentication routes for login, signup, and logout.
 */
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
  res.render('login', { title: 'Login', message: null });
};

exports.postLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('login', { title: 'Login', message: 'Incorrect username or password' });
    }
    req.session.user = { _id: user._id, userType: user.userType };

    if (user.userType === 'Admin') {
      res.redirect('/appointments');
    } else if (user.userType === 'Examiner') {
      res.redirect('/examiner');
    } else {
      res.redirect('/g2');
    }
  } catch (err) {
    res.render('login', { title: 'Login', message: 'Error logging in: ' + err.message });
  }
};

exports.postSignup = async (req, res) => {
  const { username, password, confirmPassword, userType } = req.body;
  if (!username || !password || !confirmPassword) {
    return res.render('login', { title: 'Login', message: 'All fields are required' });
  }
  if (password !== confirmPassword) {
    return res.render('login', { title: 'Login', message: 'Passwords do not match' });
  }
  if (!['Driver', 'Examiner', 'Admin'].includes(userType)) {
    return res.render('login', { title: 'Login', message: 'Invalid user type' });
  }
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('login', { title: 'Login', message: 'Username already exists' });
    }
    const user = new User({ username, password, userType });
    await user.save();
    req.session.user = { _id: user._id, userType: user.userType };
    if (user.userType === 'Admin') {
      res.redirect('/appointments');
    } else if (user.userType === 'Examiner') {
      res.redirect('/examiner');
    } else {
      res.redirect('/g2');
    }
  } catch (err) {
    res.render('login', { title: 'Login', message: 'Error signing up: ' + err.message });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};