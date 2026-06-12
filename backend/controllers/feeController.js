const db = require('../config/db');

// Fee Structure
exports.getFeeStructure = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT fs.*, c.name as class_name FROM fee_structure fs JOIN classes c ON fs.class_id = c.id WHERE fs.school_id = ? ORDER BY c.name',
      [req.user.school_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createFeeStructure = async (req, res) => {
  const { class_id, fee_type, amount, frequency, academic_year } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO fee_structure (school_id, class_id, fee_type, amount, frequency, academic_year) VALUES (?,?,?,?,?,?)',
      [req.user.school_id, class_id, fee_type, amount, frequency, academic_year]
    );
    res.status(201).json({ success: true, message: 'Fee structure created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Payments
exports.getPayments = async (req, res) => {
  try {
    const { student_id, month_year, class_id } = req.query;
    let query = `SELECT fp.*, s.name as student_name, s.roll_number, c.name as class_name, fs.fee_type
                 FROM fee_payments fp
                 JOIN students s ON fp.student_id = s.id
                 JOIN classes c ON s.class_id = c.id
                 JOIN fee_structure fs ON fp.fee_structure_id = fs.id
                 WHERE fp.school_id = ?`;
    const params = [req.user.school_id];
    if (student_id) { query += ' AND fp.student_id = ?'; params.push(student_id); }
    if (month_year) { query += ' AND fp.month_year = ?'; params.push(month_year); }
    if (class_id) { query += ' AND s.class_id = ?'; params.push(class_id); }
    query += ' ORDER BY fp.payment_date DESC';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.recordPayment = async (req, res) => {
  const { student_id, fee_structure_id, amount_paid, payment_method, month_year, remarks } = req.body;
  try {
    const receipt_number = 'SS-' + Date.now();
    const [result] = await db.query(
      'INSERT INTO fee_payments (school_id, student_id, fee_structure_id, amount_paid, payment_method, receipt_number, month_year, remarks, collected_by) VALUES (?,?,?,?,?,?,?,?,?)',
      [req.user.school_id, student_id, fee_structure_id, amount_paid, payment_method, receipt_number, month_year, remarks, req.user.id]
    );
    res.status(201).json({ success: true, message: 'Payment recorded.', receipt_number, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeeStats = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [thisMonth] = await db.query(
      'SELECT SUM(amount_paid) as total FROM fee_payments WHERE school_id = ? AND month_year = ?',
      [req.user.school_id, currentMonth]
    );
    const [totalCollection] = await db.query(
      'SELECT SUM(amount_paid) as total FROM fee_payments WHERE school_id = ?',
      [req.user.school_id]
    );
    const [byMethod] = await db.query(
      'SELECT payment_method, SUM(amount_paid) as total, COUNT(*) as count FROM fee_payments WHERE school_id = ? GROUP BY payment_method',
      [req.user.school_id]
    );
    const [recentPayments] = await db.query(
      `SELECT fp.*, s.name as student_name, c.name as class_name 
       FROM fee_payments fp JOIN students s ON fp.student_id = s.id JOIN classes c ON s.class_id = c.id
       WHERE fp.school_id = ? ORDER BY fp.created_at DESC LIMIT 10`,
      [req.user.school_id]
    );
    res.json({
      success: true,
      thisMonth: thisMonth[0].total || 0,
      totalCollection: totalCollection[0].total || 0,
      byMethod,
      recentPayments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentDues = async (req, res) => {
  try {
    const { class_id, month_year } = req.query;
    const month = month_year || new Date().toISOString().slice(0, 7);
    let query = `
      SELECT s.id, s.name, s.roll_number, c.name as class_name,
        COALESCE(SUM(fs.amount), 0) as total_due,
        COALESCE(SUM(fp.amount_paid), 0) as total_paid,
        COALESCE(SUM(fs.amount), 0) - COALESCE(SUM(fp.amount_paid), 0) as balance
      FROM students s
      JOIN classes c ON s.class_id = c.id
      JOIN fee_structure fs ON fs.class_id = s.class_id AND fs.school_id = s.school_id
      LEFT JOIN fee_payments fp ON fp.student_id = s.id AND fp.fee_structure_id = fs.id AND fp.month_year = ?
      WHERE s.school_id = ? AND s.is_active = 1`;
    const params = [month, req.user.school_id];
    if (class_id) { query += ' AND s.class_id = ?'; params.push(class_id); }
    query += ' GROUP BY s.id ORDER BY balance DESC';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
