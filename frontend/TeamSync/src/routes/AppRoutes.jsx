import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  ACCESS_TOKEN_KEY,
  BACKEND_ROLE_TO_APP_ROLE,
  JWT_LOGIN_URL,
  REFRESH_TOKEN_KEY,
  ROLE_CONFIG,
  SESSION_KEY,
  THEME_CLASSES,
  THEME_KEY,
} from '../config/appConfig'
import AdminPage from '../pages/AdminPage'
import LoginPage from '../pages/LoginPage'
import MarketingPage from '../pages/MarketingPage'
import SalesPage from '../pages/SalesPage'
import SupportPage from '../pages/SupportPage'
import ManageRolesPage from '../pages/ManageRolesPage'
import AddProduct from '../components/AddProduct'
import AssignStock from '../components/AssignStock'

function LoginRoute({ activeRole, onLogin, onToggleTheme, styles, themeButtonLabel }) {
  if (activeRole && ROLE_CONFIG[activeRole]) {
    return <Navigate to={ROLE_CONFIG[activeRole].path} replace />
  }

  return (
    <LoginPage
      onLogin={onLogin}
      onToggleTheme={onToggleTheme}
      styles={styles}
      themeButtonLabel={themeButtonLabel}
    />
  )
}

function ProtectedRoleRoute({ activeRole, requiredRole, children }) {
  if (activeRole !== requiredRole) {
    return <Navigate to='/login' replace />
  }

  return children
}

function CatchAllRoute({ activeRole }) {
  if (activeRole && ROLE_CONFIG[activeRole]) {
    return <Navigate to={ROLE_CONFIG[activeRole].path} replace />
  }

  return <Navigate to='/login' replace />
}

function AppRoutes() {
  const [activeRole, setActiveRole] = useState(() => {
    const savedRole = window.sessionStorage.getItem(SESSION_KEY) || ''
    return ROLE_CONFIG[savedRole] ? savedRole : ''
  })

  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY)
    return savedTheme === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    if (activeRole) {
      window.sessionStorage.setItem(SESSION_KEY, activeRole)
      return
    }

    window.sessionStorage.removeItem(SESSION_KEY)
  }, [activeRole])

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const handleLogin = async ({ email, password }) => {
    try {
      const response = await fetch(JWT_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message =
          data?.detail || data?.non_field_errors?.[0] || 'Login failed. Check your credentials.'
        return { ok: false, error: message }
      }

      const backendRole = String(data?.role || '').toUpperCase()
      const mappedRole = BACKEND_ROLE_TO_APP_ROLE[backendRole]

      if (!mappedRole || !ROLE_CONFIG[mappedRole]) {
        return { ok: false, error: `Unsupported role returned by server: ${data?.role || 'unknown'}` }
      }

      window.sessionStorage.setItem(ACCESS_TOKEN_KEY, data.access || '')
      window.sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refresh || '')
      setActiveRole(mappedRole)

      return { ok: true }
    } catch {
      return { ok: false, error: 'Unable to reach backend. Check if server is running.' }
    }
  }

  const handleLogout = () => {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    setActiveRole('')
  }

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const sharedPageProps = {
    onLogout: handleLogout,
    onToggleTheme: toggleTheme,
    styles: THEME_CLASSES[theme],
    themeButtonLabel: theme === 'dark' ? 'Day Mode' : 'Night Mode',
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/login' replace />} />
        
        <Route
          path='/login'
          element={
            <LoginRoute
              activeRole={activeRole}
              onLogin={handleLogin}
              onToggleTheme={sharedPageProps.onToggleTheme}
              styles={sharedPageProps.styles}
              themeButtonLabel={sharedPageProps.themeButtonLabel}
            />
          }
        />
        <Route
          path='/addproduct'
          element={
            <ProtectedRoleRoute activeRole={activeRole} requiredRole='admin'>
              <AddProduct {...sharedPageProps} />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path='/assign-stock'
          element={
            <ProtectedRoleRoute activeRole={activeRole} requiredRole='admin'>
              <AssignStock {...sharedPageProps} />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path='/manage-roles'
          element={
            <ProtectedRoleRoute activeRole={activeRole} requiredRole='admin'>
              <ManageRolesPage {...sharedPageProps} />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path='/admin'
          element={
            <ProtectedRoleRoute activeRole={activeRole} requiredRole='admin'>
              <AdminPage {...sharedPageProps} />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path='/sales'
          element={
            <ProtectedRoleRoute activeRole={activeRole} requiredRole='sales'>
              <SalesPage {...sharedPageProps} />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path='/support'
          element={
            <ProtectedRoleRoute activeRole={activeRole} requiredRole='support'>
              <SupportPage {...sharedPageProps} />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path='/marketing'
          element={
            <ProtectedRoleRoute activeRole={activeRole} requiredRole='marketing'>
              <MarketingPage {...sharedPageProps} />
            </ProtectedRoleRoute>
          }
        />
        <Route path='*' element={<CatchAllRoute activeRole={activeRole} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
