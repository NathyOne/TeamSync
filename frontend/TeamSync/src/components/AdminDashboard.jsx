import { useSearchParams } from 'react-router-dom'
import { ROLE_CONFIG } from '../config/appConfig'
import AdminShell from './AdminShell'
import AdminStatsPanel from './AdminStatsPanel'
import ProductList from './ProductList'
import SalesAssignmentSummary from './SalesAssignmentSummary'
import SalesAssignmentList from './SalesAssignmentList'
import SalesDepositsPanel from './SalesDepositsPanel'
import StockMovementsPanel from './StockMovementsPanel'
import LowStockAlerts from './LowStockAlerts'
import ReturnNotifications from './ReturnNotifications'

function AdminDashboard({ onLogout, onToggleTheme, styles, themeButtonLabel }) {
  const [searchParams] = useSearchParams()
  const adminConfig = ROLE_CONFIG.admin
  const activeView = searchParams.get('view') || 'dashboard'

  const renderActiveView = () => {
    if (activeView === 'catalog') {
      return (
        <div className={`${styles.panelWrap} ${adminConfig.panel}`}>
          <ProductList className={styles.actionInner} title='Product Catalog' variant='embedded' />
        </div>
      )
    }
    if (activeView === 'low-stock') {
      return <LowStockAlerts styles={styles} />
    }
    if (activeView === 'assignments') {
      return (
        <>
          <SalesAssignmentSummary styles={styles} />
          <div className='mt-8'>
            <SalesAssignmentList styles={styles} />
          </div>
        </>
      )
    }
    if (activeView === 'deposits') {
      return <SalesDepositsPanel styles={styles} />
    }
    if (activeView === 'audit') {
      return <StockMovementsPanel styles={styles} />
    }
    if (activeView === 'returns') {
      return <ReturnNotifications styles={styles} />
    }
    return <AdminStatsPanel styles={styles} />
  }

  if (!adminConfig) {
    return null
  }

  return (
    <AdminShell
      activeSection={activeView}
      eyebrow='TeamSync Dashboard'
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      styles={styles}
      subtitle={adminConfig.headline}
      themeButtonLabel={themeButtonLabel}
      title={`${adminConfig.label} Portal`}
    >
      {renderActiveView()}
    </AdminShell>
  )
}

export default AdminDashboard
