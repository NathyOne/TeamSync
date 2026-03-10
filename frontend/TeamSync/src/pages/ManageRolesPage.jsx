import { ROLE_CONFIG } from '../config/appConfig'
import AdminShell from '../components/AdminShell'
import ManageRoles from '../components/ManageRoles'

function ManageRolesPage({ onLogout, onToggleTheme, styles, themeButtonLabel }) {
  const adminConfig = ROLE_CONFIG.admin

  if (!adminConfig) {
    return null
  }

  return (
    <AdminShell
      activeSection='manage-roles'
      eyebrow='TeamSync Dashboard'
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      styles={styles}
      subtitle='Organize staff by role and update access.'
      themeButtonLabel={themeButtonLabel}
      title='Manage Roles'
    >
      <div className='max-w-5xl'>
        <ManageRoles accentClass={adminConfig.panel} styles={styles} />
      </div>
    </AdminShell>
  )
}

export default ManageRolesPage
