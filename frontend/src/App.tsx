import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/common/Layout';
import { ErrorDisplay } from './components/common/ErrorDisplay';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import PatientMaster from './components/masters/PatientMaster';
import HygienistMaster from './components/masters/HygienistMaster';
import { DailyVisitRecords } from './components/visits/DailyVisitRecords';
import { PatientReports } from './pages/PatientReports';
import './styles/responsive.css';

const App: React.FC = () => {
  return (
    <ErrorProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <Layout>
                  <PatientMaster />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hygienists"
            element={
              <ProtectedRoute>
                <Layout>
                  <HygienistMaster />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Layout>
                  <DailyVisitRecords />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <PatientReports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ErrorDisplay />
      </AuthProvider>
    </ErrorProvider>
  );
};

export default App;