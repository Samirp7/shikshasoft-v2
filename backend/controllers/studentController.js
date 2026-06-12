const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { class_id, search } = req.query;
    let query = `SELECT s.*, c.name as class_name, c.section 
                 FROM students s JOIN classes c ON s.class_id = c.id 
                 WHERE s.school_id = ? AND s.is_active = 1`;
    const params = [req.user.school_id];
    if (class_id) { query += ' AND s.class_id = ?'; params.push(class_id); }
    if (search) { query += ' AND (s.name LIKE ? OR s.roll_number LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY c.name, s.roll_number';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT s.*, c.name as class_name, c.section FROM students s JOIN classes c ON s.class_id = c.id WHERE s.id = ? AND s.school_id = ?',
      [req.params.id, req.user.school_id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  const { class_id, roll_number, name, date_of_birth, gender, address, guardian_name, guardian_phone, guardian_email } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO students (school_id, class_id, roll_number, name, date_of_birth, gender, address, guardian_name, guardian_phone, guardian_email) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [req.user.school_id, class_id, roll_number, name, date_of_birth, gender, address, guardian_name, guardian_phone, guardian_email]
    );
    res.status(201).json({ success: true, message: 'Student added.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  const { class_id, roll_number, name, date_of_birth, gender, address, guardian_name, guardian_phone, guardian_email } = req.body;
  try {
    await db.query(
      'UPDATE students SET class_id=?, roll_number=?, name=?, date_of_birth=?, gender=?, address=?, guardian_name=?, guardian_phone=?, guardian_email=? WHERE id=? AND school_id=?',
      [class_id, roll_number, name, date_of_birth, gender, address, guardian_name, guardian_phone, guardian_email, req.params.id, req.user.school_id]
    );
    res.json({ success: true, message: 'Student updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('UPDATE students SET is_active = 0 WHERE id = ? AND school_id = ?', [req.params.id, req.user.school_id]);
    res.json({ success: true, message: 'Student removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total] = await db.query('SELECT COUNT(*) as count FROM students WHERE school_id = ? AND is_active = 1', [req.user.school_id]);
    const [byClass] = await db.query(
      'SELECT c.name as class_name, c.section, COUNT(s.id) as student_count FROM students s JOIN classes c ON s.class_id = c.id WHERE s.school_id = ? AND s.is_active = 1 GROUP BY c.id ORDER BY c.name',
      [req.user.school_id]
    );
    const [byGender] = await db.query(
      'SELECT gender, COUNT(*) as count FROM students WHERE school_id = ? AND is_active = 1 GROUP BY gender',
      [req.user.school_id]
    );
    res.json({ success: true, total: total[0].count, byClass, byGender });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
