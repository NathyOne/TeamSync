import { useMemo, useState } from 'react'
import { useGetAuditLogsQuery } from '../services/api'

const EVENT_LABELS = {
  ROLE_CHANGE: 'Role change',
  BADGE_CHANGE: 'Badge change',
  STOCK_ASSIGN: 'Stock assigned',
  STOCK_RETURN: 'Stock returned',
  SALES_DEPOSIT: 'Sales deposit',
  ASSIGN_ACCEPT: 'Assignment accepted',
  ASSIGN_REJECT: 'Assignment rejected',
}

const EVENT_OPTIONS = [
  { value: '', label: 'All events' },
  { value: 'ROLE_CHANGE', label: 'Role changes' },
  { value: 'BADGE_CHANGE', label: 'Badge changes' },
  { value: 'STOCK_ASSIGN', label: 'Stock assignments' },
  { value: 'STOCK_RETURN', label: 'Returns' },
  { value: 'SALES_DEPOSIT', label: 'Deposits' },
  { value: 'ASSIGN_ACCEPT', label: 'Assignments accepted' },
  { value: 'ASSIGN_REJECT', label: 'Assignments rejected' },
]

function AuditLogPanel({ styles }) {
  const { data, error, isLoading, isFetching } = useGetAuditLogsQuery()
  const [eventFilter, setEventFilter] = useState('')

  const events = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.results || []
    return list.filter((event) => {
      if (eventFilter && event.event_type !== eventFilter) {
        return false
      }
      return true
    })
  }, [data, eventFilter])

  if (isLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} from-cyan-500/15 to-blue-500/20`}>
        <div className={styles.actionInner}>
          <p className='text-sm text-slate-400'>Loading audit events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error?.data?.detail ||
      (typeof error?.data === 'string' ? error.data : '') ||
      (error?.status ? `Request failed with status ${error.status}.` : 'Failed to load audit logs.')

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
              Role changes, badge updates, stock assignments, returns, and deposits.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <select
              className={styles.input}
              onChange={(event) => setEventFilter(event.target.value)}
              value={eventFilter}
            >
              {EVENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
          </div>
        </div>

        {events.length === 0 ? (
          <p className='mt-4 text-sm text-slate-400'>No audit events match the filter.</p>
        ) : (
          <div className='mt-4 space-y-3'>
            {events.map((event) => (
              <div
                key={event.id}
                className='flex flex-col gap-2 rounded-2xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between'
              >
                <div>
                  <p className='text-sm text-slate-400'>
                    {EVENT_LABELS[event.event_type] || event.event_type}
                  </p>
                  <p className='text-lg font-semibold'>
                    {event.actor_email || 'System'} → {event.target_email || 'N/A'}
                  </p>
                  {event.product_name ? (
                    <p className='text-xs text-slate-400'>Product: {event.product_name}</p>
                  ) : null}
                  {event.metadata?.from ? (
                    <p className='text-xs text-slate-400'>
                      {event.metadata.from} → {event.metadata.to}
                    </p>
                  ) : null}
                </div>
                <div className='text-sm text-slate-300'>Qty: {event.quantity ?? '-'}</div>
                <div className='text-xs text-slate-400'>
                  {event.created_at ? new Date(event.created_at).toLocaleString() : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditLogPanel
