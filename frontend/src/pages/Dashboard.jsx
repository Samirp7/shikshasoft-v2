import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, DollarSign, CalendarCheck, BookOpen, TrendingUp, ArrowRight, UserX } from 'lucide-react';
import api from '../utils/api';

const COLORS = ['#1a56db', '#057a55', '#c27803', '#6c2bd9'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [feeStats, setFeeStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, feeRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/fees/stats')
        ]);
        setStats(dashRes.data);
        setFeeStats(feeRes.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="loading"><div className="spinner"/></div>;

  const s = stats?.stats || {};
  const attendancePct = s.presentToday + s.absentToday > 0
    ? Math.round((s.presentToday / (s.presentToday + s.absentToday)) * 100) : 0;

  const feeByMethod = feeStats?.byMethod?.map(m => ({
    name: m.payment_method.charAt(0).toUpperCase() + m.payment_method.slice(1),
    value: parseFloat(m.total)
  })) || [];

  const monthlyData = [
    { month: 'Jan', amount: 45000 }, { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 }, { month: 'Apr', amount: 61000 },
    { month: 'May', amount: 55000 }, { month: 'Jun', amount: parseFloat(feeStats?.thisMonth || 0) },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>
            <Users color="var(--primary)" size={20} />
          </div>
          <div>
            <div className="stat-value">{s.totalStudents || 0}</div>
            <div className="stat-label">Total Students</div>
            <div className="stat-change up"><TrendingUp size={11} style={{ display:'inline',marginRight:2 }} />Active enrollment</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)' }}>
            <DollarSign color="var(--success)" size={20} />
          </div>
          <div>
            <div className="stat-value">NPR {Number(feeStats?.thisMonth || 0).toLocaleString()}</div>
            <div className="stat-label">Fees This Month</div>
            <div className="stat-change up">Total: NPR {Number(feeStats?.totalCollection || 0).toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)' }}>
            <CalendarCheck color="var(--warning)" size={20} />
          </div>
          <div>
            <div className="stat-value">{attendancePct}%</div>
            <div className="stat-label">Today's Attendance</div>
            <div className="stat-change" style={{ color: 'var(--gray-400)' }}>{s.presentToday} present · {s.absentToday} absent</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--purple-light)' }}>
            <BookOpen color="var(--purple)" size={20} />
          </div>
          <div>
            <div className="stat-value">{s.totalClasses || 0}</div>
            <div className="stat-label">Total Classes</div>
            <div className="stat-change" style={{ color: 'var(--gray-400)' }}>Active this year</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Fee Collection Trend</div>
              <div className="card-subtitle">Monthly collection (NPR)</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [`NPR ${v.toLocaleString()}`, 'Amount']} contentStyle={{ border: 'none', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} />
              <Bar dataKey="amount" fill="var(--primary)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Payment Methods</div>
              <div className="card-subtitle">Distribution</div>
            </div>
          </div>
          {feeByMethod.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={feeByMethod} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {feeByMethod.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => [`NPR ${v.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {feeByMethod.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ color: 'var(--gray-600)' }}>{m.name}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 500 }}>NPR {m.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>No payment data yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent students + Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recently Added Students</div>
            </div>
            <Link to="/students" className="btn btn-outline btn-sm">View all <ArrowRight size={13} /></Link>
          </div>
          {stats?.recentStudents?.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Class</th><th>Added</th></tr></thead>
                <tbody>
                  {stats.recentStudents.map((s, i) => (
                    <tr key={i}>
                      <td><div style={{ fontWeight: 500 }}>{s.name}</div></td>
                      <td><span className="badge badge-primary">{s.class_name}</span></td>
                      <td style={{ color: 'var(--gray-400)' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <Users size={32} />
              <h3>No students yet</h3>
              <p>Add your first student to get started.</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: 16 }}>
            <div className="card-title" style={{ marginBottom: 12 }}>Quick Actions</div>
            {[
              { to: '/students', label: 'Add Student', icon: Users, color: 'var(--primary)' },
              { to: '/attendance', label: 'Mark Attendance', icon: CalendarCheck, color: 'var(--success)' },
              { to: '/fees', label: 'Record Fee', icon: DollarSign, color: 'var(--warning)' },
              { to: '/results', label: 'Enter Results', icon: BookOpen, color: 'var(--purple)' },
            ].map(a => (
              <Link key={a.to} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--gray-100)', textDecoration: 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: a.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <a.icon size={14} color={a.color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>{a.label}</span>
                <ArrowRight size={13} style={{ marginLeft: 'auto', color: 'var(--gray-300)' }} />
              </Link>
            ))}
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div className="card-title" style={{ marginBottom: 8 }}>Absent Today</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--danger)', fontFamily: 'Plus Jakarta Sans' }}>{s.absentToday || 0}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>students absent today</div>
            <Link to="/attendance" className="btn btn-outline btn-sm" style={{ marginTop: 10 }}>
              <UserX size={13} /> View details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
