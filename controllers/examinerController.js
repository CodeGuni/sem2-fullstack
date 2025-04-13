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
    
    let query = {
      userType: 'Driver',
      $or: [{ g2Appointment: { $ne: null } }, { gAppointment: { $ne: null } }]
    };

    const drivers = await User.find(query)
      .populate('g2Appointment gAppointment')
      .select('firstname lastname licenseNo car_details g2Appointment gAppointment g2TestResult gTestResult');

   //log
    console.log('Fetched drivers:', drivers.map(d => ({
      id: d._id,
      name: `${d.firstname} ${d.lastname}`,
      g2Appointment: d.g2Appointment ? d.g2Appointment.time : null,
      gAppointment: d.gAppointment ? d.gAppointment.time : null
    })));


    const driverData = [];
    drivers.forEach(driver => {

      if (driver.g2Appointment && (filter === 'all' || filter === 'G2')) {
        driverData.push({
          _id: driver._id,
          firstname: driver.firstname,
          lastname: driver.lastname,
          licenseNo: driver.getDecryptedLicenseNo(),
          car_details: driver.car_details,
          testType: 'G2',
          appointment: driver.g2Appointment,
          examinerComment: driver.g2TestResult.examinerComment || '',
          passFail: driver.g2TestResult.passFail
        });
      }
      
      if (driver.gAppointment && (filter === 'all' || filter === 'G')) {
        driverData.push({
          _id: driver._id,
          firstname: driver.firstname,
          lastname: driver.lastname,
          licenseNo: driver.getDecryptedLicenseNo(),
          car_details: driver.car_details,
          testType: 'G',
          appointment: driver.gAppointment,
          examinerComment: driver.gTestResult.examinerComment || '',
          passFail: driver.gTestResult.passFail
        });
      }
    });

    //log
    console.log('Processed driverData:', driverData.map(d => ({
      name: `${d.firstname} ${d.lastname}`,
      testType: d.testType,
      appointment: d.appointment ? d.appointment.time : null
    })));

    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers: driverData,
      filter,
      message: driverData.length === 0 ? 'No appointments found for the selected filter.' : null
    });
  } catch (err) {
    console.error('Error in getExaminer:', err);
    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers: [],
      filter: 'all',
      message: 'Error fetching drivers: ' + err.message
    });
  }
};

exports.postExaminer = async (req, res) => {
  const { driverId, comment, passFail, testType } = req.body;
  try {
    const driver = await User.findById(driverId);
    if (!driver || driver.userType !== 'Driver') {
      throw new Error('Driver not found');
    }

    if (testType === 'G2') {
      driver.g2TestResult.examinerComment = comment || driver.g2TestResult.examinerComment;
      driver.g2TestResult.passFail = passFail === 'true' ? true : passFail === 'false' ? false : driver.g2TestResult.passFail;
    } else if (testType === 'G') {
      driver.gTestResult.examinerComment = comment || driver.gTestResult.examinerComment;
      driver.gTestResult.passFail = passFail === 'true' ? true : passFail === 'false' ? false : driver.gTestResult.passFail;
    } else {
      throw new Error('Invalid test type');
    }

    await driver.save();

    const filter = req.query.testType || 'all';
    let query = {
      userType: 'Driver',
      $or: [{ g2Appointment: { $ne: null } }, { gAppointment: { $ne: null } }]
    };

    const drivers = await User.find(query)
      .populate('g2Appointment gAppointment')
      .select('firstname lastname licenseNo car_details g2Appointment gAppointment g2TestResult gTestResult');

    const driverData = [];
    drivers.forEach(driver => {
      if (driver.g2Appointment && (filter === 'all' || filter === 'G2')) {
        driverData.push({
          _id: driver._id,
          firstname: driver.firstname,
          lastname: driver.lastname,
          licenseNo: driver.getDecryptedLicenseNo(),
          car_details: driver.car_details,
          testType: 'G2',
          appointment: driver.g2Appointment,
          examinerComment: driver.g2TestResult.examinerComment || '',
          passFail: driver.g2TestResult.passFail
        });
      }
      if (driver.gAppointment && (filter === 'all' || filter === 'G')) {
        driverData.push({
          _id: driver._id,
          firstname: driver.firstname,
          lastname: driver.lastname,
          licenseNo: driver.getDecryptedLicenseNo(),
          car_details: driver.car_details,
          testType: 'G',
          appointment: driver.gAppointment,
          examinerComment: driver.gTestResult.examinerComment || '',
          passFail: driver.gTestResult.passFail
        });
      }
    });

    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers: driverData,
      filter,
      message: 'Driver evaluation updated successfully!'
    });
  } catch (err) {
    console.error('Error in postExaminer:', err);
    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers: [],
      filter: req.query.testType || 'all',
      message: 'Error updating driver evaluation: ' + err.message
    });
  }
};

module.exports = exports;