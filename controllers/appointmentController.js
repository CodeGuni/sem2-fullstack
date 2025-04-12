/*
 * File: appointmentController.js
 * Author: Gunpreet Singh
 * Student ID: 9022194
 * Purpose: Handles admin appointment management, including creating and viewing time slots.
 */
const Appointment = require('../models/appointment');
const User = require('../models/user');

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.render('appointment', {
      title: 'Manage Appointments',
      appointments,
      selectedDate: new Date().toISOString().split('T')[0],
      message: null
    });
  } catch (err) {
    res.render('appointment', {
      title: 'Manage Appointments',
      appointments: [],
      selectedDate: new Date().toISOString().split('T')[0],
      message: 'Error fetching appointments: ' + err.message
    });
  }
};

exports.postAppointment = async (req, res) => {
  const { date, time } = req.body;
  try {
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const appointment = new Appointment({ date: localDate, time });
    await appointment.save();
    const appointments = await Appointment.find();
    res.render('appointment', {
      title: 'Manage Appointments',
      appointments,
      selectedDate: date,
      message: 'Slot added successfully!'
    });
  } catch (err) {
    const appointments = await Appointment.find();
    res.render('appointment', {
      title: 'Manage Appointments',
      appointments,
      selectedDate: date || new Date().toISOString().split('T')[0],
      message: 'Error adding appointment: ' + err.message
    });
  }
};

exports.getAvailableSlots = async (req, res) => {
  const { date } = req.query;
  try {
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const bookedSlots = await Appointment.find({
      date: localDate
    }).select('time');
    const bookedTimes = bookedSlots.map(slot => slot.time);
    res.json({ bookedTimes });
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

exports.rescheduleAppointment = async (req, res) => {
  const { appointmentId } = req.body;
  try {
    const user = await User.findById(req.session.user._id).populate('appointment');
    if (!user) {
      throw new Error('User not found');
    }

    const newAppointment = await Appointment.findById(appointmentId);
    if (!newAppointment || !newAppointment.isTimeSlotAvailable) {
      throw new Error('New appointment slot not available');
    }

    if (user.appointment) {
      const oldAppointment = await Appointment.findById(user.appointment);
      if (oldAppointment) {
        oldAppointment.isTimeSlotAvailable = true;
        await oldAppointment.save();
      }
    }

    user.appointment = appointmentId;
    newAppointment.isTimeSlotAvailable = false;

    await Promise.all([user.save(), newAppointment.save()]);
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    const bookedAppointment = newAppointment;
    res.render('g2', {
      title: 'G2 License',
      user: { ...user._doc, licenseNo: user.getDecryptedLicenseNo() },
      appointments,
      bookedAppointment,
      message: 'Appointment rescheduled successfully!'
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
      message: 'Error rescheduling appointment: ' + err.message
    });
  }
};

module.exports = exports;