import { useState, useEffect } from 'react';
import { CalendarCheck, Check, Save } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [tab, setTab] = useState('mark');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    Promise.all([
      api.get(`/students?class_id=${selectedClass}`),
      api.get(`/attendance?class_id=${selectedClass}&date=${date}`)
    ]).then(([sRes, aRes]) => {
      setStudents(sRes.data.data);
      const existing = {};
      aRes.data.data.forEach(a => { existing[a.student_id] = a.status; });
      const init = {};
      sRes.data.data.forEach(s => { init[s.id] = existing[s.id] || 'present'; });
      setAttendance(init);
    }).catch(() => toast.error('Failed to load.')).finally(() => setLoading(false));
  }, [selectedClass, date]);

  useEffect(() => {
    if (!selectedClass || tab !== 'summary') return;
    api.get(`/attendance/summary?class_id=${selectedClass}&month=${month}`)
      .then(r => setSummary(r.data.data)).catch(() => {});
  }, [selectedClass, month, tab]);

  const setStatus = (id, status) => setAttendance(prev => ({ ...prev, [id]: status }));

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s.id] = status; });
    setAttendance(updated);
  };

  const handleSave = async () => {
    if (!selectedClass) return toast.error('Select a class first.');
    setSaving(true);
    try {
      const records = students.map(s => ({ student_id: s.id, status: attendance[s.id] || 'present' }));
      await api.post('/attendance', { class_id: selectedClass, date, records });
      toast.success('Attendance saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    }
    setSaving(false);
  };

  const counts = students.reduce((acc, s) => {
    const st = attendance[s.id] || 'present';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Attendance</h1>
          <p>Mark and track daily student attendance</p>
        </div>
      </div>

      <div className="tabs">
        {['mark', 'summary'].map(t => (
          <div key={t} className={`tab-item${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'mark' ? 'Mark Attendance' : 'Monthly Summary'}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select className="form-select" style={{ width: 200 }} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          <option value="">Select Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
        </select>
        {tab === 'mark' ? (
          <input type="date" className="form-input" style={{ width: 180 }} value={date} onChange={e => setDate(e.target.value)} />
        ) : (
          <input type="month" className="form-input" style={{ width: 180 }} value={month} onChange={e => setMonth(e.target.value)} />
        )}
      </div>

      {tab === 'mark' && (
        <>
          {selectedClass && students.length > 0 && (
            <>
              {/* Summary bar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['present', 'var(--success)', 'P'], ['absent', 'var(--danger)', 'A'], ['late', 'var(--warning)', 'L']].map(([s, c, l]) => (
                    <div key={s} style={{ padding: '6px 12px', borderRadius: 8, background: c + '18', fontSize: 13, fontWeight: 500, color: c }}>
                      {l}: {counts[s] || 0}
                    </div>
                  ))}
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => markAll('present')}><Check size={13} /> All Present</button>
                  <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }} onClick={() => markAll('absent')}>All Absent</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={13} /> {saving ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </div>

              {/* Attendance grid */}
              <div className="attendance-grid">
                {students.map(s => (
                  <div key={s.id} className="attendance-item">
                    <div>
                      <div className="att-name">{s.name}</div>
                      <div className="att-roll">Roll: {s.roll_number || '—'}</div>
                    </div>
                    <div className="att-toggle">
                      {[['P', 'present'], ['A', 'absent'], ['L', 'late']].map(([label, status]) => (
                        <button
                          key={status}
                          className={`att-btn${attendance[s.id] === status ? ` active-${label}` : ''}`}
                          onClick={() => setStatus(s.id, status)}
                          title={status}
                        >{label}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!selectedClass && (
            <div className="empty-state">
              <CalendarCheck size={40} />
              <h3>Select a class</h3>
              <p>Choose a class to mark attendance.</p>
            </div>
          )}

          {selectedClass && !loading && students.length === 0 && (
            <div className="empty-state">
              <CalendarCheck size={40} />
              <h3>No students in this class</h3>
              <p>Add students first.</p>
            </div>
          )}

          {loading && <div className="loading"><div className="spinner" /></div>}
        </>
      )}

      {tab === 'summary' && (
        <div className="card" style={{ padding: 0 }}>
          {summary.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Student</th><th>Present</th><th>Absent</th><th>Late</th><th>Total Days</th><th>Attendance %</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {summary.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 500 }}>{s.present_days}</td>
                      <td style={{ color: 'var(--danger)', fontWeight: 500 }}>{s.absent_days}</td>
                      <td style={{ color: 'var(--warning)', fontWeight: 500 }}>{s.late_days}</td>
                      <td>{s.total_days}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--gray-100)', borderRadius: 3 }}>
                            <div style={{ height: '100%', width: `${s.attendance_pct || 0}%`, background: s.attendance_pct >= 75 ? 'var(--success)' : 'var(--danger)', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 500, minWidth: 36 }}>{s.attendance_pct || 0}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${s.attendance_pct >= 75 ? 'badge-success' : 'badge-danger'}`}>
                          {s.attendance_pct >= 75 ? 'Regular' : 'Low'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <CalendarCheck size={40} />
              <h3>No attendance data</h3>
              <p>{selectedClass ? 'No records for this month.' : 'Select a class to view summary.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
