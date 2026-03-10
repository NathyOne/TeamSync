import { useMemo, useState } from 'react'
import {
  useAcceptAssignmentMutation,
  useGetMyAssignmentsQuery,
  useRejectAssignmentMutation,
  useReturnStockMutation,
  useSubmitSaleMutation,
} from '../services/api'

const BANK_OPTIONS = [
  { value: 'CBE', label: 'CBE' },
  { value: 'ABYSSINIA', label: 'Abyssinia' },
  { value: 'DASHEN', label: 'Dashen' },
  { value: 'AWASH', label: 'Awash' },
  { value: 'WEGAHEN', label: 'Wegagen' },
  { value: 'NIB', label: 'Nib' },
  { value: 'COOP', label: 'Cooperative Bank' },
  { value: 'ZEMEN', label: 'Zemen' },
]

function SalesAssignments({ styles, panelClass }) {
  const { data, error, isLoading, isFetching } = useGetMyAssignmentsQuery()
  const [acceptAssignment, { isLoading: isAccepting }] = useAcceptAssignmentMutation()
  const [rejectAssignment, { isLoading: isRejecting }] = useRejectAssignmentMutation()
  const [returnStock, { isLoading: isReturning }] = useReturnStockMutation()
  const [submitSale, { isLoading: isSubmitting }] = useSubmitSaleMutation()
  const [returnQuantities, setReturnQuantities] = useState({})
  const [saleBanks, setSaleBanks] = useState({})
  const [saleQuantities, setSaleQuantities] = useState({})
  const [openSaleForms, setOpenSaleForms] = useState({})
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const assignments = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.results || []
    return list.filter((assignment) => assignment.quantity > 0)
  }, [data])
  const pendingCount = assignments.filter((assignment) => !assignment.is_accepted).length

  const isBusy = isAccepting || isRejecting || isReturning || isSubmitting

  const getApiErrorMessage = (apiError, fallback) =>
    apiError?.data?.detail ||
    apiError?.data?.quantity?.[0] ||
    apiError?.data?.product_id?.[0] ||
    (typeof apiError?.data === 'string' ? apiError.data : '') ||
    fallback

  const handleAccept = async (assignment) => {
    setActionMessage('')
    setActionError('')
    try {
      await acceptAssignment({ product_id: assignment.product }).unwrap()
      setActionMessage(`Accepted assignment for ${assignment.product_name}.`)
    } catch (apiError) {
      setActionError(getApiErrorMessage(apiError, 'Failed to accept assignment.'))
    }
  }

  const handleReject = async (assignment) => {
    setActionMessage('')
    setActionError('')
    try {
      await rejectAssignment({ product_id: assignment.product }).unwrap()
      setActionMessage(`Rejected assignment for ${assignment.product_name}. Stock restored.`)
    } catch (apiError) {
      setActionError(getApiErrorMessage(apiError, 'Failed to reject assignment.'))
    }
  }

  const handleReturn = async (assignment) => {
    setActionMessage('')
    setActionError('')
    const rawQuantity = returnQuantities[assignment.id]
    const parsedQuantity = Number(rawQuantity)

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setActionError('Return quantity must be a whole number greater than 0.')
      return
    }

    if (parsedQuantity > Number(assignment.quantity)) {
      setActionError('Return quantity exceeds assigned stock.')
      return
    }

    try {
      await returnStock({ product_id: assignment.product, quantity: parsedQuantity }).unwrap()
      setActionMessage(`Returned ${parsedQuantity} unit${parsedQuantity === 1 ? '' : 's'} of ${assignment.product_name}.`)
      setReturnQuantities((prev) => ({ ...prev, [assignment.id]: '' }))
    } catch (apiError) {
      setActionError(getApiErrorMessage(apiError, 'Failed to return stock.'))
    }
  }

  const toggleSaleForm = (assignmentId) => {
    setOpenSaleForms((prev) => ({ ...prev, [assignmentId]: !prev[assignmentId] }))
  }

  const handleSubmitSale = async (assignment) => {
    setActionMessage('')
    setActionError('')
    const bankName = saleBanks[assignment.id]
    const rawQuantity = saleQuantities[assignment.id]
    const parsedQuantity = rawQuantity ? Number(rawQuantity) : assignment.quantity

    if (!bankName) {
      setActionError('Select a bank before submitting the sale.')
      return
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setActionError('Deposit quantity must be a whole number greater than 0.')
      return
    }

    if (parsedQuantity > Number(assignment.quantity)) {
      setActionError('Deposit quantity exceeds assigned stock.')
      return
    }

    try {
      await submitSale({
        product_id: assignment.product,
        bank_name: bankName,
        quantity: parsedQuantity,
      }).unwrap()
      setActionMessage(
        `Submitted deposit for ${parsedQuantity} unit${parsedQuantity === 1 ? '' : 's'} of ${assignment.product_name} via ${bankName}.`,
      )
      setSaleBanks((prev) => ({ ...prev, [assignment.id]: '' }))
      setSaleQuantities((prev) => ({ ...prev, [assignment.id]: '' }))
      setOpenSaleForms((prev) => ({ ...prev, [assignment.id]: false }))
    } catch (apiError) {
      setActionError(getApiErrorMessage(apiError, 'Failed to submit sale.'))
    }
  }

  if (isLoading) {
    return (
      <div className={`mt-8 ${styles.panelWrap} ${panelClass || ''}`}>
        <p className='text-sm text-slate-400'>Loading assigned products...</p>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error?.data?.detail ||
      error?.data?.product_id?.[0] ||
      (typeof error?.data === 'string' ? error.data : '') ||
      (error?.status ? `Request failed with status ${error.status}.` : 'Failed to load assigned products.')

    return (
      <div className={`mt-8 ${styles.panelWrap} ${panelClass || ''}`}>
        <p className='text-sm text-rose-500'>{errorMessage}</p>
      </div>
    )
  }

  return (
    <div className={`mt-8 ${styles.panelWrap} ${panelClass || ''}`}>
      <div className={styles.actionInner}>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold'>Assigned Products</h2>
            <p className={`mt-1 text-sm ${styles.dashboardSubtext}`}>
              Review assignments, accept or reject, return unsold items, and submit sales.
            </p>
          </div>
          {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
        </div>

        {assignments.length === 0 ? (
          <p className='mt-4 text-sm text-slate-400'>No active assignments yet.</p>
        ) : (
          <div className='mt-4 space-y-4'>
            {pendingCount > 0 ? (
              <div className='rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200'>
                You have {pendingCount} pending assignment{pendingCount === 1 ? '' : 's'} to accept.
              </div>
            ) : null}
            {assignments.map((assignment) => (
              <div key={assignment.id} className='rounded-2xl border border-white/10 p-4'>
                <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                  <div>
                    <p className='text-lg font-semibold'>{assignment.product_name}</p>
                    <p className='text-sm text-slate-400'>Assigned: {assignment.quantity}</p>
                    <p className='text-sm text-slate-400'>Status: {assignment.is_accepted ? 'Accepted' : 'Pending'}</p>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    {!assignment.is_accepted ? (
                      <>
                        <button
                          className={styles.utilityButton}
                          disabled={isBusy}
                          onClick={() => handleAccept(assignment)}
                          type='button'
                        >
                          Accept
                        </button>
                        <button
                          className={styles.utilityButton}
                          disabled={isBusy}
                          onClick={() => handleReject(assignment)}
                          type='button'
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                {assignment.is_accepted ? (
                  <div className='mt-4 flex flex-col gap-2 sm:flex-row sm:items-center'>
                    <label className={styles.labelText} htmlFor={`return-${assignment.id}`}>
                      Return Quantity
                    </label>
                    <input
                      className={styles.input}
                      id={`return-${assignment.id}`}
                      min='1'
                      onChange={(event) =>
                        setReturnQuantities((prev) => ({
                          ...prev,
                          [assignment.id]: event.target.value,
                        }))
                      }
                      placeholder='e.g. 2'
                      type='number'
                      value={returnQuantities[assignment.id] || ''}
                    />
                    <button
                      className={styles.utilityButton}
                      disabled={isBusy}
                      onClick={() => handleReturn(assignment)}
                      type='button'
                    >
                      Return Stock
                    </button>

                    <button
                      className={styles.utilityButton}
                      disabled={isBusy}
                      onClick={() => toggleSaleForm(assignment.id)}
                      type='button'
                    >
                      Deposit Money
                    </button>
                  </div>
                ) : null}

                {assignment.is_accepted && openSaleForms[assignment.id] ? (
                  <div className='mt-4 flex flex-col gap-2 sm:flex-row sm:items-center'>
                    <label className={styles.labelText} htmlFor={`sale-qty-${assignment.id}`}>
                      Sold Qty
                    </label>
                    <input
                      className={styles.input}
                      id={`sale-qty-${assignment.id}`}
                      min='1'
                      onChange={(event) =>
                        setSaleQuantities((prev) => ({
                          ...prev,
                          [assignment.id]: event.target.value,
                        }))
                      }
                      placeholder={`${assignment.quantity}`}
                      type='number'
                      value={saleQuantities[assignment.id] || ''}
                    />
                    <label className={styles.labelText} htmlFor={`bank-${assignment.id}`}>
                      Bank Name
                    </label>
                    <select
                      className={styles.input}
                      id={`bank-${assignment.id}`}
                      onChange={(event) =>
                        setSaleBanks((prev) => ({ ...prev, [assignment.id]: event.target.value }))
                      }
                      value={saleBanks[assignment.id] || ''}
                    >
                      <option value=''>Select bank</option>
                      {BANK_OPTIONS.map((bank) => (
                        <option key={bank.value} value={bank.value}>
                          {bank.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className={styles.utilityButton}
                      disabled={isBusy}
                      onClick={() => handleSubmitSale(assignment)}
                      type='button'
                    >
                      Submit Deposit
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {actionError ? <p className='mt-4 text-sm text-rose-500'>{actionError}</p> : null}
        {actionMessage ? <p className='mt-4 text-sm text-emerald-500'>{actionMessage}</p> : null}
      </div>
    </div>
  )
}

export default SalesAssignments
