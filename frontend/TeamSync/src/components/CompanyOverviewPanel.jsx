import { useMemo } from 'react'
import { useGetCompanyOverviewQuery } from '../services/api'

const ROLE_LABELS = {
  ADMIN: 'Admin',
  SALES: 'Sales',
  MARKETING: 'Marketing',
  CUSTOMER_SUPPORT: 'Customer Support',
}

const ROLE_COLORS = ['#34d399', '#60a5fa', '#f472b6', '#fbbf24']

const buildConicGradient = (segments) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  if (total <= 0) {
    return '#334155 0% 100%'
  }

  let current = 0
  return segments
    .map((segment, index) => {
      const percent = (segment.value / total) * 100
      const start = current
      const end = current + percent
      current = end
      return `${ROLE_COLORS[index % ROLE_COLORS.length]} ${start}% ${end}%`
    })
    .join(', ')
}

function CompanyOverviewPanel({ styles, accentClass = '' }) {
  const { data, error, isLoading, isFetching } = useGetCompanyOverviewQuery()

  const overview = useMemo(() => {
    const totals = data?.totals || {}
    const roleCounts = data?.role_counts || []
    const roles = roleCounts.map((role, index) => ({
      label: ROLE_LABELS[role.role] || role.role,
      value: role.count,
      color: ROLE_COLORS[index % ROLE_COLORS.length],
    }))
    return {
      totals: {
        totalUsers: totals.total_users || 0,
        totalProducts: totals.total_products || 0,
        lowStock: totals.low_stock_count || 0,
        totalSold: totals.total_sold || 0,
        totalAmount: totals.total_amount || 0,
      },
      roles,
      recentActivity: data?.recent_activity || [],
    }
  }, [data])

  const roleGradient = buildConicGradient(overview.roles)

  if (isLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} ${accentClass}`}>
        <div className={styles.actionInner}>
          <p className='text-sm text-slate-400'>Loading company overview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error?.data?.detail ||
      (typeof error?.data === 'string' ? error.data : '') ||
      (error?.status ? `Request failed with status ${error.status}.` : 'Failed to load overview.')

    return (
      <div className={`mt-8 ${styles.panelWrap} ${accentClass}`}>
        <div className={styles.actionInner}>
          <p className='text-sm text-rose-500'>{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`mt-8 ${styles.panelWrap} ${accentClass}`}>
      <div className={styles.actionInner}>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-xl font-semibold'>Company Overview</h2>
            <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
              Live snapshot of team activity and inventory health.
            </p>
          </div>
          {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
        </div>

        <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Users</p>
            <p className='mt-2 text-2xl font-semibold'>{overview.totals.totalUsers}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Products</p>
            <p className='mt-2 text-2xl font-semibold'>{overview.totals.totalProducts}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Low Stock</p>
            <p className='mt-2 text-2xl font-semibold'>{overview.totals.lowStock}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Sold</p>
            <p className='mt-2 text-2xl font-semibold'>{overview.totals.totalSold}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Revenue</p>
            <p className='mt-2 text-2xl font-semibold'>{overview.totals.totalAmount}</p>
          </div>
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-2'>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Team Distribution</p>
            {overview.roles.length === 0 ? (
              <p className='mt-3 text-sm text-slate-400'>No team data yet.</p>
            ) : (
              <div className='mt-4 flex flex-wrap items-center gap-4'>
                <div
                  className='h-28 w-28 rounded-full'
                  style={{ background: `conic-gradient(${roleGradient})` }}
                />
                <div className='space-y-2 text-sm'>
                  {overview.roles.map((role) => (
                    <div key={role.label} className='flex items-center gap-2'>
                      <span className='h-3 w-3 rounded-full' style={{ backgroundColor: role.color }} />
                      <span className='text-slate-200'>{role.label}</span>
                      <span className='text-slate-400'>{role.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>Recent Activity</p>
            {overview.recentActivity.length === 0 ? (
              <p className='mt-3 text-sm text-slate-400'>No recent activity yet.</p>
            ) : (
              <div className='mt-3 space-y-2'>
                {overview.recentActivity.map((event) => (
                  <div key={event.id} className='rounded-xl border border-white/10 p-3'>
                    <p className='text-xs text-slate-400'>{event.event_type.replaceAll('_', ' ')}</p>
                    <p className='text-sm font-semibold'>
                      {event.actor_email || 'System'} → {event.target_email || 'N/A'}
                    </p>
                    {event.product_name ? (
                      <p className='text-xs text-slate-400'>Product: {event.product_name}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyOverviewPanel
