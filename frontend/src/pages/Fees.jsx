import { useState, useEffect } from 'react';
import { Plus, DollarSign, X, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Fees() {
  const [tab, setTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [structure, setStructure] = useState([]);
  const [dues, setDues] = useState([]);
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(false);
  const [structModal, setStructModal] = useState(false);
  const [payForm, setPayForm] = useState({ student_id: '', fee_structure_id: '', amount_paid: '', payment_method: 'cash', month_year: new Date().toISOString().slice(0,7), remarks: '' });
  const [structForm, setStructForm] = useState({ class_id: '', fee_type: '', amount: '', frequency: 'monthly', academic_year: '2081-82' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, sRes, cRes, stRes, statsRes, duesRes] = await Promise.all([
        api.get('/fees/payments'),
        api.get('/fees/structure'),
        api.get('/classes'),
        api.get('/students'),
        api.get('/fees/stats'),
        api.get('/fees/dues'),
      ]);
      setPayments(pRes.data.data);
      setStructure(sRes.data.data);
      setClasses(cRes.data.data);
      setStudents(stRes.data.data);
      setStats(statsRes.data);
      setDues(duesRes.data.data);
    } catch { toast.error('Failed to load fee data.'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handlePayment = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await api.post('/fees/payments', payForm);
      toast.success(`Payment recorded! Receipt: ${res.data.receipt_number}`);
      setPayModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error recording payment.'); }
    setSaving(false);
  };

  const handleStructure = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/fees/structure', structForm);
      toast.success('Fee structure saved.');
      setStructModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving structure.'); }
    setSaving(false);
  };

  const feeForStudent = students.find(s => s.id == payForm.student_id);
  const structureForStudent = feeForStudent
    ? structure.filter(s => s.class_id == feeForStudent.class_id)
    : [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Fee Management</h1>
          <p>Track collections, dues, and payment records</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setStructModal(true)}><Plus size={15} /> Fee Structure</button>
          <button className="btn btn-primary" onClick={() => setPayModal(true)}><DollarSign size={15} /> Record Payment</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)' }}><DollarSign color="var(--success)" size={20} /></div>
          <div>
            <div className="stat-value">NPR {Number(stats?.thisMonth || 0).toLocaleString()}</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)' }}><TrendingUp color="var(--primary)" size={20} /></div>
          <div>
            <div className="stat-value">NPR {Number(stats?.totalCollection || 0).toLocaleString()}</div>
            <div className="stat-label">Total Collected</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-light)' }}><AlertCircle color="var(--danger)" size={20} /></div>
          <div>
            <div className="stat-value">{dues.filter(d => d.balance > 0).length}</div>
            <div className="stat-label">Students with Dues</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)' }}><DollarSign color="var(--warning)" size={20} /></div>
          <div>
            <div className="stat-value">{payments.length}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        {['payments','dues','structure'].map(t => (
          <div key={t} className={`tab-item${tab===t?' active':''}`} onClick={() => setTab(t)}>
            {t === 'payments' ? 'Payment History' : t === 'dues' ? 'Outstanding Dues' : 'Fee Structure'}
          </div>
        ))}
      </div>

      {loading ? <div className="loading"><div className="spinner"/></div> : (
        <>
          {tab === 'payments' && (
            <div className="card" style={{ padding: 0 }}>
              {payments.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Receipt</th><th>Student</th><th>Class</th><th>Fee Type</th><th>Amount</th><th>Method</th><th>Month</th><th>Date</th></tr></thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id}>
                          <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray-400)' }}>{p.receipt_number}</span></td>
                          <td><span style={{ fontWeight: 500 }}>{p.student_name}</span></td>
                          <td><span className="badge badge-primary">{p.class_name}</span></td>
                          <td>{p.fee_type}</td>
                          <td><span style={{ fontWeight: 600, color: 'var(--success)' }}>NPR {Number(p.amount_paid).toLocaleString()}</span></td>
                          <td><span className="badge badge-gray">{p.payment_method}</span></td>
                          <td>{p.month_year}</td>
                          <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>{new Date(p.payment_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state"><DollarSign size={40} /><h3>No payments yet</h3><p>Record your first fee payment.</p></div>
              )}
            </div>
          )}

          {tab === 'dues' && (
            <div className="card" style={{ padding: 0 }}>
              {dues.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Roll</th><th>Student</th><th>Class</th><th>Total Due</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
                    <tbody>
                      {dues.map(d => (
                        <tr key={d.id}>
                          <td><span className="badge badge-gray">{d.roll_number || '—'}</span></td>
                          <td style={{ fontWeight: 500 }}>{d.name}</td>
                          <td><span className="badge badge-primary">{d.class_name}</span></td>
                          <td>NPR {Number(d.total_due).toLocaleString()}</td>
                          <td style={{ color: 'var(--success)' }}>NPR {Number(d.total_paid).toLocaleString()}</td>
                          <td style={{ fontWeight: 600, color: d.balance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                            NPR {Number(d.balance).toLocaleString()}
                          </td>
                          <td>
                            <span className={`badge ${d.balance <= 0 ? 'badge-success' : d.balance < d.total_due ? 'badge-warning' : 'badge-danger'}`}>
                              {d.balance <= 0 ? 'Paid' : d.balance < d.total_due ? 'Partial' : 'Unpaid'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state"><AlertCircle size={40} /><h3>No dues found</h3><p>All students are up to date.</p></div>
              )}
            </div>
          )}

          {tab === 'structure' && (
            <div className="card" style={{ padding: 0 }}>
              {structure.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Class</th><th>Fee Type</th><th>Amount</th><th>Frequency</th><th>Year</th></tr></thead>
                    <tbody>
                      {structure.map(s => (
                        <tr key={s.id}>
                          <td><span className="badge badge-primary">{s.class_name}</span></td>
                          <td style={{ fontWeight: 500 }}>{s.fee_type}</td>
                          <td style={{ fontWeight: 600 }}>NPR {Number(s.amount).toLocaleString()}</td>
                          <td><span className="badge badge-purple">{s.frequency}</span></td>
                          <td>{s.academic_year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state"><DollarSign size={40} /><h3>No fee structure</h3><p>Add fee structure for each class.</p></div>
              )}
            </div>
          )}
        </>
      )}

      {/* Record Payment Modal */}
      {payModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPayModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Record Fee Payment</div>
              <button className="btn-icon" onClick={() => setPayModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handlePayment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Student *</label>
                  <select className="form-select" required value={payForm.student_id} onChange={e => setPayForm({ ...payForm, student_id: e.target.value, fee_structure_id: '' })}>
                    <option value="">Select student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} — {s.class_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fee Type *</label>
                  <select className="form-select" required value={payForm.fee_structure_id} onChange={e => {
                    const sel = structureForStudent.find(s => s.id == e.target.value);
                    setPayForm({ ...payForm, fee_structure_id: e.target.value, amount_paid: sel?.amount || '' });
                  }}>
                    <option value="">Select fee type</option>
                    {structureForStudent.map(s => <option key={s.id} value={s.id}>{s.fee_type} — NPR {s.amount}</option>)}
                  </select>
                  {payForm.student_id && structureForStudent.length === 0 && (
                    <div style={{ fontSize: 11, color: 'var(--warning)', marginTop: 4 }}>No fee structure for this student's class. Add one first.</div>
                  )}
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Amount Paid (NPR) *</label>
                    <input type="number" className="form-input" required value={payForm.amount_paid} onChange={e => setPayForm({ ...payForm, amount_paid: e.target.value })} placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" value={payForm.payment_method} onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })}>
                      <option value="cash">Cash</option>
                      <option value="esewa">eSewa</option>
                      <option value="khalti">Khalti</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Month/Year</label>
                    <input type="month" className="form-input" value={payForm.month_year} onChange={e => setPayForm({ ...payForm, month_year: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Remarks</label>
                    <input className="form-input" value={payForm.remarks} onChange={e => setPayForm({ ...payForm, remarks: e.target.value })} placeholder="Optional note" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setPayModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Recording...' : 'Record Payment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fee Structure Modal */}
      {structModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setStructModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add Fee Structure</div>
              <button className="btn-icon" onClick={() => setStructModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleStructure}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Class *</label>
                  <select className="form-select" required value={structForm.class_id} onChange={e => setStructForm({ ...structForm, class_id: e.target.value })}>
                    <option value="">Select class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Fee Type *</label>
                    <input className="form-input" required value={structForm.fee_type} onChange={e => setStructForm({ ...structForm, fee_type: e.target.value })} placeholder="e.g. Tuition Fee" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (NPR) *</label>
                    <input type="number" className="form-input" required value={structForm.amount} onChange={e => setStructForm({ ...structForm, amount: e.target.value })} placeholder="2000" />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <select className="form-select" value={structForm.frequency} onChange={e => setStructForm({ ...structForm, frequency: e.target.value })}>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                      <option value="once">One Time</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Academic Year</label>
                    <input className="form-input" value={structForm.academic_year} onChange={e => setStructForm({ ...structForm, academic_year: e.target.value })} placeholder="2081-82" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setStructModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Structure'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
