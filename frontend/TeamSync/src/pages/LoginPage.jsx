import { useState } from 'react'

function LoginPage({ onLogin, onToggleTheme, styles, themeButtonLabel }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    const result = await onLogin({ email, password })

    if (result?.ok) {
      setError('')
      setIsSubmitting(false)
      return
    }

    setError(result?.error || 'Login failed.')
    setIsSubmitting(false)
  }

  return (
    <div className={styles.loginPage}>
      <div className='mx-auto grid w-full max-w-3xl gap-8'>
        <section className={styles.loginCard}>
          <div className='flex items-center justify-between gap-3'>
            <p className='text-sm uppercase tracking-[0.3em] text-emerald-400'>Sales Management System</p>
            <button className={styles.utilityButton} onClick={onToggleTheme} type='button'>
              {themeButtonLabel}
            </button>
          </div>

          <h1 className='mt-4 text-4xl font-bold leading-tight'>
            Login
            {/* <span className='block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent'>
              Dummy Access Only
            </span> */}
          </h1>
          <p className={`mt-5 ${styles.mutedText}`}>
            Sign in and make your job easier.
          </p>

          <form className='mt-8 space-y-4' onSubmit={handleSubmit}>
            <label className='block'>
              <span className={styles.labelText}>Email</span>
              <input
                className={styles.input}
                placeholder='Enter email'
                type='email'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className='block'>
              <span className={styles.labelText}>Password</span>
              <input
                className={styles.input}
                type='password'
                placeholder='Enter password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error ? <p className={styles.errorCard}>{error}</p> : null}

            <button
              className='w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70'
              disabled={isSubmitting}
              type='submit'
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
