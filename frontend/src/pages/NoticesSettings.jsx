import { useState } from 'react';
import { Bell, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function Notices() {
  const [notices, setNotices] = useState([
    { id: 1, title: 'School reopens after Dashain', content: 'School will reopen on Kartik 1st. All students must attend.', target_audience: 'all', published_at: new Date().toISOString() },
    { id: 2, title: 'Fee submission deadline', content: 'Last date for fee submission is end of this month. Late fee will be charged after that.', target_audience: 'students', published_at: new Date().toISOString() },
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', target_audience: 'all' });

  const handleAdd = (e) => {
    e.preventDefault();
    setNotices(prev => [{ id: Date.now(), ...form, published_at: new Date().toISOString() }, ...prev]);
    toast.success('Notice published.');
    setModal(false);
    setForm({ title: '', content: '', target_audience: 'all' });
  };

  const audienceColor = { all: 'badge-primary', students: 'badge-success', teachers: 'badge-purple', parents: 'badge-warning' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Notices</h1><p>School announcements and circulars</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Publish Notice</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notices.map(n => (
          <div key={n.id} className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bell size={18} color="var(--warning)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>{n.title}</div>
                  <span className={`badge ${audienceColor[n.target_audience] || 'badge-gray'}`}>{n.target_audience}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6 }}>{n.content}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 8 }}>{new Date(n.published_at).toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Publish New Notice</div>
              <button className="btn-icon" onClick={() => setModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Notice title" />
                </div>
                <div className="form-group">
                  <label className="form-label">Content *</label>
                  <textarea className="form-input" required rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Notice details..." style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select className="form-select" value={form.target_audience} onChange={e => setForm({ ...form, target_audience: e.target.value })}>
                    <option value="all">Everyone</option>
                    <option value="students">Students</option>
                    <option value="teachers">Teachers</option>
                    <option value="parents">Parents</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function Settings() {
  const [form, setForm] = useState({ school_name: 'Demo School Kathmandu', address: 'Bagbazar, Kathmandu', phone: '01-4XXXXXX', email: 'admin@school.edu.np', academic_year: '2081-82' });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    toast.success('Settings saved.');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Settings</h1><p>School information and configuration</p></div>
      </div>

      <div style={{ maxWidth: 600 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">School Information</div></div>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">School Name</label>
              <input className="form-input" value={form.school_name} onChange={e => setForm({ ...form, school_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Current Academic Year</label>
              <input className="form-input" value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} placeholder="2081-82" />
            </div>
            <button type="submit" className="btn btn-primary">{saved ? '✓ Saved' : 'Save Settings'}</button>
          </form>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header"><div className="card-title">Subscription</div></div>
          <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', gap: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-900)' }}>Standard Plan</div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>Up to 500 students · All features</div>
              <div style={{ marginTop: 8 }}><span className="badge badge-success">Trial — 28 days remaining</span></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Plus Jakarta Sans' }}>NPR 2,500<span style={{ fontSize: 13, fontWeight: 400 }}>/mo</span></div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>Upgrade Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
