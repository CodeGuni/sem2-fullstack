const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901345678901234567890123';
const IV_LENGTH = 16;

const userSchema = new mongoose.Schema({
  firstname: { type: String, default: 'default', trim: true },
  lastname: { type: String, default: 'default', trim: true },
  licenseNo: { type: String, default: 'default', trim: true },
  age: { type: Number, default: 0 },
  dob: { type: Date },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['Driver', 'Examiner', 'Admin'], default: 'Driver' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  car_details: {
    make: { type: String, default: 'default', trim: true },
    model: { type: String, default: 'default', trim: true },
    year: { type: Number, default: 0 },
    platno: { type: String, default: 'default', trim: true } 
  },
  testType: { type: String, enum: ['G2', 'G'], default: null }, 
  comment: { type: String, default: '' }, 
  passFail: { type: Boolean, default: null } 
});

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified('licenseNo') && this.licenseNo !== 'default') {
    this.licenseNo = encrypt(this.licenseNo);
  }
  next();
});

userSchema.methods.getDecryptedLicenseNo = function() {
  if (this.licenseNo !== 'default') {
    return decrypt(this.licenseNo);
  }
  return this.licenseNo;
};

module.exports = mongoose.model('User', userSchema);