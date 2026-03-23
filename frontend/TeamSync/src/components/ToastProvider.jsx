import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext({ addToast: () => {} })

const TOAST_STYLES = {
  success: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
  error: 'border-rose-400/40 bg-rose-500/15 text-rose-100',
  info: 'border-slate-400/30 bg-slate-800/80 text-slate-100',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (message, options = {}) => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
      const toast = {
        id,
        message,
        title: options.title,
        type: options.type || 'info',
        duration: options.duration || 4000,
      }
      setToasts((prev) => [...prev, toast])
      if (toast.duration > 0) {
        window.setTimeout(() => removeToast(id), toast.duration)
      }
      return id
    },
    [removeToast],
  )

  const value = useMemo(() => ({ addToast }), [addToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className='fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-3'>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${TOAST_STYLES[toast.type] || TOAST_STYLES.info}`}
          >
            <div className='flex items-start justify-between gap-3'>
              <div>
                {toast.title ? <p className='text-sm font-semibold'>{toast.title}</p> : null}
                <p className='text-sm'>{toast.message}</p>
              </div>
              <button
                className='text-xs uppercase tracking-wide text-slate-200/70'
                onClick={() => removeToast(toast.id)}
                type='button'
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
