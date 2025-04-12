/*
 * File: homeController.js
 * Author: Gunpreet Singh
 * Student ID: 9022194
 * Purpose: Handles the homepage route for the application.
 */
exports.getHome = (req, res) => {
  res.render('dashboard', { title: 'Dashboard' });
};