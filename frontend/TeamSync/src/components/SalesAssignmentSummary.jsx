import { useMemo } from 'react'
import { useGetSalesAssignmentsQuery } from '../services/api'

function SalesAssignmentSummary({ styles }) {
  const { data, error, isLoading, isFetching } = useGetSalesAssignmentsQuery()
  const assignments = Array.isArray(data) ? data : data?.results || []

  const summary = useMemo(() => {
    const bySalesperson = new Map()

    assignments.forEach((assignment) => {
      if (assignment.quantity <= 0) {
        return
      }

      const email = assignment.salesperson_email || `Sales #${assignment.salesperson}`
      if (!bySalesperson.has(email)) {
        bySalesperson.set(email, {
          email,
          productCount: 0,
          totalQuantity: 0,
        })
      }
      const current = bySalesperson.get(email)
      current.productCount += 1
      current.totalQuantity += Number(assignment.quantity) || 0
    })

    return Array.from(bySalesperson.values()).sort((a, b) => a.email.localeCompare(b.email))
  }, [assignments])

  if (isLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} from-cyan-500/15 to-blue-500/20`}>
        <div className={styles.actionInner}>
          <p className='text-sm text-slate-400'>Loading sales assignment summary...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error?.data?.detail ||
      (typeof error?.data === 'string' ? error.data : '') ||
      (error?.status ? `Request failed with status ${error.status}.` : 'Failed to load sales assignments.')

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
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold'>Sales Assignment Summary</h2>
            <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
              Overview of assigned products by salesperson.
            </p>
          </div>
          {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
        </div>

        {summary.length === 0 ? (
          <p className='mt-4 text-sm text-slate-400'>No active assignments found.</p>
        ) : (
          <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {summary.map((item) => (
              <div key={item.email} className={styles.statCard}>
                <p className='text-sm text-slate-400'>{item.email}</p>
                <p className='mt-2 text-lg font-semibold'>Products: {item.productCount}</p>
                <p className='text-sm text-slate-300'>Total qty: {item.totalQuantity}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesAssignmentSummary
