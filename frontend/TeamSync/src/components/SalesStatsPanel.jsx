import { useMemo } from 'react'
import { useGetMyAssignmentsQuery, useGetMyDepositsQuery } from '../services/api'

const CHART_COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#fb7185']

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
    data: assignmentsData,
    error: assignmentsError,
    isLoading: assignmentsLoading,
    isFetching: assignmentsFetching,
  } = useGetMyAssignmentsQuery()
  const { data: depositsData } = useGetMyDepositsQuery()

  const assignments = Array.isArray(assignmentsData)
    ? assignmentsData
    : assignmentsData?.results || []
  const deposits = Array.isArray(depositsData) ? depositsData : depositsData?.results || []

  const stats = useMemo(() => {
    let totalAssigned = 0
    let totalSold = 0
    let totalReturned = 0
    let activeAssigned = 0
    let pendingAcceptance = 0
    const productTotals = new Map()
    const bankTotals = new Map()

    assignments.forEach((assignment) => {
      totalAssigned += Number(assignment.total_assigned) || 0
      totalSold += Number(assignment.total_sold) || 0
      totalReturned += Number(assignment.total_returned) || 0
      activeAssigned += Number(assignment.quantity) || 0
      if (!assignment.is_accepted && Number(assignment.quantity) > 0) {
        pendingAcceptance += 1
      }

      const productName = assignment.product_name
      if (productName) {
        productTotals.set(productName, (productTotals.get(productName) || 0) + (Number(assignment.total_sold) || 0))
      }
    })

    deposits.forEach((deposit) => {
      const bank = deposit.bank_display || deposit.bank_name || 'Unknown'
      const amount = Number(deposit.total_amount) || 0
      const current = bankTotals.get(bank) || { count: 0, amount: 0 }
      bankTotals.set(bank, {
        count: current.count + 1,
        amount: current.amount + amount,
      })
    })

    const topProducts = Array.from(productTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    const bankMix = Array.from(bankTotals.entries())
      .map(([name, value]) => ({ label: name, count: value.count, amount: value.amount }))
      .sort((a, b) => b.amount - a.amount)

    const salesMix = [
      { label: 'Sold', value: totalSold },
      { label: 'Active', value: activeAssigned },
      { label: 'Returned', value: totalReturned },
    ]

    const totalDeposits = deposits.reduce(
      (sum, deposit) => sum + (Number(deposit.total_amount) || 0),
      0,
    )

    return {
      totalAssigned,
      totalSold,
      totalReturned,
      activeAssigned,
      pendingAcceptance,
      topProducts,
      bankMix,
      salesMix,
      totalDeposits,
    }
  }, [assignments, deposits])

  const maxProductValue = Math.max(...stats.topProducts.map((item) => item.value), 1)
  const maxBankValue = Math.max(...stats.bankMix.map((item) => item.amount), 1)
  const salesMixGradient = buildConicGradient(stats.salesMix)

  if (assignmentsLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} ${styles.dashboardHeader}`}>
        <p className='text-sm text-slate-400'>Loading sales analytics...</p>
      </div>
    )
  }

  if (assignmentsError) {
    const errorMessage =
      assignmentsError?.data?.detail ||
      (typeof assignmentsError?.data === 'string' ? assignmentsError.data : '') ||
      (assignmentsError?.status
        ? `Request failed with status ${assignmentsError.status}.`
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
          {assignmentsFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
        </div>

        <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
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
                      <span>{item.value}</span>
                    </div>
                    <div className='mt-1 h-2 rounded-full bg-slate-800/70'>
                      <div
                        className='h-2 rounded-full'
                        style={{
                          width: `${(item.value / maxProductValue) * 100}%`,
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
                          backgroundColor: CHART_COLORS[(index + 3) % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className='mt-3 text-xs text-slate-400'>Total deposited: {stats.totalDeposits}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesStatsPanel
