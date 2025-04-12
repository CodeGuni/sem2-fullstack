/*
 * File: examinerController.js
 * Author: Gunpreet Singh
 * Student ID: 9022194
 * Purpose: Manages examiner dashboard for viewing appointments, adding comments, and marking pass/fail.
 */
const User = require('../models/user');
const Appointment = require('../models/appointment');

exports.getExaminer = async (req, res) => {
  try {
    const filter = req.query.testType || 'all';
    let query = { userType: 'Driver', appointment: { $ne: null } };

    if (filter === 'G2') {
      query.testType = 'G2';
    } else if (filter === 'G') {
      query.testType = 'G';
    }

    const drivers = await User.find(query)
      .populate('appointment')
      .select('firstname lastname licenseNo car_details testType appointment examinerComment passFail');

    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers,
      filter,
      message: null
    });
  } catch (err) {
    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers: [],
      filter: 'all',
      message: 'Error fetching drivers: ' + err.message
    });
  }
};

exports.postExaminer = async (req, res) => {
  const { driverId, comment, passFail } = req.body;
  try {
    const driver = await User.findById(driverId);
    if (!driver || driver.userType !== 'Driver') {
      throw new Error('Driver not found');
    }

    driver.examinerComment = comment || driver.examinerComment;
    driver.passFail = passFail === 'true' ? true : passFail === 'false' ? false : driver.passFail;

    await driver.save();

    const filter = req.query.testType || 'all';
    let query = { userType: 'Driver', appointment: { $ne: null } };

    if (filter === 'G2') {
      query.testType = 'G2';
    } else if (filter === 'G') {
      query.testType = 'G';
    }

    const drivers = await User.find(query)
      .populate('appointment')
      .select('firstname lastname licenseNo car_details testType appointment examinerComment passFail');

    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers,
      filter,
      message: 'Driver evaluation updated successfully!'
    });
  } catch (err) {
    const filter = req.query.testType || 'all';
    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers: [],
      filter,
      message: 'Error updating driver evaluation: ' + err.message
    });
  }
};