import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminStore } from '../stores/adminStore'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { api } from '../services/api'
import { useToast } from '../stores/toastStore'
import type { AdminStats, Integration, SupportTicket, SystemLogEntry } from '../types/admin'

type Tab = 'dashboard' | 'integrations' | 'tickets' | 'logs'

const INTEGRATION_STATUSES = ['ACTIVE', 'INACTIVE', 'ERROR'] as const
const INTEGRATION_TYPES = ['vision', 'chat', 'data', 'other'] as const

type IntegrationForm = {
  open: boolean; edit: Integration | null
  key: string; name: string; type: string
  description: string; baseUrl: string; apiKey: string; status: string
}

const emptyForm = (): IntegrationForm => ({
  open: false, edit: null, key: '', name: '', type: 'other',
  description: '', baseUrl: '', apiKey: '', status: 'INACTIVE',
})

const TAB_CONFIG: { key: Tab; label: string; icon: string }[] = [
  {
    key: 'dashboard', label: 'Dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    key: 'integrations', label: 'Integrations',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  },
  {
    key: 'tickets', label: 'Tickets',
    icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  },
  {
    key: 'logs', label: 'Logs',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
]

export function AdminPage() {
  const navigate = useNavigate()
  const { admin, logout } = useAdminStore()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [logs, setLogs] = useState<SystemLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [integrationForm, setIntegrationForm] = useState<IntegrationForm>(emptyForm())
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    if (!admin) navigate('/admin/login', { replace: true })
  }, [admin, navigate])

  const loadTab = useCallback(async (t: Tab) => {
    setLoading(true)
    setTab(t)
    try {
      const data = await Promise.all([
        t === 'dashboard' ? api.admin.stats() : Promise.resolve(null),
        t === 'integrations' ? api.admin.integrations() : Promise.resolve(null),
        t === 'tickets' ? api.admin.tickets() : Promise.resolve(null),
        t === 'logs' ? api.admin.logs() : Promise.resolve(null),
      ])
      if (data[0]) setStats(data[0] as AdminStats)
      if (data[1]) setIntegrations(data[1] as Integration[])
      if (data[2]) setTickets(data[2] as SupportTicket[])
      if (data[3]) setLogs(data[3] as SystemLogEntry[])
    } catch (e) { toast.error(String(e)) }
    setLoading(false)
  }, [])

  const initRef = useRef(false)
  useEffect(() => {
    if (!initRef.current) { initRef.current = true; loadTab('dashboard') }
  }, [loadTab])

  const handleLogout = () => { logout(); navigate('/admin/login', { replace: true }) }

  const openCreateForm = () =>
    setIntegrationForm({ open: true, edit: null, key: '', name: '', type: 'other', description: '', baseUrl: '', apiKey: '', status: 'INACTIVE' })

  const openEditForm = (i: Integration) =>
    setIntegrationForm({ open: true, edit: i, key: i.key, name: i.name, type: i.type, description: i.description || '', baseUrl: i.baseUrl || '', apiKey: i.apiKey || '', status: i.status })

  const saveIntegration = async () => {
    try {
      const f = integrationForm
      if (f.edit) {
        await api.admin.updateIntegration(f.edit.id, { name: f.name, type: f.type, description: f.description || null, baseUrl: f.baseUrl || null, apiKey: f.apiKey || null, status: f.status })
        toast.success('Integration updated')
      } else {
        await api.admin.createIntegration({ key: f.key, name: f.name, type: f.type, description: f.description || undefined, baseUrl: f.baseUrl || undefined, apiKey: f.apiKey || undefined, status: f.status })
        toast.success('Integration created')
      }
      setIntegrationForm(emptyForm())
      loadTab('integrations')
    } catch (e) { toast.error(String(e)) }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.admin.deleteIntegration(deleteTarget.id)
      toast.success(`"${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
      loadTab('integrations')
    } catch (e) { toast.error(String(e)) }
  }

  const toggleIntegration = async (id: string, current: string) => {
    try {
      const next = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      await api.admin.updateIntegration(id, { status: next })
      toast.info(`Integration ${next.toLowerCase()}`)
      loadTab('integrations')
    } catch (e) { toast.error(String(e)) }
  }

  const testIntegration = async (id: string) => {
    try {
      const result = await api.admin.testIntegration(id)
      toast.success(result.message, 'Test passed')
      loadTab('integrations')
    } catch (e) { toast.error(String(e), 'Test failed') }
  }

  const updateTicket = async (id: string, data: Record<string, string>) => {
    try {
      await api.admin.updateTicket(id, data)
      toast.success('Ticket updated')
      loadTab('tickets')
    } catch (e) { toast.error(String(e)) }
  }

  const runSeed = async () => {
    try {
      await api.admin.seed()
      toast.success('Seed data created')
      loadTab('dashboard')
    } catch (e) { toast.error(String(e)) }
  }

  if (!admin) return null

  return (
    <div className="min-h-screen" style={{ background: '#0b0b12' }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: 'rgba(11,11,18,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #e03030, #8b0e0e)' }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">Admin Console</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{admin.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => navigate('/')}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-white/5">
              ← App
            </button>
            <button onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-red-500/10">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">

        {/* ── Sidebar nav — desktop ─────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-1 w-44 shrink-0 pt-1">
          {TAB_CONFIG.map(t => (
            <button
              key={t.key}
              onClick={() => loadTab(t.key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
                          transition-all cursor-pointer text-left
                          ${tab === t.key
                            ? 'bg-pokedex-red/15 text-white border border-pokedex-red/20'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
              </svg>
              {t.label}
            </button>
          ))}

          <div className="mt-auto pt-6 border-t border-white/[0.06]">
            <button onClick={runSeed}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-400
                         hover:bg-white/5 transition-all cursor-pointer w-full">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-seed data
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Mobile tab strip */}
          <div className="flex lg:hidden gap-1 mb-5 overflow-x-auto scrollbar-hide pb-1">
            {TAB_CONFIG.map(t => (
              <button
                key={t.key}
                onClick={() => loadTab(t.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                            transition-all cursor-pointer
                            ${tab === t.key
                              ? 'bg-pokedex-red/15 text-white border border-pokedex-red/20'
                              : 'text-gray-500 hover:text-gray-300 bg-white/[0.04] border border-white/[0.06]'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                </svg>
                {t.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-6 h-6 border-2 border-white/10 border-t-pokedex-red rounded-full animate-spin" />
            </div>
          )}

          <AnimatePresence mode="wait">
            {!loading && (
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >

                {/* ── Dashboard ──────────────────────────────────────────── */}
                {tab === 'dashboard' && stats && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <StatCard label="Total Users" value={stats.users} accent="#3b82f6"
                        icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      <StatCard label="Pokémon" value={stats.pokemon} accent="#22c55e"
                        icon="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm0 3a5 5 0 100 10A5 5 0 0012 7zm0 2a3 3 0 110 6 3 3 0 010-6z" />
                      <StatCard label="Scans" value={stats.scans} accent="#f59e0b"
                        icon="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      <StatCard label="Open Tickets" value={stats.openTickets} accent="#a855f7"
                        icon="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <IntegrationStatusChart integrations={stats.integrations || []} />

                      {/* Quick actions card */}
                      <div className="rounded-2xl border border-white/[0.07] p-5"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Actions</p>
                        <div className="space-y-2">
                          <button onClick={() => loadTab('integrations')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07]
                                       border border-white/[0.06] text-sm text-gray-300 transition-all cursor-pointer text-left">
                            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Manage Integrations
                          </button>
                          <button onClick={() => loadTab('tickets')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07]
                                       border border-white/[0.06] text-sm text-gray-300 transition-all cursor-pointer text-left">
                            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            Review Tickets
                          </button>
                          <button onClick={runSeed}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07]
                                       border border-white/[0.06] text-sm text-gray-300 transition-all cursor-pointer text-left">
                            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Re-seed Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Integrations ───────────────────────────────────────── */}
                {tab === 'integrations' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-base font-bold text-white">Integrations</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{integrations.length} configured</p>
                      </div>
                      <button onClick={openCreateForm}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white
                                   transition-colors cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #e03030, #b01515)', boxShadow: '0 2px 10px rgba(192,26,26,0.3)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </button>
                    </div>

                    {integrations.length === 0 && <EmptyState message="No integrations configured" />}

                    {integrations.map(i => (
                      <div key={i.id}
                        className="rounded-2xl border border-white/[0.07] overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        {/* Status stripe */}
                        <div className={`h-0.5 ${i.status === 'ACTIVE' ? 'bg-green-500' : i.status === 'ERROR' ? 'bg-red-500' : 'bg-gray-700'}`} />

                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0
                              ${i.status === 'ACTIVE' ? 'bg-green-500 shadow-sm shadow-green-500/40' :
                                i.status === 'ERROR' ? 'bg-red-500 shadow-sm shadow-red-500/40' : 'bg-gray-600'}`} />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <p className="font-semibold text-white">{i.name}</p>
                                <span className="font-mono text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">{i.key}</span>
                                <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-500">{i.type}</span>
                                <StatusPill status={i.status} />
                              </div>
                              {i.description && <p className="text-sm text-gray-400">{i.description}</p>}
                              {i.baseUrl && <p className="text-xs font-mono text-gray-600 mt-1 truncate">{i.baseUrl}</p>}
                              {i.lastChecked && (
                                <p className="text-[10px] text-gray-700 mt-1.5">
                                  Last checked: {new Date(i.lastChecked).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action bar */}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                            <button onClick={() => testIntegration(i.id)}
                              className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/15
                                         font-semibold cursor-pointer transition-colors">
                              Test
                            </button>
                            <button onClick={() => toggleIntegration(i.id, i.status)}
                              className={`text-xs px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors
                                ${i.status === 'ACTIVE'
                                  ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/15'
                                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/15'}`}>
                              {i.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                            </button>
                            <div className="flex-1" />
                            <button onClick={() => openEditForm(i)}
                              className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer transition-colors px-2 py-1">
                              Edit
                            </button>
                            <button onClick={() => setDeleteTarget({ id: i.id, name: i.name })}
                              className="text-xs text-red-500/60 hover:text-red-400 cursor-pointer transition-colors px-2 py-1">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Tickets ────────────────────────────────────────────── */}
                {tab === 'tickets' && (
                  <div className="space-y-3">
                    <div className="mb-4">
                      <h2 className="text-base font-bold text-white">Support Tickets</h2>
                      <p className="text-xs text-gray-500 mt-0.5">{tickets.filter(t => t.status === 'OPEN').length} open</p>
                    </div>

                    {tickets.length === 0 && <EmptyState message="No support tickets" />}

                    {tickets.map(t => {
                      const priorityColor = t.priority === 'CRITICAL' ? '#ef4444' :
                        t.priority === 'HIGH' ? '#f97316' :
                        t.priority === 'MEDIUM' ? '#f59e0b' : '#6b7280'

                      return (
                        <div key={t.id}
                          className="rounded-2xl border border-white/[0.07] overflow-hidden"
                          style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <div className="h-0.5" style={{ background: priorityColor + '80' }} />
                          <div className="p-4">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-white">{t.subject}</p>
                                  <TicketStatusPill status={t.status} />
                                  {t.priority && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider"
                                      style={{ color: priorityColor }}>
                                      {t.priority}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5">by {t.user.username}</p>
                              </div>
                            </div>

                            <p className="text-sm text-gray-400 leading-relaxed">{t.description}</p>

                            {t.response && (
                              <div className="mt-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Response</p>
                                <p className="text-sm text-gray-400 italic">{t.response}</p>
                              </div>
                            )}

                            {t.status !== 'CLOSED' && (
                              <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                                {t.status === 'OPEN' && (
                                  <button onClick={() => updateTicket(t.id, { status: 'IN_PROGRESS' })}
                                    className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400
                                               hover:bg-blue-500/15 font-semibold cursor-pointer transition-colors">
                                    Start
                                  </button>
                                )}
                                {t.status === 'IN_PROGRESS' && (
                                  <button onClick={() => updateTicket(t.id, { status: 'RESOLVED' })}
                                    className="text-xs px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400
                                               hover:bg-green-500/15 font-semibold cursor-pointer transition-colors">
                                    Resolve
                                  </button>
                                )}
                                <button onClick={() => updateTicket(t.id, { status: 'CLOSED' })}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-gray-500
                                             hover:bg-white/[0.08] hover:text-gray-300 font-semibold cursor-pointer transition-colors">
                                  Close
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* ── Logs ───────────────────────────────────────────────── */}
                {tab === 'logs' && (
                  <div>
                    <div className="mb-4">
                      <h2 className="text-base font-bold text-white">System Logs</h2>
                      <p className="text-xs text-gray-500 mt-0.5">{logs.length} entries</p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden font-mono text-xs"
                      style={{ background: 'rgba(0,0,0,0.4)' }}>
                      {logs.length === 0 && <p className="text-gray-600 p-8 text-center text-sm font-sans">No logs</p>}
                      {logs.map((l, i) => (
                        <div key={l.id}
                          className={`px-4 py-2.5 flex items-start gap-3 hover:bg-white/[0.03] transition-colors
                            ${i < logs.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                          <span className={`w-10 shrink-0 font-bold text-[10px] uppercase tracking-widest
                            ${l.level === 'ERROR' ? 'text-red-400' :
                              l.level === 'WARN' ? 'text-amber-400' :
                              l.level === 'INFO' ? 'text-blue-400' : 'text-gray-600'}`}>
                            {l.level}
                          </span>
                          <span className="text-gray-700 shrink-0 tabular-nums">
                            {new Date(l.createdAt).toLocaleTimeString()}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-300">{l.action}</span>
                            {l.detail && <p className="text-gray-600 mt-0.5 text-[11px]">{l.detail}</p>}
                            {l.user && <p className="text-gray-700 mt-0.5 text-[11px]">by {l.user.username}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Integration modal ────────────────────────────────────────────── */}
      <Modal open={integrationForm.open} onClose={() => setIntegrationForm(emptyForm())}>
        <div className="p-5 space-y-4">
          <h3 className="font-bold text-base text-white">
            {integrationForm.edit ? 'Edit Integration' : 'Add Integration'}
          </h3>
          <div className="space-y-3">
            {!integrationForm.edit && (
              <DarkInput label="Key" value={integrationForm.key} placeholder="e.g. my-api"
                onChange={v => setIntegrationForm(f => ({ ...f, key: v }))} />
            )}
            <DarkInput label="Name" value={integrationForm.name} placeholder="My API"
              onChange={v => setIntegrationForm(f => ({ ...f, name: v }))} />
            <DarkSelect label="Type" value={integrationForm.type}
              options={INTEGRATION_TYPES.map(t => ({ value: t, label: t }))}
              onChange={v => setIntegrationForm(f => ({ ...f, type: v }))} />
            <DarkInput label="Description" value={integrationForm.description} placeholder="Optional description"
              onChange={v => setIntegrationForm(f => ({ ...f, description: v }))} />
            <DarkInput label="Base URL" value={integrationForm.baseUrl} placeholder="https://api.example.com/v2"
              onChange={v => setIntegrationForm(f => ({ ...f, baseUrl: v }))} />
            <DarkInput label="API Key" value={integrationForm.apiKey} placeholder="sk-..." type="password"
              onChange={v => setIntegrationForm(f => ({ ...f, apiKey: v }))} />
            <DarkSelect label="Status" value={integrationForm.status}
              options={INTEGRATION_STATUSES.map(s => ({ value: s, label: s }))}
              onChange={v => setIntegrationForm(f => ({ ...f, status: v }))} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIntegrationForm(emptyForm())}>Cancel</Button>
            <Button size="sm" onClick={saveIntegration}
              disabled={!integrationForm.name || (!integrationForm.edit && !integrationForm.key)}>
              {integrationForm.edit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete confirm modal ─────────────────────────────────────────── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-white">Delete Integration</h3>
              <p className="text-xs text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Delete <strong className="text-white">{deleteTarget?.name}</strong>?
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, accent, icon }: { label: string; value: number; accent: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: accent + '18' }}>
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
      <p className="text-2xl font-black tabular-nums text-white leading-none mb-1">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  )
}

function IntegrationStatusChart({ integrations }: { integrations: { status: string }[] }) {
  const active = integrations.filter(i => i.status === 'ACTIVE').length
  const error = integrations.filter(i => i.status === 'ERROR').length
  const inactive = integrations.filter(i => i.status === 'INACTIVE').length
  const total = integrations.length || 1
  const circumference = 2 * Math.PI * 15.5
  const activeArc = (active / total) * circumference
  const errorOffset = -(active / total) * circumference

  return (
    <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Integration Health</p>
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#22c55e" strokeWidth="3"
              strokeDasharray={`${activeArc} ${circumference}`} strokeLinecap="round" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ef4444" strokeWidth="3"
              strokeDasharray={`${(error / total) * circumference} ${circumference}`}
              strokeDashoffset={`${errorOffset}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-black text-white tabular-nums">{active}</span>
          </div>
        </div>
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-gray-400">{active} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-600 shrink-0" />
            <span className="text-gray-400">{inactive} Inactive</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-gray-400">{error} Error</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const cfg = status === 'ACTIVE'
    ? 'bg-green-500/10 text-green-400 border-green-500/20'
    : status === 'ERROR'
    ? 'bg-red-500/10 text-red-400 border-red-500/20'
    : 'bg-white/5 text-gray-500 border-white/10'
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${cfg}`}>
      {status}
    </span>
  )
}

function TicketStatusPill({ status }: { status: string }) {
  const cfg = status === 'OPEN'
    ? 'bg-yellow-500/10 text-yellow-400'
    : status === 'IN_PROGRESS'
    ? 'bg-blue-500/10 text-blue-400'
    : status === 'RESOLVED'
    ? 'bg-green-500/10 text-green-400'
    : 'bg-white/5 text-gray-500'
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${cfg}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] border-dashed p-10 text-center">
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  )
}

function DarkInput({ label, value, onChange, placeholder, type }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">{label}</label>
      <input type={type || 'text'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full text-sm bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white
                   placeholder-gray-700 focus:outline-none focus:border-pokedex-red/30 transition-colors" />
    </div>
  )
}

function DarkSelect({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full text-sm bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white
                   cursor-pointer focus:outline-none focus:border-pokedex-red/30 transition-colors">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
