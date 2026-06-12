import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Results from './pages/Results';
import Fees from './pages/Fees';
import { Notices, Settings } from './pages/NoticesSettings';
import './index.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/students" element={<PrivateRoute><Layout><Students /></Layout></PrivateRoute>} />
      <Route path="/classes" element={<PrivateRoute><Layout><Classes /></Layout></PrivateRoute>} />
      <Route path="/attendance" element={<PrivateRoute><Layout><Attendance /></Layout></PrivateRoute>} />
      <Route path="/results" element={<PrivateRoute><Layout><Results /></Layout></PrivateRoute>} />
      <Route path="/fees" element={<PrivateRoute><Layout><Fees /></Layout></PrivateRoute>} />
      <Route path="/notices" element={<PrivateRoute><Layout><Notices /></Layout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontSize: 13, borderRadius: 8 } }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
