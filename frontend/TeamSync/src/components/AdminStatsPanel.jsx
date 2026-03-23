import { useMemo } from 'react'
import { useGetAdminAnalyticsQuery } from '../services/api'

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

function AdminStatsPanel({ styles }) {
  const {
    data,
    error,
    isLoading,
    isFetching,
  } = useGetAdminAnalyticsQuery()

  const stats = useMemo(() => {
    const totals = data?.totals || {}
    return {
      totalSold: totals.total_sold || 0,
      totalReturned: totals.total_returned || 0,
      activeAssigned: totals.active_assigned || 0,
      totalAssigned: totals.total_assigned || 0,
      activeSalespeople: totals.active_salespeople || 0,
      lowStockCount: totals.low_stock_count || 0,
      totalProducts: totals.total_products || 0,
      totalDeposits: totals.total_deposits || 0,
      totalAmount: totals.total_amount || 0,
      returnsRate: totals.returns_rate || 0,
      topProducts: data?.top_products || [],
      topSalespeople: data?.top_salespeople || [],
      salesMix: data?.sales_mix || [],
      bankMix: data?.bank_mix || [],
      activityTrend: data?.activity_trend || [],
      recentAudits: data?.recent_audits || [],
    }
  }, [data])

  const maxProductValue = Math.max(...stats.topProducts.map((item) => item.sold), 1)
  const maxSalesValue = Math.max(...stats.topSalespeople.map((item) => item.sold), 1)
  const maxBankValue = Math.max(...stats.bankMix.map((item) => item.amount), 1)
  const maxTrendValue = Math.max(
    ...stats.activityTrend.map((item) => Math.max(item.assigned, item.returned)),
    1,
  )
  const salesMixGradient = buildConicGradient(stats.salesMix)

  const topSalesperson = stats.topSalespeople[0] || null
  const topProduct = stats.topProducts[0] || null

  if (isLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} from-cyan-500/15 to-blue-500/20`}>
        <div className={styles.actionInner}>
          <p className='text-sm text-slate-400'>Loading sales performance stats...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error?.data?.detail ||
      (typeof error?.data === 'string' ? error.data : '') ||
      (error?.status
        ? `Request failed with status ${error.status}.`
        : 'Failed to load admin stats.')

    return (
      <div className={`mt-8 ${styles.panelWrap} from-cyan-500/15 to-blue-500/20`}>
        <div className={styles.actionInner}>
          <p className='text-sm text-rose-500'>{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`mt-8 ${styles.panelWrap} from-cyan-500/15 to-blue-500/20`}>
      <div className={styles.actionInner}>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-xl font-semibold'>Sales Performance</h2>
            <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>Revenue, returns, and sales mix.</p>
          </div>
          {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
        </div>

        <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6'>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Sold</p>
            <p className='mt-2 text-2xl font-semibold'>{stats.totalSold}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Active Assigned</p>
            <p className='mt-2 text-2xl font-semibold'>{stats.activeAssigned}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Active Salespeople</p>
            <p className='mt-2 text-2xl font-semibold'>{stats.activeSalespeople}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Revenue</p>
            <p className='mt-2 text-2xl font-semibold'>{stats.totalAmount}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Return Rate</p>
            <p className='mt-2 text-2xl font-semibold'>{stats.returnsRate}%</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Low Stock Items</p>
            <p className='mt-2 text-2xl font-semibold'>{stats.lowStockCount}</p>
          </div>
        </div>

        <div className='mt-6 grid gap-3 md:grid-cols-2'>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Top Salesperson</p>
            <p className='mt-2 text-lg font-semibold'>
              {topSalesperson ? topSalesperson.name : 'No sales yet'}
            </p>
            {topSalesperson ? (
              <p className='text-sm text-slate-300'>Sold: {topSalesperson.sold}</p>
            ) : null}
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Top Product</p>
            <p className='mt-2 text-lg font-semibold'>
              {topProduct ? topProduct.name : 'No sales yet'}
            </p>
            {topProduct ? (
              <p className='text-sm text-slate-300'>Sold: {topProduct.sold}</p>
            ) : null}
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
            <p className={styles.statLabel}>Top Products</p>
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
                        {item.count} • {item.amount}
                      </span>
                    </div>
                    <div className='mt-1 h-2 rounded-full bg-slate-800/70'>
                      <div
                        className='h-2 rounded-full'
                        style={{
                          width: `${(item.amount / maxBankValue) * 100}%`,
                          backgroundColor: CHART_COLORS[(index + 2) % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='mt-6'>
          <div className='grid gap-4 lg:grid-cols-2'>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Sales by Person</p>
              {stats.topSalespeople.length === 0 ? (
                <p className='mt-3 text-sm text-slate-400'>No sales yet.</p>
              ) : (
                <div className='mt-3 space-y-3'>
                  {stats.topSalespeople.map((item, index) => (
                    <div key={item.name}>
                      <div className='flex items-center justify-between text-xs text-slate-300'>
                        <span>{item.name}</span>
                        <span>{item.sold}</span>
                      </div>
                      <div className='mt-1 h-2 rounded-full bg-slate-800/70'>
                        <div
                          className='h-2 rounded-full'
                          style={{
                            width: `${(item.sold / maxSalesValue) * 100}%`,
                            backgroundColor: CHART_COLORS[(index + 4) % CHART_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.statCard}>
              <p className={styles.statLabel}>Weekly Stock Activity</p>
              {stats.activityTrend.length === 0 ? (
                <p className='mt-3 text-sm text-slate-400'>No recent movements.</p>
              ) : (
                <div className='mt-3 space-y-3'>
                  {stats.activityTrend.map((row, index) => (
                    <div key={row.date}>
                      <div className='flex items-center justify-between text-xs text-slate-300'>
                        <span>{new Date(row.date).toLocaleDateString()}</span>
                        <span>
                          {row.assigned} assigned • {row.returned} returned
                        </span>
                      </div>
                      <div className='mt-1 flex h-2 gap-1 rounded-full bg-slate-800/70'>
                        <div
                          className='h-2 rounded-full bg-emerald-400'
                          style={{ width: `${(row.assigned / maxTrendValue) * 100}%` }}
                        />
                        <div
                          className='h-2 rounded-full bg-rose-400'
                          style={{ width: `${(row.returned / maxTrendValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='mt-6'>
          <h3 className='text-lg font-semibold'>Recent Activity</h3>
          {stats.recentAudits.length === 0 ? (
            <p className='mt-3 text-sm text-slate-400'>No audit events recorded yet.</p>
          ) : (
            <div className='mt-3 space-y-2'>
              {stats.recentAudits.map((event) => (
                <div
                  key={event.id}
                  className='flex flex-col gap-2 rounded-2xl border border-white/10 p-3 sm:flex-row sm:items-center sm:justify-between'
                >
                  <div>
                    <p className='text-xs text-slate-400'>{event.event_type.replaceAll('_', ' ')}</p>
                    <p className='text-sm font-semibold'>
                      {event.actor_email || 'System'} → {event.target_email || 'N/A'}
                    </p>
                    {event.product_name ? (
                      <p className='text-xs text-slate-400'>Product: {event.product_name}</p>
                    ) : null}
                  </div>
                  <div className='text-xs text-slate-400'>
                    {event.created_at ? new Date(event.created_at).toLocaleString() : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminStatsPanel
