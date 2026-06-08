import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/Layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import RegionDetail from '@/pages/RegionDetail'
import Alerts from '@/pages/Alerts'
import Forecast from '@/pages/Forecast'
import Reports from '@/pages/Reports'
import Login from '@/pages/Login'
import { useAppStore } from '@/store'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/:cityId" element={<RegionDetail />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="forecast" element={<Forecast />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  )
}
