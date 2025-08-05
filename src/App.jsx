import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import ErrorBoundary from './components/Layout/ErrorBoundary'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Employees from './pages/Employees/Employees'
import EmployeeDetail from './pages/Employees/EmployeeDetail'
import CreateEmployee from './pages/Employees/CreateEmployee'
import Departments from './pages/Departments/Departments'
import Attendance from './pages/Attendance/Attendance'
import LeaveRequests from './pages/Leave/LeaveRequests'
import Payroll from './pages/Payroll/Payroll'
import Performance from './pages/Performance/Performance'
import Reports from './pages/Reports/Reports'
import Settings from './pages/Settings/Settings'
import Profile from './pages/Profile/Profile'
import LoadingSpinner from './components/UI/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route 
            path="/employees" 
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'HR', 'MANAGER']}>
                <Employees />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employees/create" 
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'HR']}>
                <CreateEmployee />
              </ProtectedRoute>
            } 
          />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route 
            path="/departments" 
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'HR', 'MANAGER']}>
                <Departments />
              </ProtectedRoute>
            } 
          />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<LeaveRequests />} />
          <Route 
            path="/payroll" 
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'HR', 'EMPLOYEE']}>
                <Payroll />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/performance" 
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']}>
                <Performance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'HR', 'MANAGER']}>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  )
}

export default App