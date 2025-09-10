const mongoose = require('mongoose');
require('dotenv').config();

const Business = require('./models/Business');
const Booking = require('./models/Booking');

// replace with your Mongo URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bizbook';

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('MongoDB connected');

  // clear previous data
  await Business.deleteMany();
  await Booking.deleteMany();

  // create 5 businesses
  const businesses = await Business.insertMany([
    { name: 'Coffee Corner', description: 'Cozy coffee shop', category: 'Food', address: '123 Main St', contact: '123-456-7890', type: 'table' },
    { name: 'Hair & Care', description: 'Professional salon', category: 'Beauty', address: '456 Oak St', contact: '987-654-3210', type: 'appointment' },
    { name: 'Tech Fixers', description: 'Gadget repairs', category: 'Services', address: '789 Pine St', contact: '555-555-5555', type: 'order' },
    { name: 'Book Haven', description: 'Independent bookstore', category: 'Retail', address: '321 Maple St', contact: '222-333-4444', type: 'order' },
    { name: 'Yoga Bliss', description: 'Yoga studio', category: 'Fitness', address: '654 Spruce St', contact: '777-888-9999', type: 'appointment' },
  ]);
  console.log('Inserted businesses:', businesses.length);

  // create 5 random bookings
  const bookings = [];
  for (let i = 0; i < 5; i++) {
    const randomBiz = businesses[Math.floor(Math.random() * businesses.length)];
    bookings.push({
      userId: new mongoose.Types.ObjectId(), // random user
      businessId: randomBiz._id,
      type: randomBiz.type,
      date: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000), // random past date
      note: `Sample booking #${i + 1}`
    });
  }

  await Booking.insertMany(bookings);
  console.log('Inserted bookings:', bookings.length);

  mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
