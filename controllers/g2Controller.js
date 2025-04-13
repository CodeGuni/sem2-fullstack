/*
 * File: g2Controller.js
 * Author: Gunpreet Singh
 * Student ID: 9022194
 * Purpose: Manages G2 test page functionality, including user info updates and appointment booking.
 */
const User = require('../models/user');
const Appointment = require('../models/appointment');

exports.getG2 = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('g2Appointment');
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    if (!user) {
      return res.render('g2', {
        title: 'G2 License',
        user: null,
        appointments: [],
        bookedAppointment: null,
        message: 'User not found'
      });
    }
    const bookedAppointment = user.g2Appointment || null;
    res.render('g2', {
      title: 'G2 License',
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
    res.render('g2', {
      title: 'G2 License',
      user: null,
      appointments: [],
      bookedAppointment: null,
      message: 'Error fetching G2 license information: ' + err.message
    });
  }
};

exports.postG2 = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('g2Appointment');
    if (!user) {
      return res.render('g2', {
        title: 'G2 License',
        user: null,
        appointments: [],
        bookedAppointment: null,
        message: 'User not found'
      });
    }

    const { firstName, lastName, licenseNumber, dob, carMake, carModel, carYear, platNumber } = req.body;

    
    if (!firstName || !lastName || !licenseNumber || !dob) {
      const appointments = await Appointment.find({ isTimeSlotAvailable: true });
      const bookedAppointment = user.g2Appointment || null;
      return res.render('g2', {
        title: 'G2 License',
        user: { ...user._doc, licenseNo: user.getDecryptedLicenseNo() },
        appointments,
        bookedAppointment,
        message: 'All required fields must be filled.'
      });
    }

    
    const dobDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      calculatedAge--;
    }

    if (calculatedAge < 16) {
      const appointments = await Appointment.find({ isTimeSlotAvailable: true });
      const bookedAppointment = user.g2Appointment || null;
      return res.render('g2', {
        title: 'G2 License',
        user: { ...user._doc, licenseNo: user.getDecryptedLicenseNo() },
        appointments,
        bookedAppointment,
        message: 'You must be at least 16 years old to update your information.'
      });
    }

    
    user.firstname = firstName;
    user.lastname = lastName;
    user.licenseNo = licenseNumber;
    user.age = calculatedAge;
    user.dob = dobDate;
    user.car_details = {
      make: carMake || user.car_details.make,
      model: carModel || user.car_details.model,
      year: carYear ? parseInt(carYear, 10) : user.car_details.year,
      platno: platNumber || user.car_details.platno
    };

    await user.save();
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    const bookedAppointment = user.g2Appointment || null;
    res.render('g2', {
      title: 'G2 License',
      user: {
        ...user._doc,
        licenseNo: user.getDecryptedLicenseNo()
      },
      appointments,
      bookedAppointment,
      message: 'Information updated successfully!'
    });
  } catch (err) {
    console.error(err);
    const user = await User.findById(req.session.user._id).populate('g2Appointment');
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    const bookedAppointment = user ? user.g2Appointment || null : null;
    res.render('g2', {
      title: 'G2 License',
      user: user ? { ...user._doc, licenseNo: user.getDecryptedLicenseNo() } : null,
      appointments,
      bookedAppointment,
      message: 'Error updating user information: ' + err.message
    });
  }
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

exports.bookAppointment = async (req, res) => {
  const { appointmentId } = req.body;
  req.body.testType = 'G2';
  return require('./appointmentController').bookAppointment(req, res);
};

module.exports = exports;