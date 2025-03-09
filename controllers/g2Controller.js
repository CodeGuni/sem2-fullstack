const User = require('../models/user');

exports.getG2 = async (req, res) => {
  const user = await User.findById(req.session.user._id);
  res.render('g2', { 
    title: 'G2 License',
    message: null,
    user
  });
};

exports.postG2 = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    user.firstname = req.body.firstName;
    user.lastname = req.body.lastName;
    user.licenseNo = req.body.licenseNumber;
    user.age = req.body.age;
    user.dob = req.body.dob;
    user.car_details = {
      make: req.body.carMake || 'default',
      model: req.body.carModel || 'default',
      year: req.body.carYear || 0,
      platno: req.body.platNumber || 'default'
    };
    await user.save();
    res.render('g2', { 
      title: 'G2 License',
      message: 'User information updated successfully!',
      user
    });
  } catch (err) {
    const user = await User.findById(req.session.user._id);
    res.render('g2', { 
      title: 'G2 License',
      message: 'Error updating user information: ' + err.message,
      user
    });
  }
};