import { useMemo } from 'react'
import { useGetSalesAssignmentsQuery } from '../services/api'

function SalesAssignmentList({ styles }) {
  const { data, error, isLoading, isFetching } = useGetSalesAssignmentsQuery()
  const assignments = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.results || []
    return list.filter((assignment) => assignment.quantity > 0)
  }, [data])

  if (isLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} from-cyan-500/15 to-blue-500/20`}>
        <div className={styles.actionInner}>
          <p className='text-sm text-slate-400'>Loading assigned sales list...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error?.data?.detail ||
      (typeof error?.data === 'string' ? error.data : '') ||
      (error?.status ? `Request failed with status ${error.status}.` : 'Failed to load assignments.')

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
            <h2 className='text-xl font-semibold'>Assigned Sales List</h2>
            <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
              Product names shown alongside each salesperson and quantity.
            </p>
          </div>
          {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
        </div>

        {assignments.length === 0 ? (
          <p className='mt-4 text-sm text-slate-400'>No active assignments found.</p>
        ) : (
          <div className='mt-4 space-y-3'>
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className='flex flex-col gap-2 rounded-2xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between'
              >
                <div>
                  <p className='text-sm text-slate-400'>Sales: {assignment.salesperson_email}</p>
                  <p className='text-lg font-semibold'>{assignment.product_name}</p>
                </div>
                <div className='text-sm text-slate-300'>Qty: {assignment.quantity}</div>
                <div className='text-sm text-slate-400'>
                  Status: {assignment.is_accepted ? 'Accepted' : 'Pending'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesAssignmentList
