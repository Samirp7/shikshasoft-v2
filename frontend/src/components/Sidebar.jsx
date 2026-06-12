import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, BookOpen, CalendarCheck,
  DollarSign, ClipboardList, Bell, Settings, LogOut, GraduationCap
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'MAIN' },
  { to: '/students', icon: Users, label: 'Students', section: 'ACADEMICS' },
  { to: '/classes', icon: BookOpen, label: 'Classes & Subjects', section: 'ACADEMICS' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance', section: 'ACADEMICS' },
  { to: '/results', icon: ClipboardList, label: 'Results', section: 'ACADEMICS' },
  { to: '/fees', icon: DollarSign, label: 'Fee Management', section: 'FINANCE' },
  { to: '/notices', icon: Bell, label: 'Notices', section: 'COMMUNICATION' },
  { to: '/settings', icon: Settings, label: 'Settings', section: 'SYSTEM' },
];

const sections = [...new Set(navItems.map(n => n.section))];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={18} color="#fff" />
          </div>
          <div>
            <div className="logo-text">ShikshaSoft</div>
            <div className="logo-sub">{user?.school_name || 'School Management'}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {navItems.filter(n => n.section === section).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill" onClick={handleLogout}>
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div className="user-role">{user?.role} · Sign out</div>
          </div>
          <LogOut size={14} color="var(--gray-400)" />
        </div>
      </div>
    </aside>
  );
}
