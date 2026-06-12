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
  const { user, loading } = useAuth();
  
  // 1. Wait for Supabase to finish checking before doing anything!
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }
  
  // 2. Once loading is done, evaluate if they are authenticated
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  // Wait for Supabase here too so the login route doesn't glitch jump
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/students" element={<PrivateRoute><Layout><Students /></Layout></PrivateRoute>} />
      <Route path="/classes" element={<PrivateRoute><Layout><Classes /></Layout></PrivateRoute>} />
      <Route path="/attendance" element={<PrivateRoute><Layout><Attendance /></Layout></PrivateRoute>} />
      <Route path="/results" element={<PrivateRoute><Layout><Results /></Layout></PrivateRoute>} />
      <Route path="/fees" element={<PrivateRoute><Layout><Fees /></Layout></PrivateRoute>} />
      <Route path="/notices" element={<PrivateRoute><Layout><Notices /></Layout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
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
