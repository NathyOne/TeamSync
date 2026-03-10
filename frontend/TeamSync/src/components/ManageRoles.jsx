import { useMemo, useState } from 'react'
import {
  useDeleteUserMutation,
  useGetSalesAssignmentsQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '../services/api'

const ROLE_SECTIONS = [
  {
    key: 'SALES',
    label: 'Sales',
    badgeLabel: 'Good Sales',
  },
  {
    key: 'MARKETING',
    label: 'Marketing',
    badgeLabel: 'Good Marketing',
  },
  {
    key: 'CUSTOMER_SUPPORT',
    label: 'Customer Support',
    badgeLabel: 'Good Support',
  },
]

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SALES', label: 'Sales' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'CUSTOMER_SUPPORT', label: 'Customer Support' },
]

const calculateYears = (createdAt) => {
  if (!createdAt) {
    return null
  }
  const createdDate = new Date(createdAt)
  if (Number.isNaN(createdDate.getTime())) {
    return null
  }
  const diffMs = Date.now() - createdDate.getTime()
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25)
  return Math.max(0, Number(years.toFixed(1)))
}

function ManageRoles({ styles, accentClass = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [roleEdits, setRoleEdits] = useState({})
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const { data: usersData, error, isLoading, isFetching } = useGetUsersQuery()
  const { data: assignmentsData } = useGetSalesAssignmentsQuery()
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()

  const users = useMemo(() => {
    const list = Array.isArray(usersData) ? usersData : usersData?.results || []
    return list.filter((user) => user.role && String(user.role).toUpperCase() !== 'ADMIN')
  }, [usersData])

  const salesTotals = useMemo(() => {
    const list = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData?.results || []
    const totals = new Map()

    list.forEach((assignment) => {
      const id = String(assignment.salesperson)
      const current = totals.get(id) || 0
      totals.set(id, current + Number(assignment.total_assigned || 0))
    })

    return totals
  }, [assignmentsData])

  const groupedUsers = useMemo(() => {
    const groups = {}
    ROLE_SECTIONS.forEach((section) => {
      groups[section.key] = []
    })

    users.forEach((user) => {
      const roleKey = String(user.role || '').toUpperCase()
      if (groups[roleKey]) {
        groups[roleKey].push(user)
      }
    })

    return groups
  }, [users])

  const handleRoleChange = (userId, value) => {
    setRoleEdits((prev) => ({ ...prev, [userId]: value }))
  }

  const handleUpdateRole = async (user) => {
    setActionMessage('')
    setActionError('')
    const nextRole = roleEdits[user.id] || user.role

    if (!nextRole || String(nextRole).toUpperCase() === String(user.role).toUpperCase()) {
      setActionError('Select a different role before updating.')
      return
    }

    try {
      await updateUser({ id: user.id, role: String(nextRole).toUpperCase() }).unwrap()
      setActionMessage(`Updated ${user.email} to ${nextRole}.`)
    } catch (apiError) {
      const message =
        apiError?.data?.detail ||
        (typeof apiError?.data === 'string' ? apiError.data : '') ||
        'Failed to update role.'
      setActionError(message)
    }
  }

  const handleDeleteUser = async (user) => {
    setActionMessage('')
    setActionError('')

    const confirmed = window.confirm(`Delete ${user.email}? This cannot be undone.`)
    if (!confirmed) {
      return
    }

    try {
      await deleteUser(user.id).unwrap()
      setActionMessage(`Deleted ${user.email}.`)
    } catch (apiError) {
      const message =
        apiError?.data?.detail ||
        (typeof apiError?.data === 'string' ? apiError.data : '') ||
        'Failed to delete user.'
      setActionError(message)
    }
  }

  const isBusy = isUpdating || isDeleting

  return (
    <div className={`mt-8 ${styles.panelWrap} ${accentClass}`}>
      <div className={styles.actionInner}>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className={`text-sm uppercase tracking-[0.28em] ${styles.eyebrow}`}>Manage Roles</p>
            <h2 className='mt-2 text-2xl font-semibold'>Team Access</h2>
            <p className={`mt-1 ${styles.dashboardSubtext}`}>
              View staff by role, award badges, and update access.
            </p>
          </div>
          <button
            className={styles.utilityButton}
            onClick={() => setIsOpen((prev) => !prev)}
            type='button'
          >
            {isOpen ? 'Hide Users' : 'View Users'}
          </button>
        </div>

        {isOpen ? (
          <div className='mt-6 space-y-6'>
            {ROLE_SECTIONS.map((section) => {
              const sectionUsers = groupedUsers[section.key] || []

              return (
                <div key={section.key} className='rounded-2xl border border-white/10 p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-semibold'>{section.label}</h3>
                      <p className='text-sm text-slate-400'>Total: {sectionUsers.length}</p>
                    </div>
                    {isFetching ? <span className='text-sm text-slate-400'>Refreshing...</span> : null}
                  </div>

                  {isLoading ? (
                    <p className='mt-3 text-sm text-slate-400'>Loading users...</p>
                  ) : sectionUsers.length === 0 ? (
                    <p className='mt-3 text-sm text-slate-400'>No users in this role.</p>
                  ) : (
                    <div className='mt-4 space-y-3'>
                      {sectionUsers.map((user) => {
                        const yearsServed = calculateYears(user.created_at)
                        const badgeText = section.badgeLabel
                        const hasSalesBadge =
                          section.key === 'SALES' && (salesTotals.get(String(user.id)) || 0) >= 10

                        return (
                          <div
                            key={user.id}
                            className='flex flex-col gap-3 rounded-xl border border-white/10 p-3 md:flex-row md:items-center md:justify-between'
                          >
                            <div>
                              <p className='font-semibold'>{user.email}</p>
                              <p className='text-xs text-slate-400'>
                                Years served:{' '}
                                {yearsServed === null ? 'N/A' : `${yearsServed} years`}
                              </p>
                              <div className='mt-2 flex flex-wrap gap-2'>
                                <span className='rounded-full bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-200'>
                                  {badgeText}
                                </span>
                                {section.key === 'SALES' ? (
                                  <span className='rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200'>
                                    {hasSalesBadge ? 'Top Sales' : 'Rising Sales'}
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                              <select
                                className={styles.input}
                                onChange={(event) => handleRoleChange(user.id, event.target.value)}
                                value={roleEdits[user.id] || user.role}
                              >
                                {ROLE_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                className={styles.utilityButton}
                                disabled={isBusy}
                                onClick={() => handleUpdateRole(user)}
                                type='button'
                              >
                                Change Role
                              </button>
                              <button
                                className={styles.utilityButton}
                                disabled={isBusy}
                                onClick={() => handleDeleteUser(user)}
                                type='button'
                              >
                                Delete User
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {actionError ? <p className='text-sm text-rose-500'>{actionError}</p> : null}
            {actionMessage ? <p className='text-sm text-emerald-500'>{actionMessage}</p> : null}
          </div>
        ) : null}

        {!isOpen && error ? (
          <p className='mt-3 text-sm text-rose-500'>Failed to load users.</p>
        ) : null}
      </div>
    </div>
  )
}

export default ManageRoles
