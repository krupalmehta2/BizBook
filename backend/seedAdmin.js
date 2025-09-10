const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await Admin.create({
    email: 'admin@bizbook.com',
    password: hashedPassword
  });
  console.log('✅ Admin created: admin@bizbook.com / admin123');
  mongoose.disconnect();
});
