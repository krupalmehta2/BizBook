const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    type: { type: String, enum: ['order', 'table', 'appointment'], required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // only for order
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }, // only for appointment
    tableCount: { type: Number }, // only for table bookings
    bookingDate: { type: Date }, // for table/appointment
    bookingTime: { type: String }, // HH:mm or datetime-local for frontend
    deliveryAddress: { type: String }, // for orders
    deliveryContact: { type: String }, // for orders
    note: { type: String },
    status: { type: String, enum: ['pending', 'done', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
