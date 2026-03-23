// BASE_URL = 'http://127.0.0.1:9000/teamsync'
const fallbackApiBase = 'http://localhost:9000/teamsync'
const fallbackAuthBase = 'http://localhost:9000/auth'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || fallbackApiBase).replace(/\/$/, '')
export const AUTH_BASE_URL = (import.meta.env.VITE_AUTH_BASE_URL || fallbackAuthBase).replace(/\/$/, '')

export const JWT_LOGIN_URL =
  import.meta.env.VITE_JWT_LOGIN_URL || `${AUTH_BASE_URL}/jwt/create/`
export const ACCESS_TOKEN_KEY =
  import.meta.env.VITE_ACCESS_TOKEN_KEY
export const REFRESH_TOKEN_KEY =
  import.meta.env.VITE_REFRESH_TOKEN_KEY
export const USER_BADGE_KEY = 'teamsync-user-badge'

export const BACKEND_ROLE_TO_APP_ROLE = {
  ADMIN: 'admin',
  SALES: 'sales',
  MARKETING: 'marketing',
  CUSTOMER_SUPPORT: 'support',
}

export const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    path: '/admin',
    accent: 'from-cyan-500 to-blue-500',
    panel: 'from-cyan-500/15 to-blue-500/20',
    headline: 'Control center for teams, access, and company-level decisions.',
    stats: [
      { label: 'Active Users', value: '238' },
      { label: 'Open Tickets', value: '31' },
      { label: 'Monthly Revenue', value: '$48.2k' },
    ],
    actions: ['Manage roles', 'Review audit logs', 'Approve budget requests'],
  },
  sales: {
    label: 'Sales',
    path: '/sales',
    accent: 'from-emerald-500 to-teal-500',
    panel: 'from-emerald-500/15 to-teal-500/20',
    headline: 'Track leads, pipeline movement, and closed opportunities.',
    stats: [
      { label: 'Leads Today', value: '17' },
      { label: 'Pipeline Value', value: '$126k' },
      { label: 'Deals Closed', value: '8' },
    ],
    actions: ['Create quote', 'Log follow-up', 'View conversion trends'],
  },
  support: {
    label: 'Customer Support',
    path: '/support',
    accent: 'from-amber-500 to-orange-500',
    panel: 'from-amber-500/15 to-orange-500/20',
    headline: 'Resolve customer issues quickly and maintain response SLAs.',
    stats: [
      { label: 'Tickets in Queue', value: '42' },
      { label: 'Avg Response', value: '11 min' },
      { label: 'Satisfaction', value: '96%' },
    ],
    actions: ['Open inbox', 'Escalate issue', 'Review satisfaction comments'],
  },
  marketing: {
    label: 'Marketing',
    path: '/marketing',
    accent: 'from-rose-500 to-pink-500',
    panel: 'from-rose-500/15 to-pink-500/20',
    headline: 'Launch campaigns, measure engagement, and optimize spend.',
    stats: [
      { label: 'Campaigns Live', value: '6' },
      { label: 'CTR', value: '4.8%' },
      { label: 'Monthly Spend', value: '$9.4k' },
    ],
    actions: ['Create campaign', 'Publish newsletter', 'Analyze attribution'],
  },
}



export const ROLE_ORDER = ['admin', 'sales', 'support', 'marketing']

export const SESSION_KEY = 'teamsync-role'
export const THEME_KEY = 'teamsync-theme'

export const THEME_CLASSES = {
  dark: {
    loginPage:
      'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100',
    loginCard: 'rounded-3xl border border-slate-800 bg-white/5 p-8 shadow-2xl backdrop-blur',
    sideCard: 'rounded-3xl border border-slate-800 bg-slate-900/50 p-8',
    mutedText: 'text-slate-300',
    labelText: 'mb-2 block text-sm text-slate-300',
    input:
      'w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 outline-none ring-emerald-400 transition focus:ring-2',
    credentialCard: 'rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-lg',
    errorCard: 'rounded-xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200',
    utilityButton:
      'rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800',
    dashboardPage: 'min-h-screen bg-slate-950 px-4 py-10 text-slate-100',
    dashboardHeader:
      'rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl',
    eyebrow: 'text-slate-400',
    dashboardSubtext: 'text-slate-300',
    panelWrap: 'rounded-3xl border border-slate-800 bg-gradient-to-r p-6',
    statCard: 'rounded-2xl border border-white/10 bg-black/20 p-4',
    statLabel: 'text-sm text-slate-200',
    actionInner: 'rounded-2xl bg-slate-900/90 p-4',
    actionSubtext: 'mt-1 text-sm text-slate-400',
  },
  light: {
    loginPage:
      'min-h-screen bg-gradient-to-br from-slate-100 via-white to-emerald-100 px-4 py-10 text-slate-900',
    loginCard: 'rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur',
    sideCard: 'rounded-3xl border border-slate-200 bg-white/80 p-8',
    mutedText: 'text-slate-600',
    labelText: 'mb-2 block text-sm text-slate-700',
    input:
      'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none ring-emerald-500 transition focus:ring-2',
    credentialCard: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-md',
    errorCard: 'rounded-xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm text-rose-700',
    utilityButton:
      'rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100',
    dashboardPage:
      'min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-10 text-slate-900',
    dashboardHeader:
      'rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl',
    eyebrow: 'text-slate-500',
    dashboardSubtext: 'text-slate-600',
    panelWrap: 'rounded-3xl border border-slate-200 bg-gradient-to-r p-6',
    statCard: 'rounded-2xl border border-slate-200 bg-white/70 p-4',
    statLabel: 'text-sm text-slate-600',
    actionInner: 'rounded-2xl bg-white/90 p-4',
    actionSubtext: 'mt-1 text-sm text-slate-600',
  },
}
