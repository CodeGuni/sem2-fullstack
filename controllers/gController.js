const User = require('../models/user');

exports.getG = async (req, res) => {
  const user = await User.findById(req.session.user._id);
  res.render('g', { 
    title: 'G License',
    user,
    message: null
  });
};

exports.updateG = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    user.car_details = {
      make: req.body.carMake || 'default',
      model: req.body.carModel || 'default',
      year: req.body.carYear || 0,
      platno: req.body.platNumber || 'default'
    };
    await user.save();
    res.render('g', { 
      title: 'G License',
      user,
      message: 'Car information updated successfully!'
    });
  } catch (err) {
    const user = await User.findById(req.session.user._id);
    res.render('g', { 
      title: 'G License',
      user,
      message: 'Error updating car information: ' + err.message
    });
  }
};