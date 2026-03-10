import { useNavigate } from 'react-router-dom'
import { ROLE_CONFIG } from '../config/appConfig'
import ProductList from './ProductList'
import SalesAssignmentSummary from './SalesAssignmentSummary'
import SalesAssignmentList from './SalesAssignmentList'
import ReturnNotifications from './ReturnNotifications'

function AdminDashboard({ onLogout, onToggleTheme, styles, themeButtonLabel }) {
  const navigate = useNavigate()
  const adminConfig = ROLE_CONFIG.admin

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  const handleAddProduct = () => {
    navigate('/addproduct')
  }
  const handleAssignStock = () => {
    navigate('/assign-stock')
  }
  const handleManageRoles = () => {
    navigate('/manage-roles')
  }

  if (!adminConfig) {
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
            <h1 className='mt-2 text-3xl font-bold'>{adminConfig.label} Portal</h1>
            <p className={`mt-1 ${styles.dashboardSubtext}`}>{adminConfig.headline}</p>
          </div>

          <div className='flex flex-wrap gap-2'>
            <button className={styles.utilityButton} onClick={handleAddProduct} type='button'>
              Add Product
            </button>
            <button className={styles.utilityButton} onClick={handleAssignStock} type='button'>
              Assign Stock
            </button>
            <button className={styles.utilityButton} onClick={handleManageRoles} type='button'>
              Manage Roles
            </button>
            <button className={styles.utilityButton} onClick={onToggleTheme} type='button'>
              {themeButtonLabel}
            </button>
            <button className={styles.utilityButton} onClick={handleLogout} type='button'>
              Logout
            </button>
          </div>
        </div>

        <div className={`mt-8 ${styles.panelWrap} ${adminConfig.panel}`}>
          <ProductList className={styles.actionInner} title='Product Catalog' variant='embedded' />
        </div>

        <div className='mt-8'>
          <SalesAssignmentSummary styles={styles} />
        </div>

        <div className='mt-8'>
          <SalesAssignmentList styles={styles} />
        </div>

        <div className='mt-8'>
          <ReturnNotifications styles={styles} />
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard
