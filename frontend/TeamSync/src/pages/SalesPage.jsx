import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROLE_CONFIG } from '../config/appConfig'
import SalesAssignments from '../components/SalesAssignments'
import SalesDepositsList from '../components/SalesDepositsList'
import SalesShell from '../components/SalesShell'
import SalesStatsPanel from '../components/SalesStatsPanel'

function SalesPage({ onLogout, onToggleTheme, styles, themeButtonLabel, userBadge }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const salesConfig = ROLE_CONFIG.sales
  const activeView = searchParams.get('view') || 'dashboard'

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  if (!salesConfig) {
    return null
  }

  const renderActiveView = () => {
    if (activeView === 'assignments') {
      return <SalesAssignments panelClass={salesConfig.panel} styles={styles} />
    }
    if (activeView === 'deposits') {
      return <SalesDepositsList styles={styles} />
    }
    return (
      <>
        <SalesStatsPanel styles={styles} />
      </>
    )
  }

  return (
    <SalesShell
      activeSection={activeView}
      eyebrow='Sales Management System Dashboard'
      onLogout={handleLogout}
      onToggleTheme={onToggleTheme}
      styles={styles}
      subtitle={salesConfig.headline}
      themeButtonLabel={themeButtonLabel}
      title={`${salesConfig.label} Portal`}
      userBadge={userBadge}
    >
      {renderActiveView()}
    </SalesShell>
  )
}

export default SalesPage
