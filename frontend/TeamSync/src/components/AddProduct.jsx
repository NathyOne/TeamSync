import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAddProductMutation } from '../services/api'

function AddProduct({ onLogout, onToggleTheme, styles, themeButtonLabel }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [addProduct, { isLoading, error }] = useAddProductMutation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSuccessMessage('')

    const trimmedName = name.trim()
    const parsedQuantity = Number(quantity)

    if (!trimmedName) {
      setFormError('Product name is required.')
      return
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      setFormError('Quantity must be a whole number greater than or equal to 0.')
      return
    }

    try {
      await addProduct({ name: trimmedName, quantity: parsedQuantity }).unwrap()
      setSuccessMessage('Product added successfully.')
      setName('')
      setQuantity('')
    } catch {
      // Error text is handled in the UI using RTK Query error object.
    }
  }

  const handleBackToDashboard = () => {
    navigate('/admin')
  }

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  const apiErrorMessage =
    error?.data?.detail ||
    (typeof error?.data === 'string' ? error.data : '') ||
    'Failed to add product. Please try again.'

  return (
    <div className={styles.dashboardPage}>
      <div className='mx-auto max-w-4xl'>
        <div
          className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${styles.dashboardHeader}`}
        >
          <div>
            <p className={`text-sm uppercase tracking-[0.28em] ${styles.eyebrow}`}> <span className='text-green-500'>TeamSync</span> Dashboard</p>
            <h1 className='mt-2 text-3xl font-bold'>Add Product</h1>
            <p className={`mt-1 ${styles.dashboardSubtext}`}>
              Create a product with name and available quantity.
            </p>
          </div>

          <div className='flex flex-wrap gap-2'>
            <button className={styles.utilityButton} onClick={handleBackToDashboard} type='button'>
              Back to Admin
            </button>
            <button className={styles.utilityButton} onClick={onToggleTheme} type='button'>
              {themeButtonLabel}
            </button>
            <button className={styles.utilityButton} onClick={handleLogout} type='button'>
              Logout
            </button>
          </div>
        </div>

        <div className={`mt-8 ${styles.panelWrap} from-cyan-500/15 to-blue-500/20`}>
          <div className={styles.actionInner}>
            <form className='space-y-4' onSubmit={handleSubmit}>
              <div>
                <label className={styles.labelText} htmlFor='product-name'>
                  Product Name
                </label>
                <input
                  className={styles.input}
                  id='product-name'
                  name='name'
                  onChange={(event) => setName(event.target.value)}
                  placeholder='e.g. Wireless Keyboard'
                  type='text'
                  value={name}
                />
              </div>

              <div>
                <label className={styles.labelText} htmlFor='product-quantity'>
                  Quantity
                </label>
                <input
                  className={styles.input}
                  id='product-quantity'
                  min='0'
                  name='quantity'
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder='e.g. 25'
                  type='number'
                  value={quantity}
                />
              </div>

              {formError ? <p className='text-sm text-rose-500'>{formError}</p> : null}
              {error ? <p className='text-sm text-rose-500'>{apiErrorMessage}</p> : null}
              {successMessage ? <p className='text-sm text-emerald-500'>{successMessage}</p> : null}

              <button
                className='rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70'
                disabled={isLoading}
                type='submit'
              >
                {isLoading ? 'Saving...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddProduct
