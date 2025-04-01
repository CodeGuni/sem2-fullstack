const User = require('../models/user');
const Appointment = require('../models/appointment');

exports.getG = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('appointment');
    if (!user) {
      return res.render('g', {
        title: 'G License',
        user: null,
        bookedAppointment: null,
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
      message: null
    });
  } catch (err) {
    console.error(err);
    res.render('g', {
      title: 'G License',
      user: null,
      bookedAppointment: null,
      message: 'Error fetching G license information: ' + err.message
    });
  }
};

exports.updateG = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('appointment');
    if (!user) {
      return res.render('g', {
        title: 'G License',
        user: null,
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
    const bookedAppointment = user.appointment || null;
    res.render('g', {
      title: 'G License',
      user: {
        ...user._doc,
        licenseNo: user.getDecryptedLicenseNo()
      },
      bookedAppointment,
      message: 'Car information updated successfully!'
    });
  } catch (err) {
    console.error(err);
    const user = await User.findById(req.session.user._id).populate('appointment');
    const bookedAppointment = user ? user.appointment || null : null;
    res.render('g', {
      title: 'G License',
      user: user ? { ...user._doc, licenseNo: user.getDecryptedLicenseNo() } : null,
      bookedAppointment,
      message: 'Error updating car information: ' + err.message
    });
  }
};

module.exports = exports;