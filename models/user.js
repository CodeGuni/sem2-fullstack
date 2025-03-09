const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // encryption library
const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    default: 'default', 
    trim: true
  },
  lastname: {
    type: String,
    default: 'default', 
    trim: true
  },
  licenseNo: {
    type: String,
    default: 'default', 
    trim: true
  },
  age: {
    type: Number,
    default: 0, 
   
  },
  dob: {
    type: Date
  },
  username: { 
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: { 
    type: String,
    required: true
  },
  userType: { // for signup
    type: String,
    enum: ['Driver', 'Examiner', 'Admin'],
    default: 'Driver'
  },
  car_details: {
    make: {
      type: String,
      default: 'default', 
      trim: true
    },
    model: {
      type: String,
      default: 'default',
      trim: true
    },
    year: {
      type: Number,
      default: 0,
      
    },
    platno: {
      type: String,
      default: 'default', 
      trim: true
    }
  }
});

// new change: Encrypt password and licenseNo before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified('licenseNo') && this.licenseNo !== 'default') {
    this.licenseNo = await bcrypt.hash(this.licenseNo, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);