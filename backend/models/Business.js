const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  contact: { type: String },
  email: { type: String },
  website: { type: String },
  openingHours: { type: String }, // e.g., "Mon-Fri 9am-6pm"
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
  logoUrl: { type: String },

  // Business type: appointment, order, or table
  type: {
    type: String,
    enum: ['appointment', 'order', 'table'],
    default: 'appointment'
  },

  // For table booking capacity
  totalTables: {
    type: Number,
    default: 10, // default capacity
    min: 1
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessOwner'
  }
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);
