import { useState, useEffect } from 'react';
import { BookOpen, Plus, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Classes() {
  const [tab, setTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classModal, setClassModal] = useState(false);
  const [subjectModal, setSubjectModal] = useState(false);
  const [classForm, setClassForm] = useState({ name: '', section: 'A', academic_year: '2081-82' });
  const [subjectForm, setSubjectForm] = useState({ class_id: '', name: '', full_marks: 100, pass_marks: 40 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [cRes, sRes] = await Promise.all([api.get('/classes'), api.get('/subjects')]);
    setClasses(cRes.data.data);
    setSubjects(sRes.data.data);
  };

  useEffect(() => { load(); }, []);

  const handleClass = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/classes', classForm);
      toast.success('Class created.');
      setClassModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error.'); }
    setSaving(false);
  };

  const handleSubject = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/subjects', subjectForm);
      toast.success('Subject added.');
      setSubjectModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error.'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Classes & Subjects</h1><p>Manage academic structure</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setSubjectModal(true)}><Plus size={15} /> Add Subject</button>
          <button className="btn btn-primary" onClick={() => setClassModal(true)}><Plus size={15} /> New Class</button>
        </div>
      </div>

      <div className="tabs">
        {['classes', 'subjects'].map(t => (
          <div key={t} className={`tab-item${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'classes' ? 'Classes' : 'Subjects'}
          </div>
        ))}
      </div>

      {tab === 'classes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {classes.length > 0 ? classes.map(c => (
            <div key={c.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={20} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>{c.name} — {c.section}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{c.academic_year}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <span className="badge badge-primary">{c.student_count} students</span>
                    {c.teacher_name && <span className="badge badge-gray">{c.teacher_name}</span>}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="empty-state card" style={{ gridColumn: '1/-1' }}>
              <BookOpen size={40} /><h3>No classes yet</h3><p>Create your first class.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'subjects' && (
        <div className="card" style={{ padding: 0 }}>
          {subjects.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Subject</th><th>Class</th><th>Full Marks</th><th>Pass Marks</th></tr></thead>
                <tbody>
                  {subjects.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td><span className="badge badge-primary">{s.class_name}</span></td>
                      <td>{s.full_marks}</td>
                      <td>{s.pass_marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state"><BookOpen size={40} /><h3>No subjects yet</h3><p>Add subjects for each class.</p></div>
          )}
        </div>
      )}

      {classModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setClassModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Create New Class</div>
              <button className="btn-icon" onClick={() => setClassModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleClass}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Class Name *</label>
                    <input className="form-input" required value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} placeholder="e.g. Class 10" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <input className="form-input" value={classForm.section} onChange={e => setClassForm({ ...classForm, section: e.target.value })} placeholder="A" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Year</label>
                  <input className="form-input" value={classForm.academic_year} onChange={e => setClassForm({ ...classForm, academic_year: e.target.value })} placeholder="2081-82" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setClassModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Class'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {subjectModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSubjectModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add Subject</div>
              <button className="btn-icon" onClick={() => setSubjectModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubject}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Class *</label>
                  <select className="form-select" required value={subjectForm.class_id} onChange={e => setSubjectForm({ ...subjectForm, class_id: e.target.value })}>
                    <option value="">Select class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject Name *</label>
                  <input className="form-input" required value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="e.g. Mathematics" />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Marks</label>
                    <input type="number" className="form-input" value={subjectForm.full_marks} onChange={e => setSubjectForm({ ...subjectForm, full_marks: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pass Marks</label>
                    <input type="number" className="form-input" value={subjectForm.pass_marks} onChange={e => setSubjectForm({ ...subjectForm, pass_marks: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSubjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add Subject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
