import { useMemo } from 'react'
import { useGetSalesAnalyticsQuery } from '../services/api'

const CHART_COLORS = ['#000080', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#fb7185']

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
      return `${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${end}%`
    })
    .join(', ')
}

function SalesStatsPanel({ styles }) {
  const {
    data,
    error,
    isLoading,
    isFetching,
  } = useGetSalesAnalyticsQuery()

  const stats = useMemo(() => {
    const totals = data?.totals || {}
    return {
      totalAssigned: totals.total_assigned || 0,
      totalSold: totals.total_sold || 0,
      totalReturned: totals.total_returned || 0,
      activeAssigned: totals.active_assigned || 0,
      pendingAcceptance: totals.pending_acceptance || 0,
      totalAmount: totals.total_amount || 0,
      returnsRate: totals.returns_rate || 0,
      topProducts: data?.top_products || [],
      bankMix: data?.bank_mix || [],
      salesMix: data?.sales_mix || [],
    }
  }, [data])

  const maxProductValue = Math.max(...stats.topProducts.map((item) => item.sold), 1)
  const maxBankValue = Math.max(...stats.bankMix.map((item) => item.amount), 1)
  const salesMixGradient = buildConicGradient(stats.salesMix)

  if (isLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} ${styles.dashboardHeader}`}>
        <p className='text-sm text-slate-400'>Loading sales analytics...</p>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error?.data?.detail ||
      (typeof error?.data === 'string' ? error.data : '') ||
      (error?.status
        ? `Request failed with status ${error.status}.`
        : 'Failed to load sales analytics.')

    return (
      <div className={`mt-8 ${styles.panelWrap} ${styles.dashboardHeader}`}>
        <p className='text-sm text-rose-500'>{errorMessage}</p>
      </div>
    )
  }

  return (
    <div className={`mt-8 ${styles.panelWrap} from-emerald-500/10 to-cyan-500/15`}>
      <div className={styles.actionInner}>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-xl font-semibold'>Sales Analytics</h2>
            <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
              Track what you sold, what remains assigned, and deposit activity.
            </p>
          </div>
          {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
        </div>

        <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6'>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Assigned</p>
            <p className='mt-2 text-2xl font-semibold'>{stats.totalAssigned}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Sold</p>
            <p className='mt-2 text-2xl font-semibold'>{stats.totalSold}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Active Assigned</p>
            <p className='mt-2 text-2xl font-semibold'>{stats.activeAssigned}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Returned</p>
            <p className='mt-2 text-2xl font-semibold'>{stats.totalReturned}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Pending Acceptance</p>
            <p className='mt-2 text-2xl font-semibold'>{stats.pendingAcceptance}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Deposited Amount</p>
            <p className='mt-2 text-2xl font-semibold'>{stats.totalAmount}</p>
            <p className='text-xs text-slate-400'>Return rate: {stats.returnsRate}%</p>
          </div>
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-3'>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Sales Mix</p>
            <div className='mt-4 flex flex-wrap items-center gap-4'>
              <div
                className='h-28 w-28 rounded-full'
                style={{ background: `conic-gradient(${salesMixGradient})` }}
              />
              <div className='space-y-2 text-sm'>
                {stats.salesMix.map((segment, index) => (
                  <div key={segment.label} className='flex items-center gap-2'>
                    <span
                      className='h-3 w-3 rounded-full'
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className='text-slate-200'>{segment.label}</span>
                    <span className='text-slate-400'>{segment.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>Top Products Sold</p>
            {stats.topProducts.length === 0 ? (
              <p className='mt-3 text-sm text-slate-400'>No sales yet.</p>
            ) : (
              <div className='mt-3 space-y-3'>
                {stats.topProducts.map((item, index) => (
                  <div key={item.name}>
                    <div className='flex items-center justify-between text-xs text-slate-300'>
                      <span>{item.name}</span>
                      <span>{item.sold}</span>
                    </div>
                    <div className='mt-1 h-2 rounded-full bg-slate-800/70'>
                      <div
                        className='h-2 rounded-full'
                        style={{
                          width: `${(item.sold / maxProductValue) * 100}%`,
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>Deposits by Bank</p>
            {stats.bankMix.length === 0 ? (
              <p className='mt-3 text-sm text-slate-400'>No deposits yet.</p>
            ) : (
              <div className='mt-3 space-y-3'>
                {stats.bankMix.map((item, index) => (
                  <div key={item.label}>
                    <div className='flex items-center justify-between text-xs text-slate-300'>
                      <span>{item.label}</span>
                      <span>
                        {item.count} deposits • {item.amount}
                      </span>
                    </div>
                    <div className='mt-1 h-2 rounded-full bg-slate-800/70'>
                      <div
                        className='h-2 rounded-full'
                        style={{
                          width: `${(item.amount / maxBankValue) * 100}%`,
                          backgroundColor: CHARnpm run devT_COLORS[(index + 3) % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className='mt-3 text-xs text-slate-400'>Total deposited: {stats.totalAmount}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesStatsPanel
