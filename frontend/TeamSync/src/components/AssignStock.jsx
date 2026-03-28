import { useMemo, useState } from 'react'
import AdminShell from './AdminShell'
import { useAssignStockMutation, useGetProductsQuery, useGetUsersQuery } from '../services/api'
import { useToast } from './ToastProvider'

function AssignStock({ onLogout, onToggleTheme, styles, themeButtonLabel }) {
  const [productId, setProductId] = useState('')
  const [salespersonId, setSalespersonId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { addToast } = useToast()

  const {
    data: productsData,
    error: productsError,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
  } = useGetProductsQuery()
  const {
    data: usersData,
    error: usersError,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
  } = useGetUsersQuery()
  const [assignStock, { isLoading: isAssigning, error: assignError }] = useAssignStockMutation()

  const products = Array.isArray(productsData) ? productsData : productsData?.results || []
  const salesUsers = useMemo(() => {
    const users = Array.isArray(usersData) ? usersData : usersData?.results || []
    return users.filter((user) => String(user.role || '').toUpperCase() === 'SALES')
  }, [usersData])

  const selectedProduct = products.find((product) => String(product.id) === String(productId))
  const selectedSalesUser = salesUsers.find((user) => String(user.id) === String(salespersonId))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSuccessMessage('')

    if (!productId) {
      setFormError('Select a product to assign.')
      return
    }

    if (!salespersonId) {
      setFormError('Select a sales user to receive stock.')
      return
    }

    const parsedQuantity = Number(quantity)

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setFormError('Quantity must be a whole number greater than 0.')
      return
    }

    if (selectedProduct && parsedQuantity > Number(selectedProduct.quantity)) {
      setFormError('Quantity exceeds available stock.')
      return
    }

    try {
      await assignStock({
        product_id: Number(productId),
        salesperson_id: Number(salespersonId),
        quantity: parsedQuantity,
      }).unwrap()
      const successText = `Assigned ${parsedQuantity} unit${
        parsedQuantity === 1 ? '' : 's'
      } of ${selectedProduct?.name || 'the product'} to ${
        selectedSalesUser?.email || 'sales user'
      }.`

      setSuccessMessage(successText)
      addToast(successText, { type: 'success' })
      setQuantity('')
    } catch (apiError) {
      const message =
        apiError?.data?.detail ||
        apiError?.data?.quantity?.[0] ||
        apiError?.data?.product_id?.[0] ||
        apiError?.data?.salesperson_id?.[0] ||
        (typeof apiError?.data === 'string' ? apiError.data : '') ||
        'Failed to assign stock. Please try again.'
      addToast(message, { type: 'error' })
    }
  }

  const apiErrorMessage =
    assignError?.data?.detail ||
    assignError?.data?.quantity?.[0] ||
    assignError?.data?.product_id?.[0] ||
    assignError?.data?.salesperson_id?.[0] ||
    (typeof assignError?.data === 'string' ? assignError.data : '') ||
    'Failed to assign stock. Please try again.'

  const loadErrorMessage = productsError
    ? 'Failed to load products. Check if the backend is running.'
    : usersError
      ? 'Failed to load sales users. Check if the backend is running.'
      : ''

  const isLoading = isProductsLoading || isUsersLoading
  const isRefreshing = isProductsFetching || isUsersFetching

  return (
    <AdminShell
      activeSection='assign-stock'
      eyebrow='Sales Management System Dashboard'
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      styles={styles}
      subtitle='Allocate inventory to registered sales users.'
      themeButtonLabel={themeButtonLabel}
      title='Assign Product to Sales'
    >
      <div className='max-w-3xl'>
        <div className={`mt-8 ${styles.panelWrap} from-cyan-500/15 to-blue-500/20`}>
          <div className={styles.actionInner}>
            <form className='space-y-4' onSubmit={handleSubmit}>
              <div>
                <label className={styles.labelText} htmlFor='assign-product'>
                  Product
                </label>
                <select
                  className={styles.input}
                  id='assign-product'
                  name='product_id'
                  onChange={(event) => setProductId(event.target.value)}
                  value={productId}
                >
                  <option value=''>Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Available: {product.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={styles.labelText} htmlFor='assign-salesperson'>
                  Sales User
                </label>
                <select
                  className={styles.input}
                  id='assign-salesperson'
                  name='salesperson_id'
                  onChange={(event) => setSalespersonId(event.target.value)}
                  value={salespersonId}
                >
                  <option value=''>Select a sales user</option>
                  {salesUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={styles.labelText} htmlFor='assign-quantity'>
                  Quantity
                </label>
                <input
                  className={styles.input}
                  id='assign-quantity'
                  min='1'
                  name='quantity'
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder='e.g. 5'
                  type='number'
                  value={quantity}
                />
              </div>

              {selectedProduct ? (
                <p className='text-sm text-slate-400'>
                  Available stock: <span className='font-semibold'>{selectedProduct.quantity}</span>
                </p>
              ) : null}

              {isRefreshing ? (
                <p className='text-sm text-slate-400'>Refreshing product and user data...</p>
              ) : null}
              {loadErrorMessage ? <p className='text-sm text-rose-500'>{loadErrorMessage}</p> : null}
              {formError ? <p className='text-sm text-rose-500'>{formError}</p> : null}
              {assignError ? <p className='text-sm text-rose-500'>{apiErrorMessage}</p> : null}
              {successMessage ? <p className='text-sm text-emerald-500'>{successMessage}</p> : null}

              <button
                className='rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70'
                disabled={isLoading || isAssigning}
                type='submit'
              >
                {isAssigning ? 'Assigning...' : 'Assign Stock'}
              </button>

              {isLoading ? (
                <p className='text-sm text-slate-400'>Loading products and sales users...</p>
              ) : null}
              {!isLoading && products.length === 0 ? (
                <p className='text-sm text-slate-400'>No products available to assign.</p>
              ) : null}
              {!isLoading && salesUsers.length === 0 ? (
                <p className='text-sm text-slate-400'>No registered sales users found.</p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}

export default AssignStock
