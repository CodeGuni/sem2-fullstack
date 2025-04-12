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
    const user = await User.findById(req.session.user._id).populate('appointment');
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
    const bookedAppointment = user.appointment || null;
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
    const user = await User.findById(req.session.user._id).populate('appointment');
    if (!user) {
      return res.render('g2', {
        title: 'G2 License',
        user: null,
        appointments: [],
        bookedAppointment: null,
        message: 'User not found'
      });
    }

    const { firstName, lastName, licenseNumber, age, dob } = req.body;
    if (!firstName || !lastName || !licenseNumber || !age || !dob) {
      const appointments = await Appointment.find({ isTimeSlotAvailable: true });
      const bookedAppointment = user.appointment || null;
      return res.render('g2', {
        title: 'G2 License',
        user: { ...user._doc, licenseNo: user.getDecryptedLicenseNo() },
        appointments,
        bookedAppointment,
        message: 'All required fields must be filled.'
      });
    }

    user.firstname = firstName;
    user.lastname = lastName;
    user.licenseNo = licenseNumber;
    user.age = parseInt(age, 10);
    user.dob = new Date(dob);
    user.car_details = {
      make: req.body.carMake || user.car_details.make,
      model: req.body.carModel || user.car_details.model,
      year: req.body.carYear ? parseInt(req.body.carYear, 10) : user.car_details.year,
      platno: req.body.platNumber || user.car_details.platno
    };

    await user.save();
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    const bookedAppointment = user.appointment || null;
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
    const user = await User.findById(req.session.user._id).populate('appointment');
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    const bookedAppointment = user ? user.appointment || null : null;
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
  try {
    const user = await User.findById(req.session.user._id).populate('appointment');
    if (!user) {
      throw new Error('User not found');
    }

    if (
      user.firstname === 'default' ||
      user.lastname === 'default' ||
      user.licenseNo === 'default' ||
      user.age === 0 ||
      !user.dob
    ) {
      const appointments = await Appointment.find({ isTimeSlotAvailable: true });
      const bookedAppointment = user.appointment || null;
      return res.render('g2', {
        title: 'G2 License',
        user: { ...user._doc, licenseNo: user.getDecryptedLicenseNo() },
        appointments,
        bookedAppointment,
        message: 'Please update your information before booking an appointment.'
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || !appointment.isTimeSlotAvailable) {
      throw new Error('Appointment not available');
    }

    user.appointment = appointmentId;
    user.testType = 'G2';
    appointment.isTimeSlotAvailable = false;

    await Promise.all([user.save(), appointment.save()]);
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    const bookedAppointment = appointment;
    res.render('g2', {
      title: 'G2 License',
      user: { ...user._doc, licenseNo: user.getDecryptedLicenseNo() },
      appointments,
      bookedAppointment,
      message: 'Appointment booked successfully!'
    });
  } catch (err) {
    const user = await User.findById(req.session.user._id).populate('appointment');
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    const bookedAppointment = user ? user.appointment || null : null;
    res.render('g2', {
      title: 'G2 License',
      user: user ? { ...user._doc, licenseNo: user.getDecryptedLicenseNo() } : null,
      appointments,
      bookedAppointment,
      message: 'Error booking appointment: ' + err.message
    });
  }
};

module.exports = exports;