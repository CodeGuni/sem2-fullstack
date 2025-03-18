const User = require('../models/user');

exports.getG2 = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.render('g2', {
        title: 'G2 License',
        user: null,
        message: 'User not found'
      });
    }
    res.render('g2', {
      title: 'G2 License',
      user: {
        ...user._doc,
        licenseNo: user.getDecryptedLicenseNo() // Decrypt licenseNo for display
      },
      message: null
    });
  } catch (err) {
    console.error(err);
    res.render('g2', {
      title: 'G2 License',
      user: null,
      message: 'Error fetching G2 license information: ' + err.message
    });
  }
};

exports.postG2 = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.render('g2', {
        title: 'G2 License',
        user: null,
        message: 'User not found'
      });
    }

    // Update user details with fallback to existing values if not provided
    user.firstname = req.body.firstName || user.firstname;
    user.lastname = req.body.lastName || user.lastname;
    user.licenseNo = req.body.licenseNumber || user.licenseNo; // Will be encrypted by pre-save hook
    user.age = req.body.age || user.age;
    user.dob = req.body.dob || user.dob;
    user.car_details = {
      make: req.body.carMake || user.car_details.make,
      model: req.body.carModel || user.car_details.model,
      year: req.body.carYear || user.car_details.year,
      platno: req.body.platNumber || user.car_details.platno
    };

    await user.save();
    res.render('g2', {
      title: 'G2 License',
      user: {
        ...user._doc,
        licenseNo: user.getDecryptedLicenseNo() // Decrypt licenseNo for display
      },
      message: 'User information updated successfully!'
    });
  } catch (err) {
    console.error(err);
    const user = await User.findById(req.session.user._id); // Re-fetch user for consistency
    res.render('g2', {
      title: 'G2 License',
      user: user ? { ...user._doc, licenseNo: user.getDecryptedLicenseNo() } : null,
      message: 'Error updating user information: ' + err.message
    });
  }
};