import { useNavigate } from 'react-router-dom'
import { ROLE_CONFIG } from '../config/appConfig'

function MarketingPage({ onLogout, onToggleTheme, styles, themeButtonLabel }) {
  const navigate = useNavigate()
  const marketingConfig = ROLE_CONFIG.marketing

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  if (!marketingConfig) {
    return null
  }

  return (
    <div className={styles.dashboardPage}>
      <div className='mx-auto max-w-6xl'>
        <div
          className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${styles.dashboardHeader}`}
        >
          <div>
            <p className={`text-sm uppercase tracking-[0.28em] ${styles.eyebrow}`}>TeamSync Dashboard</p>
            <h1 className='mt-2 text-3xl font-bold'>{marketingConfig.label} Portal</h1>
            <p className={`mt-1 ${styles.dashboardSubtext}`}>{marketingConfig.headline}</p>
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

        <div className={`mt-8 ${styles.panelWrap} ${marketingConfig.panel}`}>
          <div className='grid gap-4 md:grid-cols-3'>
            {marketingConfig.stats.map((item) => (
              <div key={item.label} className={styles.statCard}>
                <p className={styles.statLabel}>{item.label}</p>
                <p className='mt-1 text-2xl font-bold'>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-8 rounded-2xl border border-slate-300/20 p-5'>
          <h2 className='text-xl font-semibold'>Marketing Workspace</h2>
          <p className={`mt-2 ${styles.dashboardSubtext}`}>
            Marketing-specific features will be added here next.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MarketingPage
