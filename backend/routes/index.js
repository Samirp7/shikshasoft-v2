const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const authCtrl = require('../controllers/authController');
const studentCtrl = require('../controllers/studentController');
const feeCtrl = require('../controllers/feeController');
const attendanceCtrl = require('../controllers/attendanceController');
const academicCtrl = require('../controllers/academicController');

// Auth
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', auth, authCtrl.getMe);
router.post('/auth/users', auth, adminOnly, authCtrl.createUser);

// Dashboard
router.get('/dashboard', auth, academicCtrl.getDashboardStats);

// Students
router.get('/students', auth, studentCtrl.getAll);
router.get('/students/stats', auth, studentCtrl.getStats);
router.get('/students/:id', auth, studentCtrl.getOne);
router.post('/students', auth, studentCtrl.create);
router.put('/students/:id', auth, studentCtrl.update);
router.delete('/students/:id', auth, adminOnly, studentCtrl.remove);

// Classes
router.get('/classes', auth, academicCtrl.getClasses);
router.post('/classes', auth, adminOnly, academicCtrl.createClass);

// Subjects
router.get('/subjects', auth, academicCtrl.getSubjects);
router.post('/subjects', auth, adminOnly, academicCtrl.createSubject);

// Fees
router.get('/fees/structure', auth, feeCtrl.getFeeStructure);
router.post('/fees/structure', auth, adminOnly, feeCtrl.createFeeStructure);
router.get('/fees/payments', auth, feeCtrl.getPayments);
router.post('/fees/payments', auth, feeCtrl.recordPayment);
router.get('/fees/stats', auth, feeCtrl.getFeeStats);
router.get('/fees/dues', auth, feeCtrl.getStudentDues);

// Attendance
router.post('/attendance', auth, attendanceCtrl.markAttendance);
router.get('/attendance', auth, attendanceCtrl.getAttendance);
router.get('/attendance/summary', auth, attendanceCtrl.getAttendanceSummary);
router.get('/attendance/today', auth, attendanceCtrl.getTodayStats);

// Exams & Results
router.get('/exams', auth, academicCtrl.getExams);
router.post('/exams', auth, adminOnly, academicCtrl.createExam);
router.post('/results', auth, academicCtrl.saveResults);
router.get('/results', auth, academicCtrl.getResults);
router.get('/results/reportcard/:student_id/:exam_id', auth, academicCtrl.getReportCard);

module.exports = router;
