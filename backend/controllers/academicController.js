const db = require('../config/db');

// ---- CLASSES ----
exports.getClasses = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT c.*, u.name as teacher_name, COUNT(s.id) as student_count FROM classes c LEFT JOIN users u ON c.class_teacher_id = u.id LEFT JOIN students s ON s.class_id = c.id AND s.is_active = 1 WHERE c.school_id = ? GROUP BY c.id ORDER BY c.name',
      [req.user.school_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createClass = async (req, res) => {
  const { name, section, class_teacher_id, academic_year } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO classes (school_id, name, section, class_teacher_id, academic_year) VALUES (?,?,?,?,?)',
      [req.user.school_id, name, section || 'A', class_teacher_id, academic_year]
    );
    res.status(201).json({ success: true, message: 'Class created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- SUBJECTS ----
exports.getSubjects = async (req, res) => {
  try {
    const { class_id } = req.query;
    let query = 'SELECT sub.*, c.name as class_name FROM subjects sub JOIN classes c ON sub.class_id = c.id WHERE sub.school_id = ?';
    const params = [req.user.school_id];
    if (class_id) { query += ' AND sub.class_id = ?'; params.push(class_id); }
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSubject = async (req, res) => {
  const { class_id, name, full_marks, pass_marks } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO subjects (school_id, class_id, name, full_marks, pass_marks) VALUES (?,?,?,?,?)',
      [req.user.school_id, class_id, name, full_marks || 100, pass_marks || 40]
    );
    res.status(201).json({ success: true, message: 'Subject created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- EXAMS ----
exports.getExams = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM exams WHERE school_id = ? ORDER BY start_date DESC',
      [req.user.school_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createExam = async (req, res) => {
  const { class_id, name, exam_type, start_date, end_date, academic_year } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO exams (school_id, class_id, name, exam_type, start_date, end_date, academic_year) VALUES (?,?,?,?,?,?,?)',
      [req.user.school_id, class_id, name, exam_type, start_date, end_date, academic_year]
    );
    res.status(201).json({ success: true, message: 'Exam created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- RESULTS ----
const gradeFromMarks = (obtained, full) => {
  const pct = (obtained / full) * 100;
  if (pct >= 90) return { grade: 'A+', point: 4.0 };
  if (pct >= 80) return { grade: 'A', point: 3.6 };
  if (pct >= 70) return { grade: 'B+', point: 3.2 };
  if (pct >= 60) return { grade: 'B', point: 2.8 };
  if (pct >= 50) return { grade: 'C+', point: 2.4 };
  if (pct >= 40) return { grade: 'C', point: 2.0 };
  if (pct >= 35) return { grade: 'D', point: 1.6 };
  return { grade: 'NG', point: 0 };
};

exports.saveResults = async (req, res) => {
  const { results } = req.body;
  // results = [{ student_id, exam_id, subject_id, marks_obtained, full_marks }]
  try {
    for (const r of results) {
      const { grade, point } = gradeFromMarks(r.marks_obtained, r.full_marks || 100);
      await db.query(
        'INSERT INTO results (school_id, student_id, exam_id, subject_id, marks_obtained, full_marks, grade, grade_point) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE marks_obtained=VALUES(marks_obtained), grade=VALUES(grade), grade_point=VALUES(grade_point)',
        [req.user.school_id, r.student_id, r.exam_id, r.subject_id, r.marks_obtained, r.full_marks || 100, grade, point]
      );
    }
    res.json({ success: true, message: `${results.length} results saved.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getResults = async (req, res) => {
  const { exam_id, student_id, class_id } = req.query;
  try {
    let query = `
      SELECT r.*, s.name as student_name, s.roll_number, sub.name as subject_name, e.name as exam_name, c.name as class_name
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN subjects sub ON r.subject_id = sub.id
      JOIN exams e ON r.exam_id = e.id
      JOIN classes c ON s.class_id = c.id
      WHERE r.school_id = ?`;
    const params = [req.user.school_id];
    if (exam_id) { query += ' AND r.exam_id = ?'; params.push(exam_id); }
    if (student_id) { query += ' AND r.student_id = ?'; params.push(student_id); }
    if (class_id) { query += ' AND s.class_id = ?'; params.push(class_id); }
    query += ' ORDER BY s.roll_number, sub.name';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReportCard = async (req, res) => {
  const { student_id, exam_id } = req.params;
  try {
    const [student] = await db.query(
      'SELECT s.*, c.name as class_name, c.section FROM students s JOIN classes c ON s.class_id = c.id WHERE s.id = ?',
      [student_id]
    );
    const [results] = await db.query(
      'SELECT r.*, sub.name as subject_name FROM results r JOIN subjects sub ON r.subject_id = sub.id WHERE r.student_id = ? AND r.exam_id = ? ORDER BY sub.name',
      [student_id, exam_id]
    );
    const [exam] = await db.query('SELECT * FROM exams WHERE id = ?', [exam_id]);
    const totalMarks = results.reduce((s, r) => s + parseFloat(r.marks_obtained), 0);
    const totalFull = results.reduce((s, r) => s + parseFloat(r.full_marks), 0);
    const gpa = results.length ? (results.reduce((s, r) => s + parseFloat(r.grade_point), 0) / results.length).toFixed(2) : 0;
    res.json({
      success: true,
      student: student[0],
      exam: exam[0],
      results,
      summary: { totalMarks, totalFull, percentage: ((totalMarks / totalFull) * 100).toFixed(1), gpa }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Dashboard summary
exports.getDashboardStats = async (req, res) => {
  try {
    const sid = req.user.school_id;
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [[students]] = await db.query('SELECT COUNT(*) as c FROM students WHERE school_id=? AND is_active=1', [sid]);
    const [[fees]] = await db.query('SELECT COALESCE(SUM(amount_paid),0) as c FROM fee_payments WHERE school_id=? AND month_year=?', [sid, currentMonth]);
    const [[present]] = await db.query("SELECT COUNT(*) as c FROM attendance WHERE school_id=? AND date=? AND status='present'", [sid, today]);
    const [[absent]] = await db.query("SELECT COUNT(*) as c FROM attendance WHERE school_id=? AND date=? AND status='absent'", [sid, today]);
    const [[classes]] = await db.query('SELECT COUNT(*) as c FROM classes WHERE school_id=?', [sid]);
    const [recentStudents] = await db.query(
      'SELECT s.name, c.name as class_name, s.created_at FROM students s JOIN classes c ON s.class_id=c.id WHERE s.school_id=? ORDER BY s.created_at DESC LIMIT 5',
      [sid]
    );
    res.json({
      success: true,
      stats: {
        totalStudents: students.c,
        feesThisMonth: fees.c,
        presentToday: present.c,
        absentToday: absent.c,
        totalClasses: classes.c
      },
      recentStudents
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
