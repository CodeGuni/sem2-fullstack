const User = require('../models/user');
const Appointment = require('../models/appointment');

exports.getExaminer = async (req, res) => {
  try {
    const drivers = await User.find({ 
      userType: 'Driver', 
      appointment: { $ne: null }, 
      passFail: null 
    }).populate('appointment');
    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers,
      selectedDriver: null,
      testTypeFilter: null,
      message: null
    });
  } catch (err) {
    console.error(err);
    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers: [],
      selectedDriver: null,
      testTypeFilter: null,
      message: 'Error fetching drivers: ' + err.message
    });
  }
};

exports.filterDrivers = async (req, res) => {
  const { testType } = req.body;
  try {
    const drivers = await User.find({ 
      userType: 'Driver', 
      appointment: { $ne: null }, 
      passFail: null,
      testType: testType || { $ne: null }
    }).populate('appointment');
    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers,
      selectedDriver: null,
      testTypeFilter: testType || null,
      message: testType ? `Filtered by ${testType} test` : 'Showing all pending tests'
    });
  } catch (err) {
    console.error(err);
    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers: [],
      selectedDriver: null,
      testTypeFilter: null,
      message: 'Error filtering drivers: ' + err.message
    });
  }
};

exports.evaluateDriver = async (req, res) => {
  const { driverId, comment, passFail } = req.body;
  try {
    const driver = await User.findById(driverId).populate('appointment');
    if (!driver) {
      throw new Error('Driver not found');
    }

    driver.comment = comment || '';
    driver.passFail = passFail === 'true'; 
    await driver.save();

    const drivers = await User.find({ 
      userType: 'Driver', 
      appointment: { $ne: null }, 
      passFail: null 
    }).populate('appointment');
    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers,
      selectedDriver: driver,
      testTypeFilter: null,
      message: 'Driver evaluated successfully!'
    });
  } catch (err) {
    console.error(err);
    const drivers = await User.find({ 
      userType: 'Driver', 
      appointment: { $ne: null }, 
      passFail: null 
    }).populate('appointment');
    res.render('examiner', {
      title: 'Examiner Dashboard',
      drivers,
      selectedDriver: null,
      testTypeFilter: null,
      message: 'Error evaluating driver: ' + err.message
    });
  }
};

module.exports = exports;