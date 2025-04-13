/*
 * File: gController.js
 * Author: Gunpreet Singh
 * Student ID: 9022194
 * Purpose: Manages G test page functionality, including car info updates and appointment booking.
 */
const User = require('../models/user');
const Appointment = require('../models/appointment');

exports.getG = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('gAppointment');
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    if (!user) {
      return res.render('g', {
        title: 'G License',
        user: null,
        appointments: [],
        bookedAppointment: null,
        message: 'User not found'
      });
    }
    const bookedAppointment = user.gAppointment || null;
    res.render('g', {
      title: 'G License',
      user: {
        ...user._doc,
        licenseNo: user.getDecryptedLicenseNo()
      },
      appointments,
      bookedAppointment,
      message: null
    });
  } catch (err) {
    console.error(err);
    res.render('g', {
      title: 'G License',
      user: null,
      appointments: [],
      bookedAppointment: null,
      message: 'Error fetching G license information: ' + err.message
    });
  }
};

exports.updateG = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('gAppointment');
    if (!user) {
      return res.render('g', {
        title: 'G License',
        user: null,
        appointments: [],
        bookedAppointment: null,
        message: 'User not found'
      });
    }

    user.car_details = {
      make: req.body.carMake || user.car_details.make,
      model: req.body.carModel || user.car_details.model,
      year: req.body.carYear ? parseInt(req.body.carYear, 10) : user.car_details.year,
      platno: req.body.platNumber || user.car_details.platno
    };

    await user.save();
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    const bookedAppointment = user.gAppointment || null;
    res.render('g', {
      title: 'G License',
      user: {
        ...user._doc,
        licenseNo: user.getDecryptedLicenseNo()
      },
      appointments,
      bookedAppointment,
      message: 'Car information updated successfully!'
    });
  } catch (err) {
    console.error(err);
    const user = await User.findById(req.session.user._id).populate('gAppointment');
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    const bookedAppointment = user ? user.gAppointment || null : null;
    res.render('g', {
      title: 'G License',
      user: user ? { ...user._doc, licenseNo: user.getDecryptedLicenseNo() } : null,
      appointments,
      bookedAppointment,
      message: 'Error updating car information: ' + err.message
    });
  }
};

exports.bookAppointment = async (req, res) => {
  const { appointmentId } = req.body;
  req.body.testType = 'G'; 
  return require('./appointmentController').bookAppointment(req, res);
};

exports.getAvailableSlots = async (req, res) => {
  const { date } = req.query;
  try {
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const availableSlots = await Appointment.find({
      date: localDate,
      isTimeSlotAvailable: true
    });
    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching available slots' });
  }
};

module.exports = exports;