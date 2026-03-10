import { useMemo, useState } from 'react'
import { useGetProductsQuery } from '../services/api'

function ProductList({ className = '', variant = 'card', title = 'Products' }) {
  const { data, error, isLoading, isFetching } = useGetProductsQuery()
  const [selectedProductId, setSelectedProductId] = useState('')

  const products = Array.isArray(data) ? data : data?.results || []
  const availableProducts = useMemo(
    () => products.filter((product) => Number(product.quantity) > 0),
    [products],
  )
  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === String(selectedProductId)),
    [products, selectedProductId],
  )
  const wrapperClass =
    variant === 'card' ? 'rounded-xl border border-gray-200 bg-white p-4' : ''

  if (isLoading) {
    return <p className='p-4'>Loading products...</p>
  }

  if (error) {
    return (
      <div className='p-4 text-red-600'>
        <p>Failed to load products.</p>
        <p className='text-sm'>Check backend is running on http://localhost:9000</p>
      </div>
    )
  }

  if (availableProducts.length === 0) {
    return <p className='p-4'>No available products.</p>
  }

  return (
    <div className={`${wrapperClass} ${className}`.trim()}>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>{title}</h2>
        {isFetching ? <span className='text-sm text-gray-500'>Refreshing...</span> : null}
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        {availableProducts.map((product) => {
          const isSelected = String(product.id) === String(selectedProductId)
          const isLowStock =
            Number(product.reorder_threshold) >= 0 &&
            Number(product.quantity) <= Number(product.reorder_threshold)
          return (
            <button
              key={product.id}
              className={`flex items-center justify-between rounded-md border px-3 py-2 text-left transition ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-50'
                  : 'border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/60'
              }`}
              onClick={() => setSelectedProductId(product.id)}
              type='button'
            >
              <div>
                <p className='font-medium'>{product.name}</p>
                <p className='text-xs text-gray-500'>Available: {product.quantity}</p>
                {isLowStock ? <p className='text-xs text-amber-600'>Low stock</p> : null}
              </div>
              <span className='text-xs font-semibold uppercase text-gray-400'>View</span>
            </button>
          )
        })}
      </div>

      {selectedProduct ? (
        <div className='mt-4 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-gray-700'>
          <span className='font-semibold'>Selected:</span> {selectedProduct.name} — Available{' '}
          {selectedProduct.quantity}
        </div>
      ) : (
        <p className='mt-4 text-sm text-gray-500'>Click a product to view details.</p>
      )}
    </div>
  )
}

export default ProductList
