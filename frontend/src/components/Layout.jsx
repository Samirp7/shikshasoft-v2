import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your school' },
  '/students': { title: 'Students', subtitle: 'Manage student records' },
  '/classes': { title: 'Classes & Subjects', subtitle: 'Manage classes and curriculum' },
  '/attendance': { title: 'Attendance', subtitle: 'Daily attendance tracking' },
  '/results': { title: 'Results', subtitle: 'Exams and marksheets' },
  '/fees': { title: 'Fee Management', subtitle: 'Track collections and dues' },
  '/notices': { title: 'Notices', subtitle: 'School announcements' },
  '/settings': { title: 'Settings', subtitle: 'School configuration' },
};

export default function Layout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const page = pageTitles[location.pathname] || { title: 'ShikshaSoft', subtitle: '' };
  const today = new Date().toLocaleDateString('en-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">{page.title}</div>
            <div className="topbar-subtitle">{page.subtitle}</div>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{today}</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
