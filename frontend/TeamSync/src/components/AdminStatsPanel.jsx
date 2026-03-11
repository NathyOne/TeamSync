import { useMemo } from 'react'
import { useGetProductsQuery, useGetSalesAssignmentsQuery } from '../services/api'

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
    data: assignmentsData,
    error: assignmentsError,
    isLoading: assignmentsLoading,
    isFetching: assignmentsFetching,
  } = useGetSalesAssignmentsQuery()
  const { data: productsData } = useGetProductsQuery()

  const assignments = Array.isArray(assignmentsData)
    ? assignmentsData
    : assignmentsData?.results || []
  const products = Array.isArray(productsData) ? productsData : productsData?.results || []

  const stats = useMemo(() => {
    let totalSold = 0
    let totalReturned = 0
    let activeAssigned = 0
    const salespersonTotals = new Map()
    const productTotals = new Map()
    const salespeople = new Set()

    const breakdown = assignments
      .filter((assignment) => Number(assignment.total_sold) > 0)
      .map((assignment) => ({
        id: assignment.id,
        salesperson: assignment.salesperson_email || `Sales #${assignment.salesperson}`,
        product: assignment.product_name,
        sold: Number(assignment.total_sold) || 0,
      }))
      .sort((a, b) => b.sold - a.sold)

    assignments.forEach((assignment) => {
      const sold = Number(assignment.total_sold) || 0
      const returned = Number(assignment.total_returned) || 0
      const currentQty = Number(assignment.quantity) || 0

      totalSold += sold
      totalReturned += returned
      activeAssigned += currentQty

      const salesperson = assignment.salesperson_email || `Sales #${assignment.salesperson}`
      salespeople.add(salesperson)
      if (!salespersonTotals.has(salesperson)) {
        salespersonTotals.set(salesperson, 0)
      }
      salespersonTotals.set(salesperson, salespersonTotals.get(salesperson) + sold)

      const product = assignment.product_name
      if (product) {
        if (!productTotals.has(product)) {
          productTotals.set(product, 0)
        }
        productTotals.set(product, productTotals.get(product) + sold)
      }
    })

    const lowStockCount = products.filter(
      (product) =>
        Number(product.quantity) > 0 &&
        Number(product.reorder_threshold) >= 0 &&
        Number(product.quantity) <= Number(product.reorder_threshold),
    ).length

    const topSalesperson = Array.from(salespersonTotals.entries()).sort((a, b) => b[1] - a[1])[0]
    const topProduct = Array.from(productTotals.entries()).sort((a, b) => b[1] - a[1])[0]
    const topProducts = Array.from(productTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
    const topSalespeople = Array.from(salespersonTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    const salesMix = [
      { label: 'Sold', value: totalSold },
      { label: 'Returned', value: totalReturned },
      { label: 'Active', value: activeAssigned },
    ]

    return {
      totalSold,
      totalReturned,
      activeAssigned,
      activeSalespeople: salespeople.size,
      lowStockCount,
      topSalesperson: topSalesperson ? { name: topSalesperson[0], sold: topSalesperson[1] } : null,
      topProduct: topProduct ? { name: topProduct[0], sold: topProduct[1] } : null,
      topProducts,
      topSalespeople,
      salesMix,
      breakdown,
    }
  }, [assignments, products])

  const maxProductValue = Math.max(...stats.topProducts.map((item) => item.value), 1)
  const maxSalesValue = Math.max(...stats.topSalespeople.map((item) => item.value), 1)
  const salesMixGradient = buildConicGradient(stats.salesMix)

  if (assignmentsLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} from-cyan-500/15 to-blue-500/20`}>
        <div className={styles.actionInner}>
          <p className='text-sm text-slate-400'>Loading sales performance stats...</p>
        </div>
      </div>
    )
  }

  if (assignmentsError) {
    const errorMessage =
      assignmentsError?.data?.detail ||
      (typeof assignmentsError?.data === 'string' ? assignmentsError.data : '') ||
      (assignmentsError?.status
        ? `Request failed with status ${assignmentsError.status}.`
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
            <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
              Items sold per product and per salesperson.
            </p>
          </div>
          {assignmentsFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
        </div>

        <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
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
            <p className={styles.statLabel}>Active Salespeople</p>
            <p className='mt-2 text-2xl font-semibold'>{stats.activeSalespeople}</p>
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
              {stats.topSalesperson ? stats.topSalesperson.name : 'No sales yet'}
            </p>
            {stats.topSalesperson ? (
              <p className='text-sm text-slate-300'>Sold: {stats.topSalesperson.sold}</p>
            ) : null}
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Top Product</p>
            <p className='mt-2 text-lg font-semibold'>
              {stats.topProduct ? stats.topProduct.name : 'No sales yet'}
            </p>
            {stats.topProduct ? (
              <p className='text-sm text-slate-300'>Sold: {stats.topProduct.sold}</p>
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
            <p className={styles.statLabel}>Sales by Person</p>
            {stats.topSalespeople.length === 0 ? (
              <p className='mt-3 text-sm text-slate-400'>No sales yet.</p>
            ) : (
              <div className='mt-3 space-y-3'>
                {stats.topSalespeople.map((item, index) => (
                  <div key={item.name}>
                    <div className='flex items-center justify-between text-xs text-slate-300'>
                      <span>{item.name}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className='mt-1 h-2 rounded-full bg-slate-800/70'>
                      <div
                        className='h-2 rounded-full'
                        style={{
                          width: `${(item.value / maxSalesValue) * 100}%`,
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
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Sold Items by Salesperson & Product</h3>
          </div>
          {stats.breakdown.length === 0 ? (
            <p className='mt-3 text-sm text-slate-400'>No sold items recorded yet.</p>
          ) : (
            <div className='mt-3 space-y-2'>
              {stats.breakdown.map((row) => (
                <div
                  key={row.id}
                  className='flex flex-col gap-2 rounded-2xl border border-white/10 p-3 sm:flex-row sm:items-center sm:justify-between'
                >
                  <div>
                    <p className='text-sm text-slate-400'>Sales: {row.salesperson}</p>
                    <p className='text-lg font-semibold'>{row.product}</p>
                  </div>
                  <div className='text-sm text-slate-200'>Sold: {row.sold}</div>
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
