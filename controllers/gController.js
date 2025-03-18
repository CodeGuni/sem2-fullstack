const User = require('../models/user');

exports.getG = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.render('g', {
        title: 'G License',
        user: null,
        message: 'User not found'
      });
    }
    res.render('g', {
      title: 'G License',
      user: {
        ...user._doc,
        licenseNo: user.getDecryptedLicenseNo() // Decrypt licenseNo for display
      },
      message: null
    });
  } catch (err) {
    console.error(err);
    res.render('g', {
      title: 'G License',
      user: null,
      message: 'Error fetching G license information: ' + err.message
    });
  }
};

exports.updateG = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.render('g', {
        title: 'G License',
        user: null,
        message: 'User not found'
      });
    }

    // Update car details with fallback to existing values if not provided
    user.car_details = {
      make: req.body.carMake || user.car_details.make,
      model: req.body.carModel || user.car_details.model,
      year: req.body.carYear || user.car_details.year,
      platno: req.body.platNumber || user.car_details.platno
    };

    await user.save();
    res.render('g', {
      title: 'G License',
      user: {
        ...user._doc,
        licenseNo: user.getDecryptedLicenseNo() // Decrypt licenseNo for display
      },
      message: 'Car information updated successfully!'
    });
  } catch (err) {
    console.error(err);
    const user = await User.findById(req.session.user._id); // Re-fetch user for consistency
    res.render('g', {
      title: 'G License',
      user: user ? { ...user._doc, licenseNo: user.getDecryptedLicenseNo() } : null,
      message: 'Error updating car information: ' + err.message
    });
  }
};