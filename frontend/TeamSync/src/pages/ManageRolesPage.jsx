import { useNavigate } from 'react-router-dom'
import { ROLE_CONFIG } from '../config/appConfig'
import ManageRoles from '../components/ManageRoles'

function ManageRolesPage({ onLogout, onToggleTheme, styles, themeButtonLabel }) {
  const navigate = useNavigate()
  const adminConfig = ROLE_CONFIG.admin

  const handleBackToDashboard = () => {
    navigate('/admin')
  }

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  if (!adminConfig) {
    return null
  }

  return (
    <div className={styles.dashboardPage}>
      <div className='mx-auto max-w-5xl'>
        <div
          className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${styles.dashboardHeader}`}
        >
          <div>
            <p className={`text-sm uppercase tracking-[0.28em] ${styles.eyebrow}`}>TeamSync Dashboard</p>
            <h1 className='mt-2 text-3xl font-bold'>Manage Roles</h1>
            <p className={`mt-1 ${styles.dashboardSubtext}`}>
              Organize staff by role and update access.
            </p>
          </div>

          <div className='flex flex-wrap gap-2'>
            <button className={styles.utilityButton} onClick={handleBackToDashboard} type='button'>
              Back to Admin
            </button>
            <button className={styles.utilityButton} onClick={onToggleTheme} type='button'>
              {themeButtonLabel}
            </button>
            <button className={styles.utilityButton} onClick={handleLogout} type='button'>
              Logout
            </button>
          </div>
        </div>

        <ManageRoles accentClass={adminConfig.panel} styles={styles} />
      </div>
    </div>
  )
}

export default ManageRolesPage
