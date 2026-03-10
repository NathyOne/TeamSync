import { useMemo } from 'react'
import { useGetStockMovementsQuery } from '../services/api'

function ReturnNotifications({ styles }) {
  const { data, error, isLoading, isFetching } = useGetStockMovementsQuery()

  const returns = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.results || []
    return list
      .filter((movement) => movement.movement_type === 'RETURN')
      .slice(0, 8)
  }, [data])

  if (isLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} from-cyan-500/15 to-blue-500/20`}>
        <div className={styles.actionInner}>
          <p className='text-sm text-slate-400'>Loading return notifications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error?.data?.detail ||
      (typeof error?.data === 'string' ? error.data : '') ||
      (error?.status ? `Request failed with status ${error.status}.` : 'Failed to load returns.')

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
            <h2 className='text-xl font-semibold'>Recent Returns</h2>
            <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
              Notifications when sales return stock.
            </p>
          </div>
          {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
        </div>

        {returns.length === 0 ? (
          <p className='mt-4 text-sm text-slate-400'>No recent returns recorded.</p>
        ) : (
          <div className='mt-4 space-y-3'>
            {returns.map((movement) => (
              <div
                key={movement.id}
                className='flex flex-col gap-2 rounded-2xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between'
              >
                <div>
                  <p className='text-sm text-slate-400'>Sales: {movement.salesperson_email}</p>
                  <p className='text-lg font-semibold'>{movement.product_name}</p>
                </div>
                <div className='text-sm text-slate-300'>Returned: {movement.quantity}</div>
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

export default ReturnNotifications
