const BusinessOwner = require('../models/BusinessOwner');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Owner
exports.registerOwner = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await BusinessOwner.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const owner = await BusinessOwner.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: 'Owner registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login Owner
exports.loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;
    const owner = await BusinessOwner.findOne({ email });
    if (!owner) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, owner.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ ownerId: owner._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, owner: { id: owner._id, name: owner.name, email: owner.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
