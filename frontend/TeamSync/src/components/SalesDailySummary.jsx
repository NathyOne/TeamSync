import { useMemo } from 'react'
import { useGetMyDepositsQuery } from '../services/api'

function SalesDailySummary({ styles }) {
  const { data, error, isLoading, isFetching } = useGetMyDepositsQuery()
  const deposits = Array.isArray(data) ? data : data?.results || []

  const today = new Date()
  const todayKey = today.toDateString()

  const summary = useMemo(() => {
    const todaysDeposits = deposits.filter((deposit) => {
      if (!deposit.created_at) {
        return false
      }
      return new Date(deposit.created_at).toDateString() === todayKey
    })

    const totalQty = todaysDeposits.reduce((sum, deposit) => sum + Number(deposit.quantity || 0), 0)
    const banks = new Set()
    todaysDeposits.forEach((deposit) => {
      if (deposit.bank_display) {
        banks.add(deposit.bank_display)
      }
    })

    return {
      count: todaysDeposits.length,
      totalQty,
      banks: Array.from(banks),
    }
  }, [deposits, todayKey])

  if (isLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} ${styles.dashboardHeader}`}>
        <p className='text-sm text-slate-400'>Loading daily sales summary...</p>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error?.data?.detail ||
      (typeof error?.data === 'string' ? error.data : '') ||
      (error?.status ? `Request failed with status ${error.status}.` : 'Failed to load summary.')

    return (
      <div className={`mt-8 ${styles.panelWrap} ${styles.dashboardHeader}`}>
        <p className='text-sm text-rose-500'>{errorMessage}</p>
      </div>
    )
  }

  return (
    <div className={`mt-8 ${styles.panelWrap} ${styles.dashboardHeader}`}>
      <div className={styles.actionInner}>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-xl font-semibold'>Today&apos;s Sales Summary</h2>
            <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
              Deposits submitted on {today.toLocaleDateString()}.
            </p>
          </div>
          {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
        </div>

        <div className='mt-4 grid gap-3 sm:grid-cols-3'>
          <div className='rounded-2xl border border-white/10 p-4'>
            <p className='text-sm text-slate-400'>Deposits</p>
            <p className='mt-1 text-2xl font-semibold'>{summary.count}</p>
          </div>
          <div className='rounded-2xl border border-white/10 p-4'>
            <p className='text-sm text-slate-400'>Total Qty</p>
            <p className='mt-1 text-2xl font-semibold'>{summary.totalQty}</p>
          </div>
          <div className='rounded-2xl border border-white/10 p-4'>
            <p className='text-sm text-slate-400'>Banks Used</p>
            <p className='mt-1 text-sm text-slate-200'>
              {summary.banks.length ? summary.banks.join(', ') : 'None yet'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesDailySummary
