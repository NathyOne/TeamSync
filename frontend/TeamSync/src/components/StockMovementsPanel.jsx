import { useMemo, useState } from 'react'
import { useGetStockMovementsQuery } from '../services/api'

const MOVEMENT_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'ASSIGN', label: 'Assign' },
  { value: 'RETURN', label: 'Return' },
]

function StockMovementsPanel({ styles }) {
  const { data, error, isLoading, isFetching } = useGetStockMovementsQuery()
  const [movementFilter, setMovementFilter] = useState('')
  const movements = Array.isArray(data) ? data : data?.results || []

  const filtered = useMemo(() => {
    return movements.filter((movement) => {
      if (movementFilter && movement.movement_type !== movementFilter) {
        return false
      }
      return true
    })
  }, [movements, movementFilter])

  if (isLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} from-cyan-500/15 to-blue-500/20`}>
        <div className={styles.actionInner}>
          <p className='text-sm text-slate-400'>Loading stock movements...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error?.data?.detail ||
      (typeof error?.data === 'string' ? error.data : '') ||
      (error?.status ? `Request failed with status ${error.status}.` : 'Failed to load movements.')

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
            <h2 className='text-xl font-semibold'>Audit Trail</h2>
            <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
              All stock movements across assignments and returns.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <select
              className={styles.input}
              onChange={(event) => setMovementFilter(event.target.value)}
              value={movementFilter}
            >
              {MOVEMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className='mt-4 text-sm text-slate-400'>No movements found.</p>
        ) : (
          <div className='mt-4 space-y-3'>
            {filtered.map((movement) => (
              <div
                key={movement.id}
                className='flex flex-col gap-2 rounded-2xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between'
              >
                <div>
                  <p className='text-sm text-slate-400'>Type: {movement.movement_type}</p>
                  <p className='text-lg font-semibold'>{movement.product_name}</p>
                  <p className='text-xs text-slate-400'>Sales: {movement.salesperson_email}</p>
                </div>
                <div className='text-sm text-slate-300'>Qty: {movement.quantity}</div>
                <div className='text-xs text-slate-400'>
                  {movement.created_at ? new Date(movement.created_at).toLocaleString() : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StockMovementsPanel
