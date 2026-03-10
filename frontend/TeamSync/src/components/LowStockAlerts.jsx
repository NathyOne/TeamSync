import { useMemo } from 'react'
import { useGetProductsQuery } from '../services/api'

function LowStockAlerts({ styles }) {
  const { data, error, isLoading, isFetching } = useGetProductsQuery()
  const products = Array.isArray(data) ? data : data?.results || []

  const lowStock = useMemo(() => {
    return products.filter(
      (product) =>
        Number(product.quantity) > 0 &&
        Number(product.reorder_threshold) >= 0 &&
        Number(product.quantity) <= Number(product.reorder_threshold),
    )
  }, [products])

  if (isLoading) {
    return (
      <div className='mt-8 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6'>
        <p className='text-sm text-slate-400'>Checking low-stock items...</p>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error?.data?.detail ||
      (typeof error?.data === 'string' ? error.data : '') ||
      (error?.status ? `Request failed with status ${error.status}.` : 'Failed to load products.')

    return (
      <div className='mt-8 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6'>
        <p className='text-sm text-rose-500'>{errorMessage}</p>
      </div>
    )
  }

  return (
    <div className='mt-8 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-3'>
          <span
            className='flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-xl text-amber-200'
            role='img'
            aria-label='Notification'
          >
            🔔
          </span>
          <div>
            <h2 className='text-xl font-semibold'>Low Stock Alerts</h2>
            <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
              Products at or below reorder threshold.
            </p>
          </div>
        </div>
        {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
      </div>

      {lowStock.length === 0 ? (
        <p className='mt-4 text-sm text-slate-400'>All products are above threshold.</p>
      ) : (
        <div className='mt-4 space-y-3'>
          {lowStock.map((product) => (
            <div
              key={product.id}
              className='flex flex-col gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between'
            >
              <div>
                <p className='text-lg font-semibold'>{product.name}</p>
                <p className='text-sm text-slate-400'>Threshold: {product.reorder_threshold}</p>
              </div>
              <div className='text-sm text-amber-200'>Qty: {product.quantity}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LowStockAlerts
