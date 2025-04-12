/*
 * File: appointment.js
 * Author: Gunpreet Singh
 * Student ID: 9022194
 * Purpose: Defines the Appointment Mongoose schema and model for managing time slots.
 */
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  isTimeSlotAvailable: { type: Boolean, default: true }
}, { timestamps: true });

appointmentSchema.index({ date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);