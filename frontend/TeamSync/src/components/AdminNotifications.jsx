import { useMemo, useState } from 'react'
import {
  useGetProductsQuery,
  useGetSalesAssignmentsQuery,
  useGetStockMovementsQuery,
} from '../services/api'

function AdminNotifications({ styles }) {
  const [open, setOpen] = useState(false)
  const { data: productsData } = useGetProductsQuery()
  const { data: assignmentsData } = useGetSalesAssignmentsQuery()
  const { data: movementsData } = useGetStockMovementsQuery()

  const products = Array.isArray(productsData) ? productsData : productsData?.results || []
  const assignments = Array.isArray(assignmentsData)
    ? assignmentsData
    : assignmentsData?.results || []
  const movements = Array.isArray(movementsData) ? movementsData : movementsData?.results || []

  const { lowStock, pendingAssignments, returns } = useMemo(() => {
    const lowStockList = products.filter(
      (product) =>
        Number(product.quantity) > 0 &&
        Number(product.reorder_threshold) >= 0 &&
        Number(product.quantity) <= Number(product.reorder_threshold),
    )
    const pending = assignments.filter(
      (assignment) => !assignment.is_accepted && Number(assignment.quantity) > 0,
    )
    const returnList = movements.filter((movement) => movement.movement_type === 'RETURN')

    return {
      lowStock: lowStockList,
      pendingAssignments: pending,
      returns: returnList,
    }
  }, [products, assignments, movements])

  const alertsCount = lowStock.length + pendingAssignments.length + returns.length

  return (
    <div className='relative'>
      <button
        className={`${styles.utilityButton} relative flex items-center justify-center`}
        onClick={() => setOpen((prev) => !prev)}
        type='button'
        aria-label='Notifications'
        aria-expanded={open}
      >
        <span role='img' aria-hidden='true'>
          🔔
        </span>
        {alertsCount > 0 ? (
          <span className='absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white'>
            {alertsCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className={`absolute right-0 z-20 mt-3 w-80 ${styles.dashboardHeader}`}>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold'>Notifications</h3>
              <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
                Low stock, pending acceptance, and returns.
              </p>
            </div>
            <button
              className={`${styles.utilityButton} px-3 py-1 text-xs`}
              onClick={() => setOpen(false)}
              type='button'
            >
              Close
            </button>
          </div>

          {alertsCount === 0 ? (
            <p className='mt-4 text-sm text-slate-400'>All clear. No alerts right now.</p>
          ) : (
            <div className='mt-4 max-h-96 space-y-4 overflow-y-auto pr-1'>
              <div>
                <p className='text-sm font-semibold'>Low Stock ({lowStock.length})</p>
                {lowStock.length === 0 ? (
                  <p className='mt-2 text-xs text-slate-400'>No low stock items.</p>
                ) : (
                  <div className='mt-2 space-y-2'>
                    {lowStock.map((product) => (
                      <div key={product.id} className='rounded-lg border border-white/10 p-2 text-sm'>
                        <p className='font-semibold text-slate-100'>{product.name}</p>
                        <p className='text-xs text-slate-300'>
                          Qty: {product.quantity} • Threshold: {product.reorder_threshold}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className='text-sm font-semibold'>Pending Acceptance ({pendingAssignments.length})</p>
                {pendingAssignments.length === 0 ? (
                  <p className='mt-2 text-xs text-slate-400'>No pending assignments.</p>
                ) : (
                  <div className='mt-2 space-y-2'>
                    {pendingAssignments.map((assignment) => (
                      <div key={assignment.id} className='rounded-lg border border-white/10 p-2 text-sm'>
                        <p className='font-semibold text-slate-100'>{assignment.product_name}</p>
                        <p className='text-xs text-slate-300'>
                          Sales: {assignment.salesperson_email} • Qty: {assignment.quantity}
                        </p>
                        {assignment.updated_at ? (
                          <p className='text-xs text-slate-400'>
                            Updated: {new Date(assignment.updated_at).toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className='text-sm font-semibold'>Recent Returns ({returns.length})</p>
                {returns.length === 0 ? (
                  <p className='mt-2 text-xs text-slate-400'>No recent returns.</p>
                ) : (
                  <div className='mt-2 space-y-2'>
                    {returns.map((movement) => (
                      <div key={movement.id} className='rounded-lg border border-white/10 p-2 text-sm'>
                        <p className='font-semibold text-slate-100'>{movement.product_name}</p>
                        <p className='text-xs text-slate-300'>
                          Sales: {movement.salesperson_email} • Qty: {movement.quantity}
                        </p>
                        {movement.created_at ? (
                          <p className='text-xs text-slate-400'>
                            Returned: {new Date(movement.created_at).toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default AdminNotifications
