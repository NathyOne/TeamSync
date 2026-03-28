import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BadgePill from './BadgePill'

const SIDEBAR_STORAGE_KEY = 'sales-management-system-sales-sidebar'

function SalesShell({
  activeSection,
  children,
  eyebrow = 'Sales Management System Dashboard',
  onLogout,
  onToggleTheme,
  styles,
  subtitle,
  themeButtonLabel,
  title,
  userBadge,
}) {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'collapsed'
  })

  const navItems = useMemo(() => {
    const viewRoute = (view) => (view === 'dashboard' ? '/sales' : `/sales?view=${view}`)
    return [
      { label: 'Dashboard', icon: '📊', section: 'dashboard', href: viewRoute('dashboard') },
      { label: 'Assignments', icon: '📦', section: 'assignments', href: viewRoute('assignments') },
      { label: 'Sales History', icon: '💸', section: 'deposits', href: viewRoute('deposits') },
    ]
  }, [])

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? 'expanded' : 'collapsed')
      }
      return next
    })
  }

  return (
    <div className={styles.dashboardPage}>
      <div className='mx-auto w-full max-w-screen-2xl'>
        <div
          className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${styles.dashboardHeader}`}
        >
          <div>
            <p className={`text-sm uppercase tracking-[0.28em] ${styles.eyebrow}`}>{eyebrow}</p>
            <h1 className='mt-2 text-3xl font-bold'>{title}</h1>
            {subtitle ? <p className={`mt-1 ${styles.dashboardSubtext}`}>{subtitle}</p> : null}
            {userBadge ? (
              <div className='mt-3 flex flex-wrap items-center gap-2'>
                <span className={`text-xs uppercase tracking-[0.24em] ${styles.eyebrow}`}>Badge</span>
                <BadgePill badge={userBadge} />
              </div>
            ) : null}
          </div>

          <div className='flex flex-wrap gap-2'>
            <button className={styles.utilityButton} onClick={onToggleTheme} type='button'>
              {themeButtonLabel}
            </button>
            <button className={styles.utilityButton} onClick={onLogout} type='button'>
              Logout
            </button>
          </div>
        </div>

        <div className='mt-8 flex flex-col gap-6 lg:flex-row'>
          <aside
            className={`transition-all duration-200 ${isSidebarOpen ? 'w-full lg:w-64' : 'w-16'}`}
          >
            <div className={`h-full ${styles.dashboardHeader} ${isSidebarOpen ? 'p-6' : 'p-3'}`}>
              <button
                className={`${styles.utilityButton} flex items-center ${
                  isSidebarOpen ? 'w-full justify-start gap-3' : 'h-11 w-11 justify-center px-0'
                }`}
                onClick={handleToggleSidebar}
                type='button'
                title={isSidebarOpen ? 'Collapse menu' : 'Expand menu'}
              >
                <span className='text-lg'>{isSidebarOpen ? '⬅️' : '➡️'}</span>
                {isSidebarOpen ? <span className='text-sm'>Collapse Menu</span> : null}
              </button>

              {isSidebarOpen ? (
                <div className='mt-4'>
                  <p className={`text-xs uppercase tracking-[0.24em] ${styles.eyebrow}`}>Overview</p>
                  <h2 className='mt-2 text-lg font-semibold'>Sales Menu</h2>
                  <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
                    Track assignments, sales, and analytics.
                  </p>
                </div>
              ) : null}

              <div className={`mt-4 flex flex-col ${isSidebarOpen ? 'gap-2' : 'gap-3 items-center'}`}>
                {navItems.map((item) => {
                  const isActive = item.section === activeSection
                  return (
                    <button
                      key={item.label}
                      className={`${styles.utilityButton} flex items-center ${
                        isSidebarOpen
                          ? 'w-full justify-start gap-3'
                          : 'h-11 w-11 justify-center px-0'
                      } ${isActive ? 'border-cyan-400 bg-cyan-500/10' : ''}`}
                      onClick={() => navigate(item.href)}
                      type='button'
                      title={item.label}
                    >
                      <span className='text-lg'>{item.icon}</span>
                      {isSidebarOpen ? <span className='text-sm'>{item.label}</span> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          <div className='flex-1'>{children}</div>
        </div>
      </div>
    </div>
  )
}

export default SalesShell
