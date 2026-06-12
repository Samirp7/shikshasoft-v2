const db = require('../config/db');

exports.markAttendance = async (req, res) => {
  const { class_id, date, records } = req.body;
  // records = [{ student_id, status, remarks }]
  try {
    const values = records.map(r => [req.user.school_id, r.student_id, class_id, date, r.status, r.remarks || null, req.user.id]);
    await db.query(
      'INSERT INTO attendance (school_id, student_id, class_id, date, status, remarks, marked_by) VALUES ? ON DUPLICATE KEY UPDATE status=VALUES(status), remarks=VALUES(remarks)',
      [values]
    );
    res.json({ success: true, message: `Attendance marked for ${records.length} students.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  const { class_id, date, student_id, month } = req.query;
  try {
    let query = `SELECT a.*, s.name as student_name, s.roll_number 
                 FROM attendance a JOIN students s ON a.student_id = s.id 
                 WHERE a.school_id = ?`;
    const params = [req.user.school_id];
    if (class_id) { query += ' AND a.class_id = ?'; params.push(class_id); }
    if (date) { query += ' AND a.date = ?'; params.push(date); }
    if (student_id) { query += ' AND a.student_id = ?'; params.push(student_id); }
    if (month) { query += ' AND DATE_FORMAT(a.date, "%Y-%m") = ?'; params.push(month); }
    query += ' ORDER BY a.date DESC, s.roll_number';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  const { class_id, month } = req.query;
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  try {
    let query = `
      SELECT s.id, s.name, s.roll_number,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
        COUNT(a.id) as total_days,
        ROUND(COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0), 1) as attendance_pct
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id AND DATE_FORMAT(a.date, '%Y-%m') = ?
      WHERE s.school_id = ? AND s.is_active = 1`;
    const params = [targetMonth, req.user.school_id];
    if (class_id) { query += ' AND s.class_id = ?'; params.push(class_id); }
    query += ' GROUP BY s.id ORDER BY attendance_pct ASC';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows, month: targetMonth });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTodayStats = async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const [stats] = await db.query(
      `SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(*) as total
       FROM attendance WHERE school_id = ? AND date = ?`,
      [req.user.school_id, today]
    );
    res.json({ success: true, data: stats[0], date: today });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
