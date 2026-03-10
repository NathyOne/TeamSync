import { useContext } from 'react'
import AppSessionContext from '../context/appSessionContextValue'

function useAppSession() {
  const context = useContext(AppSessionContext)

  if (!context) {
    throw new Error('useAppSession must be used inside AppSessionProvider')
  }

  return context
}

export default useAppSession
