const mongoose = require('mongoose');

const tableBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  tableCount: { type: Number, required: true },
  bookingDate: { type: Date, required: true },
  bookingTime: { type: String, required: true }, // e.g. "7:30 PM"
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('TableBooking', tableBookingSchema);
