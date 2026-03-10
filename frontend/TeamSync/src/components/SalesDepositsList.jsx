import { useMemo } from 'react'
import { useGetMyDepositsQuery } from '../services/api'

function SalesDepositsList({ styles }) {
  const { data, error, isLoading, isFetching } = useGetMyDepositsQuery()
  const deposits = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.results || []
    return [...list].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  }, [data])

  if (isLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} from-emerald-500/10 to-cyan-500/15`}>
        <div className={styles.actionInner}>
          <p className='text-sm text-slate-400'>Loading sales deposits...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error?.data?.detail ||
      (typeof error?.data === 'string' ? error.data : '') ||
      (error?.status ? `Request failed with status ${error.status}.` : 'Failed to load deposits.')

    return (
      <div className={`mt-8 ${styles.panelWrap} from-emerald-500/10 to-cyan-500/15`}>
        <div className={styles.actionInner}>
          <p className='text-sm text-rose-500'>{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`mt-8 ${styles.panelWrap} from-emerald-500/10 to-cyan-500/15`}>
      <div className={styles.actionInner}>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-xl font-semibold'>Sales Deposit History</h2>
            <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
              Every deposit you have submitted so far.
            </p>
          </div>
          {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
        </div>

        {deposits.length === 0 ? (
          <p className='mt-4 text-sm text-slate-400'>No deposits recorded yet.</p>
        ) : (
          <div className='mt-4 space-y-3'>
            {deposits.map((deposit) => (
              <div
                key={deposit.id}
                className='flex flex-col gap-2 rounded-2xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between'
              >
                <div>
                  <p className='text-lg font-semibold'>{deposit.product_name}</p>
                  <p className='text-sm text-slate-400'>Bank: {deposit.bank_display}</p>
                  {deposit.unit_price ? (
                    <p className='text-xs text-slate-400'>Unit Price: {deposit.unit_price}</p>
                  ) : null}
                </div>
                <div className='text-sm text-slate-200'>Qty: {deposit.quantity}</div>
                <div className='text-sm text-emerald-200'>
                  Amount: {deposit.total_amount ?? '-'}
                </div>
                <div className='text-xs text-slate-400'>
                  {deposit.created_at ? new Date(deposit.created_at).toLocaleString() : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesDepositsList
