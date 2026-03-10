import { useEffect, useMemo, useState } from 'react'
import {
  DUMMY_CREDENTIALS,
  ROLE_CONFIG,
  SESSION_KEY,
  THEME_CLASSES,
  THEME_KEY,
} from '../config/appConfig'
import AppSessionContext from './appSessionContextValue'

export function AppSessionProvider({ children }) {
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

  const login = ({ role, username, password }) => {
    const expected = DUMMY_CREDENTIALS[role]

    if (!expected) {
      return false
    }

    const isValid = username === expected.username && password === expected.password

    if (isValid) {
      setActiveRole(role)
      return true
    }

    return false
  }

  const logout = () => {
    setActiveRole('')
  }

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const value = useMemo(
    () => ({
      activeRole,
      login,
      logout,
      styles: THEME_CLASSES[theme],
      theme,
      themeButtonLabel: theme === 'dark' ? 'Day Mode' : 'Night Mode',
      toggleTheme,
    }),
    [activeRole, theme],
  )

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>
}
