import { useMemo, useState } from 'react'
import { ACCESS_TOKEN_KEY } from '../config/appConfig'
import { useGetSalesDepositsQuery } from '../services/api'

function SalesDepositsPanel({ styles }) {
  const { data, error, isLoading, isFetching } = useGetSalesDepositsQuery()
  const [bankFilter, setBankFilter] = useState('')
  const [salesFilter, setSalesFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [exportError, setExportError] = useState('')

  const deposits = Array.isArray(data) ? data : data?.results || []

  const bankOptions = useMemo(() => {
    const banks = new Set()
    deposits.forEach((deposit) => {
      if (deposit.bank_display) {
        banks.add(deposit.bank_display)
      }
    })
    return Array.from(banks)
  }, [deposits])

  const filteredDeposits = useMemo(() => {
    return deposits.filter((deposit) => {
      if (bankFilter && deposit.bank_display !== bankFilter) {
        return false
      }
      if (salesFilter) {
        const email = String(deposit.salesperson_email || '').toLowerCase()
        if (!email.includes(salesFilter.toLowerCase())) {
          return false
        }
      }
      if (startDate) {
        const createdAt = new Date(deposit.created_at)
        const start = new Date(startDate)
        if (createdAt < start) {
          return false
        }
      }
      if (endDate) {
        const createdAt = new Date(deposit.created_at)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (createdAt > end) {
          return false
        }
      }
      return true
    })
  }, [deposits, bankFilter, salesFilter, startDate, endDate])

  const handleExport = async () => {
    setExportError('')
    try {
      const token = window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
      const response = await fetch('http://localhost:9000/teamsync/app/stock/deposits/export/', {
        headers: token ? { authorization: `JWT ${token}` } : {},
      })
      if (!response.ok) {
        throw new Error('Export failed')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'sales_deposits.csv'
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setExportError('Failed to export deposits.')
    }
  }

  if (isLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} from-cyan-500/15 to-blue-500/20`}>
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
            <h2 className='text-xl font-semibold'>Sales Deposits</h2>
            <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
              Track bank deposits for sold items.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <button className={styles.utilityButton} onClick={handleExport} type='button'>
              Export CSV
            </button>
            {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
          </div>
        </div>

        <div className='mt-4 grid gap-3 md:grid-cols-4'>
          <input
            className={styles.input}
            onChange={(event) => setSalesFilter(event.target.value)}
            placeholder='Filter by salesperson'
            type='text'
            value={salesFilter}
          />
          <select
            className={styles.input}
            onChange={(event) => setBankFilter(event.target.value)}
            value={bankFilter}
          >
            <option value=''>All banks</option>
            {bankOptions.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
          <input
            className={styles.input}
            onChange={(event) => setStartDate(event.target.value)}
            type='date'
            value={startDate}
          />
          <input
            className={styles.input}
            onChange={(event) => setEndDate(event.target.value)}
            type='date'
            value={endDate}
          />
        </div>

        {filteredDeposits.length === 0 ? (
          <p className='mt-4 text-sm text-slate-400'>No deposits match the current filters.</p>
        ) : (
          <div className='mt-4 space-y-3'>
            {filteredDeposits.map((deposit) => (
              <div
                key={deposit.id}
                className='flex flex-col gap-2 rounded-2xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between'
              >
                <div>
                  <p className='text-sm text-slate-400'>Sales: {deposit.salesperson_email}</p>
                  <p className='text-lg font-semibold'>{deposit.product_name}</p>
                </div>
                <div className='text-sm text-slate-300'>Qty: {deposit.quantity}</div>
                <div className='text-sm text-emerald-200'>
                  Amount: {deposit.total_amount ?? '-'}
                </div>
                <div className='text-sm text-slate-300'>Bank: {deposit.bank_display}</div>
                <div className='text-xs text-slate-400'>
                  {deposit.created_at ? new Date(deposit.created_at).toLocaleString() : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {exportError ? <p className='mt-4 text-sm text-rose-500'>{exportError}</p> : null}
      </div>
    </div>
  )
}

export default SalesDepositsPanel
