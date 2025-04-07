const User = require('../models/user');
const Appointment = require('../models/appointment');

exports.getG = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('appointment');
    const appointments = await Appointment.find({ isTimeSlotAvailable: true }); 
    if (!user) {
      return res.render('g', {
        title: 'G License',
        user: null,
        bookedAppointment: null,
        appointments: [],
        message: 'User not found'
      });
    }
    const bookedAppointment = user.appointment || null;
    res.render('g', {
      title: 'G License',
      user: {
        ...user._doc,
        licenseNo: user.getDecryptedLicenseNo()
      },
      bookedAppointment,
      appointments,
      message: null
    });
  } catch (err) {
    console.error(err);
    res.render('g', {
      title: 'G License',
      user: null,
      bookedAppointment: null,
      appointments: [],
      message: 'Error fetching G license information: ' + err.message
    });
  }
};

exports.updateG = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('appointment');
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    if (!user) {
      return res.render('g', {
        title: 'G License',
        user: null,
        bookedAppointment: null,
        appointments: [],
        message: 'User not found'
      });
    }

    user.car_details = {
      make: req.body.carMake || user.car_details.make,
      model: req.body.carModel || user.car_details.model,
      year: req.body.carYear ? parseInt(req.body.carYear, 10) : user.car_details.year,
      platno: req.body.platNumber || user.car_details.platno
    };
    user.testType = 'G'; 

    await user.save();
    const bookedAppointment = user.appointment || null;
    res.render('g', {
      title: 'G License',
      user: {
        ...user._doc,
        licenseNo: user.getDecryptedLicenseNo()
      },
      bookedAppointment,
      appointments,
      message: 'Car information updated successfully!'
    });
  } catch (err) {
    console.error(err);
    const user = await User.findById(req.session.user._id).populate('appointment');
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    const bookedAppointment = user ? user.appointment || null : null;
    res.render('g', {
      title: 'G License',
      user: user ? { ...user._doc, licenseNo: user.getDecryptedLicenseNo() } : null,
      bookedAppointment,
      appointments,
      message: 'Error updating car information: ' + err.message
    });
  }
};

exports.bookGAppointment = async (req, res) => {
  const { appointmentId } = req.body;
  try {
    const user = await User.findById(req.session.user._id).populate('appointment');
    if (!user) {
      throw new Error('User not found');
    }

    if (
      user.car_details.make === 'default' ||
      user.car_details.model === 'default' ||
      user.car_details.year === 0 ||
      user.car_details.platno === 'default'
    ) {
      const appointments = await Appointment.find({ isTimeSlotAvailable: true });
      const bookedAppointment = user.appointment || null;
      return res.render('g', {
        title: 'G License',
        user: { ...user._doc, licenseNo: user.getDecryptedLicenseNo() },
        bookedAppointment,
        appointments,
        message: 'Please update your car information before booking an appointment.'
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || !appointment.isTimeSlotAvailable) {
      throw new Error('Appointment not available');
    }

    if (user.appointment) {
      const oldAppointment = await Appointment.findById(user.appointment);
      if (oldAppointment) {
        oldAppointment.isTimeSlotAvailable = true;
        await oldAppointment.save();
      }
    }

    user.appointment = appointmentId;
    user.testType = 'G'; 
    appointment.isTimeSlotAvailable = false;

    await Promise.all([user.save(), appointment.save()]);
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    const bookedAppointment = appointment;
    res.render('g', {
      title: 'G License',
      user: { ...user._doc, licenseNo: user.getDecryptedLicenseNo() },
      bookedAppointment,
      appointments,
      message: 'Appointment booked successfully!'
    });
  } catch (err) {
    console.error(err);
    const user = await User.findById(req.session.user._id).populate('appointment');
    const appointments = await Appointment.find({ isTimeSlotAvailable: true });
    const bookedAppointment = user ? user.appointment || null : null;
    res.render('g', {
      title: 'G License',
      user: user ? { ...user._doc, licenseNo: user.getDecryptedLicenseNo() } : null,
      bookedAppointment,
      appointments,
      message: 'Error booking appointment: ' + err.message
    });
  }
};

module.exports = exports;