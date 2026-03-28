import { useNavigate } from 'react-router-dom'
import { ROLE_CONFIG } from '../config/appConfig'

function RoleDashboard({ onLogout, onToggleTheme, role, styles, themeButtonLabel }) {
  const navigate = useNavigate()
  const currentRoleConfig = ROLE_CONFIG[role]

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  if (!currentRoleConfig) {
    return null
  }

  return (
    <div className={styles.dashboardPage}>
      <div className='mx-auto max-w-6xl'>
        <div
          className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${styles.dashboardHeader}`}
        >
          <div>
            <p className={`text-sm uppercase tracking-[0.28em] ${styles.eyebrow}`}>Sales Management System Dashboard</p>
            <h1 className='mt-2 text-3xl font-bold'>{currentRoleConfig.label} Portal</h1>
            <p className={`mt-1 ${styles.dashboardSubtext}`}>{currentRoleConfig.headline}</p>
          </div>

          <div className='flex flex-wrap gap-2'>
            <button className={styles.utilityButton} onClick={onToggleTheme} type='button'>
              {themeButtonLabel}
            </button>
            <button className={styles.utilityButton} onClick={handleLogout} type='button'>
              Logout
            </button>
          </div>
        </div>

        <div className={`mt-8 ${styles.panelWrap} ${currentRoleConfig.panel}`}>
          <div className='grid gap-4 md:grid-cols-3'>
            {currentRoleConfig.stats.map((item) => (
              <div key={item.label} className={styles.statCard}>
                <p className={styles.statLabel}>{item.label}</p>
                <p className='mt-1 text-2xl font-bold'>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-8 grid gap-4 md:grid-cols-3'>
          {currentRoleConfig.actions.map((action) => (
            <button
              key={action}
              className={`rounded-2xl bg-gradient-to-r ${currentRoleConfig.accent} p-[1px] text-left transition hover:scale-[1.01]`}
              type='button'
            >
              <div className={styles.actionInner}>
                <p className='font-medium'>{action}</p>
                <p className={styles.actionSubtext}>Dummy action card for {currentRoleConfig.label}.</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoleDashboard
