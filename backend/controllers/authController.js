const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT u.*, s.name as school_name FROM users u JOIN schools s ON u.school_id = s.id WHERE u.email = ? AND u.is_active = 1',
      [email]
    );
    if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const token = jwt.sign(
      { id: user.id, school_id: user.school_id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, school_name: user.school_name, school_id: user.school_id }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT u.id, u.name, u.email, u.role, u.phone, s.name as school_name FROM users u JOIN schools s ON u.school_id = s.id WHERE u.id = ?',
      [req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (school_id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.school_id, name, email, hashed, role || 'teacher', phone]
    );
    res.status(201).json({ success: true, message: 'User created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.code === 'ER_DUP_ENTRY' ? 'Email already exists.' : 'Server error.' });
  }
};
