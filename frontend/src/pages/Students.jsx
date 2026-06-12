import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, User, Phone, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const empty = { class_id: '', roll_number: '', name: '', date_of_birth: '', gender: '', address: '', guardian_name: '', guardian_phone: '', guardian_email: '' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([api.get('/students'), api.get('/classes')]);
      setStudents(sRes.data.data);
      setClasses(cRes.data.data);
    } catch { toast.error('Failed to load data.'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = students.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.roll_number?.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClass || s.class_id == filterClass;
    return matchSearch && matchClass;
  });

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit = (s) => { setForm({ ...s }); setEditing(s.id); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); setForm(empty); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/students/${editing}`, form);
        toast.success('Student updated.');
      } else {
        await api.post('/students', form);
        toast.success('Student added.');
      }
      closeModal(); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving student.');
    }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove ${name}?`)) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student removed.');
      load();
    } catch { toast.error('Failed to remove.'); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Students</h1>
          <p>{students.length} total students enrolled</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Student</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-input" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} />
          <input className="form-input" placeholder="Search by name or roll number..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
        </select>
      </div>

      {loading ? <div className="loading"><div className="spinner"/></div> : (
        <div className="card" style={{ padding: 0 }}>
          {filtered.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Roll</th><th>Student Name</th><th>Class</th><th>Gender</th>
                    <th>Guardian</th><th>Contact</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td><span className="badge badge-gray">{s.roll_number || '—'}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                            {s.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{s.name}</div>
                            {s.guardian_email && <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{s.guardian_email}</div>}
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-primary">{s.class_name} {s.section}</span></td>
                      <td><span className={`badge ${s.gender === 'male' ? 'badge-primary' : s.gender === 'female' ? 'badge-purple' : 'badge-gray'}`}>{s.gender || '—'}</span></td>
                      <td>{s.guardian_name || '—'}</td>
                      <td>
                        {s.guardian_phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--gray-500)' }}>
                            <Phone size={11} />{s.guardian_phone}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-icon" onClick={() => openEdit(s)} title="Edit"><Edit2 size={13} /></button>
                          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(s.id, s.name)} title="Remove"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <User size={40} />
              <h3>{search || filterClass ? 'No students found' : 'No students yet'}</h3>
              <p>{search || filterClass ? 'Try adjusting your filters.' : 'Add your first student to get started.'}</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Student' : 'Add New Student'}</div>
              <button className="btn-icon" onClick={closeModal}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Student full name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Roll Number</label>
                    <input className="form-input" value={form.roll_number} onChange={e => setForm({ ...form, roll_number: e.target.value })} placeholder="e.g. 01" />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Class *</label>
                    <select className="form-select" required value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })}>
                      <option value="">Select class</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-input" value={form.date_of_birth?.slice(0,10) || ''} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input className="form-input" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="e.g. Kathmandu" />
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '12px 0 8px' }}>Guardian Information</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Guardian Name</label>
                    <input className="form-input" value={form.guardian_name || ''} onChange={e => setForm({ ...form, guardian_name: e.target.value })} placeholder="Parent/Guardian name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Guardian Phone</label>
                    <input className="form-input" value={form.guardian_phone || ''} onChange={e => setForm({ ...form, guardian_phone: e.target.value })} placeholder="98XXXXXXXX" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Guardian Email</label>
                  <input type="email" className="form-input" value={form.guardian_email || ''} onChange={e => setForm({ ...form, guardian_email: e.target.value })} placeholder="guardian@email.com" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Student' : 'Add Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
