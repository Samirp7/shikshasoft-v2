import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Save, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Results() {
  const [tab, setTab] = useState('entry');
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [marks, setMarks] = useState({});
  const [selClass, setSelClass] = useState('');
  const [selExam, setSelExam] = useState('');
  const [saving, setSaving] = useState(false);
  const [examModal, setExamModal] = useState(false);
  const [examForm, setExamForm] = useState({ name: '', exam_type: 'terminal', start_date: '', end_date: '', academic_year: '2081-82', class_id: '' });

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data.data));
    api.get('/exams').then(r => setExams(r.data.data));
  }, []);

  useEffect(() => {
    if (!selClass) return;
    Promise.all([
      api.get(`/students?class_id=${selClass}`),
      api.get(`/subjects?class_id=${selClass}`)
    ]).then(([sRes, subRes]) => {
      setStudents(sRes.data.data);
      setSubjects(subRes.data.data);
    });
  }, [selClass]);

  useEffect(() => {
    if (!selExam || !selClass) return;
    api.get(`/results?exam_id=${selExam}&class_id=${selClass}`).then(r => {
      const m = {};
      r.data.data.forEach(res => {
        if (!m[res.student_id]) m[res.student_id] = {};
        m[res.student_id][res.subject_id] = res.marks_obtained;
      });
      setMarks(m);
    });
  }, [selExam, selClass]);

  const handleSave = async () => {
    if (!selExam || !selClass) return toast.error('Select class and exam.');
    setSaving(true);
    try {
      const records = [];
      students.forEach(s => {
        subjects.forEach(sub => {
          const val = marks[s.id]?.[sub.id];
          if (val !== undefined && val !== '') {
            records.push({ student_id: s.id, exam_id: selExam, subject_id: sub.id, marks_obtained: parseFloat(val), full_marks: sub.full_marks });
          }
        });
      });
      await api.post('/results', { results: records });
      toast.success(`${records.length} results saved.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving results.');
    }
    setSaving(false);
  };

  const handleExamCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams', { ...examForm, class_id: selClass || examForm.class_id });
      toast.success('Exam created.');
      setExamModal(false);
      api.get('/exams').then(r => setExams(r.data.data));
    } catch (err) { toast.error(err.response?.data?.message || 'Error.'); }
  };

  const setMark = (studentId, subjectId, value) => {
    setMarks(prev => ({ ...prev, [studentId]: { ...prev[studentId], [studentId]: value, [subjectId]: value } }));
    setMarks(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) updated[studentId] = {};
      updated[studentId][subjectId] = value;
      return updated;
    });
  };

  const gradeColor = (marks, full) => {
    if (!marks || !full) return 'var(--gray-300)';
    const pct = (marks / full) * 100;
    if (pct >= 80) return 'var(--success)';
    if (pct >= 60) return 'var(--primary)';
    if (pct >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Results</h1><p>Manage exams and student marksheets</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setExamModal(true)}><Plus size={15} /> New Exam</button>
          {tab === 'entry' && <button className="btn btn-primary" onClick={handleSave} disabled={saving}><Save size={15} />{saving ? 'Saving...' : 'Save Marks'}</button>}
        </div>
      </div>

      <div className="tabs">
        {['entry', 'view'].map(t => (
          <div key={t} className={`tab-item${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'entry' ? 'Mark Entry' : 'View Results'}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select className="form-select" style={{ width: 200 }} value={selClass} onChange={e => setSelClass(e.target.value)}>
          <option value="">Select Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
        </select>
        <select className="form-select" style={{ width: 220 }} value={selExam} onChange={e => setSelExam(e.target.value)}>
          <option value="">Select Exam</option>
          {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.exam_type})</option>)}
        </select>
      </div>

      {tab === 'entry' && selClass && selExam && students.length > 0 && subjects.length > 0 ? (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: 160 }}>Student</th>
                {subjects.map(sub => (
                  <th key={sub.id} style={{ minWidth: 120, textAlign: 'center' }}>
                    {sub.name}<br />
                    <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--gray-400)' }}>/ {sub.full_marks}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Roll: {s.roll_number || '—'}</div>
                  </td>
                  {subjects.map(sub => {
                    const val = marks[s.id]?.[sub.id] ?? '';
                    return (
                      <td key={sub.id} style={{ textAlign: 'center' }}>
                        <input
                          type="number" min="0" max={sub.full_marks}
                          style={{ width: 70, padding: '5px 8px', borderRadius: 6, border: `1.5px solid ${val !== '' ? gradeColor(val, sub.full_marks) : 'var(--gray-200)'}`, textAlign: 'center', fontSize: 13, fontWeight: 500, outline: 'none' }}
                          value={val}
                          onChange={e => setMark(s.id, sub.id, e.target.value)}
                          placeholder="—"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'entry' && (
        <div className="empty-state card">
          <ClipboardList size={40} />
          <h3>Select class and exam</h3>
          <p>Choose a class and exam to enter marks. Make sure subjects are added for the class.</p>
        </div>
      )}

      {tab === 'view' && (
        <div className="card" style={{ padding: 0 }}>
          {students.length > 0 && selExam ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Exam</th><th>Subject</th><th>Marks</th><th>Grade</th><th>GPA</th></tr></thead>
                <tbody>
                  {students.map(s => {
                    const sMarks = Object.entries(marks[s.id] || {});
                    if (!sMarks.length) return null;
                    return subjects.map((sub, i) => {
                      const m = marks[s.id]?.[sub.id];
                      if (!m && m !== 0) return null;
                      const pct = (m / sub.full_marks) * 100;
                      const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C+' : pct >= 40 ? 'C' : 'NG';
                      const gp = pct >= 90 ? 4.0 : pct >= 80 ? 3.6 : pct >= 70 ? 3.2 : pct >= 60 ? 2.8 : pct >= 50 ? 2.4 : pct >= 40 ? 2.0 : 0;
                      return (
                        <tr key={`${s.id}-${sub.id}`}>
                          {i === 0 ? <td rowSpan={subjects.length} style={{ fontWeight: 500, verticalAlign: 'top', paddingTop: 14 }}>{s.name}</td> : null}
                          <td><span className="badge badge-purple">{exams.find(e => e.id == selExam)?.name}</span></td>
                          <td>{sub.name}</td>
                          <td style={{ fontWeight: 600 }}>{m} / {sub.full_marks}</td>
                          <td><span className={`badge ${pct >= 40 ? 'badge-success' : 'badge-danger'}`}>{grade}</span></td>
                          <td>{gp.toFixed(1)}</td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state"><ClipboardList size={40} /><h3>Select class and exam</h3><p>Choose filters to view results.</p></div>
          )}
        </div>
      )}

      {examModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setExamModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Create New Exam</div>
              <button className="btn-icon" onClick={() => setExamModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleExamCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Exam Name *</label>
                  <input className="form-input" required value={examForm.name} onChange={e => setExamForm({ ...examForm, name: e.target.value })} placeholder="e.g. First Terminal 2081" />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Exam Type</label>
                    <select className="form-select" value={examForm.exam_type} onChange={e => setExamForm({ ...examForm, exam_type: e.target.value })}>
                      <option value="terminal">Terminal</option>
                      <option value="half_yearly">Half Yearly</option>
                      <option value="final">Final</option>
                      <option value="unit_test">Unit Test</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Academic Year</label>
                    <input className="form-input" value={examForm.academic_year} onChange={e => setExamForm({ ...examForm, academic_year: e.target.value })} placeholder="2081-82" />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-input" value={examForm.start_date} onChange={e => setExamForm({ ...examForm, start_date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-input" value={examForm.end_date} onChange={e => setExamForm({ ...examForm, end_date: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setExamModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
