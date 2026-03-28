import { useState } from 'react'
import AdminShell from './AdminShell'
import { useAddProductMutation } from '../services/api'
import { useToast } from './ToastProvider'

function AddProduct({ onLogout, onToggleTheme, styles, themeButtonLabel }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [addProduct, { isLoading, error }] = useAddProductMutation()
  const { addToast } = useToast()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSuccessMessage('')

    const trimmedName = name.trim()
    const parsedQuantity = Number(quantity)
    const parsedPrice = Number(price)

    if (!trimmedName) {
      setFormError('Product name is required.')
      return
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      setFormError('Quantity must be a whole number greater than or equal to 0.')
      return
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setFormError('Price must be a number greater than or equal to 0.')
      return
    }

    try {
      await addProduct({ name: trimmedName, quantity: parsedQuantity, price: parsedPrice }).unwrap()
      setSuccessMessage('Product added successfully.')
      addToast('Product added successfully.', { type: 'success' })
      setName('')
      setQuantity('')
      setPrice('')
    } catch (apiError) {
      const message =
        apiError?.data?.detail ||
        (typeof apiError?.data === 'string' ? apiError.data : '') ||
        'Failed to add product. Please try again.'
      addToast(message, { type: 'error' })
    }
  }

  const apiErrorMessage =
    error?.data?.detail ||
    (typeof error?.data === 'string' ? error.data : '') ||
    'Failed to add product. Please try again.'

  return (
    <AdminShell
      activeSection='create-product'
      eyebrow='Sales Management System Dashboard'
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      styles={styles}
      subtitle='Create a product with name and available quantity.'
      themeButtonLabel={themeButtonLabel}
      title='Add Product'
    >
      <div className='max-w-3xl'>
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

              <div>
                <label className={styles.labelText} htmlFor='product-price'>
                  Unit Price
                </label>
                <input
                  className={styles.input}
                  id='product-price'
                  min='0'
                  name='price'
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder='e.g. 250.00'
                  step='0.01'
                  type='number'
                  value={price}
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
    </AdminShell>
  )
}

export default AddProduct
