import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeviceShell } from '../components/device/DeviceShell'
import { TopScreen } from '../components/device/TopScreen'
import { BottomScreen } from '../components/device/BottomScreen'
import { Button } from '../components/ui/Button'
import { api } from '../services/api'
import { useUserStore } from '../stores/userStore'
import type { AdminStats, Integration, SupportTicket, AdminUser, SystemLogEntry } from '../types/admin'

type Tab = 'dashboard' | 'integrations' | 'tickets' | 'users' | 'logs'

export function AdminPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [logs, setLogs] = useState<SystemLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (user?.role !== 'ADMIN') { navigate('/home') }
  }, [user, navigate])

  const loadTab = useCallback(async (t: Tab) => {
    setLoading(true)
    setTab(t)
    setMsg('')
    try {
      const data = await Promise.all([
        t === 'dashboard' ? api.admin.stats() : Promise.resolve(null),
        t === 'integrations' ? api.admin.integrations() : Promise.resolve(null),
        t === 'tickets' ? api.admin.tickets() : Promise.resolve(null),
        t === 'users' ? api.admin.users() : Promise.resolve(null),
        t === 'logs' ? api.admin.logs() : Promise.resolve(null),
      ])
      if (data[0]) setStats(data[0] as AdminStats)
      if (data[1]) setIntegrations(data[1] as Integration[])
      if (data[2]) setTickets(data[2] as SupportTicket[])
      if (data[3]) setAdminUsers(data[3] as AdminUser[])
      if (data[4]) setLogs(data[4] as SystemLogEntry[])
    } catch (e) { setMsg(String(e)) }
    setLoading(false)
  }, [])

  const toggleIntegration = async (id: string, current: string) => {
    await api.admin.updateIntegration(id, { status: current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })
    loadTab('integrations')
  }

  const updateTicket = async (id: string, data: Record<string, string>) => {
    await api.admin.updateTicket(id, data)
    loadTab('tickets')
  }

  const updateUserRole = async (id: string, role: string) => {
    await api.admin.updateUserRole(id, role)
    loadTab('users')
  }

  const runSeed = async () => {
    await api.admin.seed()
    setMsg('Seed data created')
    loadTab('dashboard')
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'integrations', label: 'Integrations' },
    { key: 'tickets', label: 'Tickets' },
    { key: 'users', label: 'Users' },
    { key: 'logs', label: 'Logs' },
  ]

  return (
    <>
      <DeviceShell
        ledStatus="yellow"
        topScreen={
          <TopScreen>
            <div className="text-center w-full">
              <p className="text-sm font-bold text-pokedex-amber tracking-wider uppercase">Admin Panel</p>
              <p className="dex-mono-label mt-0.5">System Management</p>
            </div>
          </TopScreen>
        }
        bottomScreen={
          <BottomScreen>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1 border-b border-cream pb-2">
                {tabs.map(t => (
                  <button key={t.key} onClick={() => loadTab(t.key)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer
                      ${tab === t.key ? 'bg-charcoal text-white' : 'text-gray-500 hover:bg-cream'}`}
                  >{t.label}</button>
                ))}
              </div>

              {msg && <p className="text-xs text-pokedex-amber text-center">{msg}</p>}
              {loading && <p className="dex-empty not-italic">Loading...</p>}

              {!loading && tab === 'dashboard' && stats && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard label="Users" value={stats.users} />
                    <StatCard label="Pokémon" value={stats.pokemon} />
                    <StatCard label="Scans" value={stats.scans} />
                    <StatCard label="Open Tickets" value={stats.openTickets} />
                  </div>
                  {stats.integrations.length > 0 && (
                    <div>
                      <p className="dex-section-heading">Integrations</p>
                      {stats.integrations.map(i => (
                        <div key={i.key} className="flex items-center gap-2 text-xs bg-cream rounded px-2 py-1.5 mb-1">
                          <div className={`w-2 h-2 rounded-full ${i.status === 'ACTIVE' ? 'bg-green-500' : i.status === 'ERROR' ? 'bg-red-500' : 'bg-gray-400'}`} />
                          <span className="flex-1 font-medium">{i.name}</span>
                          <span className="text-gray-500">{i.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!stats && (
                    <div className="flex justify-center pt-4">
                      <Button size="sm" onClick={() => loadTab('dashboard')}>Load Dashboard</Button>
                    </div>
                  )}
                  <Button variant="ghost" size="sm" onClick={runSeed}>Re-seed Data</Button>
                </div>
              )}

              {!loading && tab === 'integrations' && (
                <div className="space-y-2">
                  {integrations.map(i => (
                    <div key={i.id} className="bg-cream rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${i.status === 'ACTIVE' ? 'bg-green-500' : i.status === 'ERROR' ? 'bg-red-500' : 'bg-gray-400'}`} />
                          <span className="font-semibold text-sm text-charcoal">{i.name}</span>
                        </div>
                        <button onClick={() => toggleIntegration(i.id, i.status)}
                          className={`text-xs px-2 py-0.5 rounded cursor-pointer font-semibold
                            ${i.status === 'ACTIVE' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >{i.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
                      </div>
                      {i.description && <p className="text-xs text-gray-500">{i.description}</p>}
                      {i.baseUrl && <p className="text-xs font-mono text-gray-400 mt-0.5">{i.baseUrl}</p>}
                      {i.lastChecked && <p className="text-[10px] text-gray-400 mt-0.5">Last check: {new Date(i.lastChecked).toLocaleString()}</p>}
                    </div>
                  ))}
                  {integrations.length === 0 && <div className="flex justify-center pt-4"><Button size="sm" onClick={() => loadTab('integrations')}>Load Integrations</Button></div>}
                </div>
              )}

              {!loading && tab === 'tickets' && (
                <div className="space-y-2">
                  {tickets.length === 0 && <p className="dex-empty">No tickets</p>}
                  {tickets.map(t => (
                    <div key={t.id} className="bg-cream rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-charcoal">{t.subject}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-mono
                          ${t.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' :
                            t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            t.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                        >{t.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{t.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span>{t.user.username}</span>
                        {t.priority && <span className={`font-semibold ${t.priority === 'HIGH' || t.priority === 'CRITICAL' ? 'text-red-500' : ''}`}>{t.priority}</span>}
                      </div>
                      {t.response && <p className="text-xs text-gray-600 mt-1 italic">→ {t.response}</p>}
                      {t.status !== 'CLOSED' && (
                        <div className="flex gap-1 mt-2">
                          {t.status === 'OPEN' && <Button variant="secondary" size="sm" onClick={() => updateTicket(t.id, { status: 'IN_PROGRESS' })}>Start</Button>}
                          {t.status === 'IN_PROGRESS' && <Button variant="primary" size="sm" onClick={() => updateTicket(t.id, { status: 'RESOLVED' })}>Resolve</Button>}
                          <Button variant="ghost" size="sm" onClick={() => updateTicket(t.id, { status: 'CLOSED' })}>Close</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!loading && tab === 'users' && (
                <div className="space-y-1">
                  {adminUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-2 bg-cream rounded px-3 py-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal truncate">{u.username}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <select value={u.role} onChange={e => updateUserRole(u.id, e.target.value)}
                        className="text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 cursor-pointer">
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {!loading && tab === 'logs' && (
                <div className="space-y-1">
                  {logs.map(l => (
                    <div key={l.id} className="bg-cream rounded px-2 py-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${l.level === 'ERROR' ? 'text-red-500' : l.level === 'WARN' ? 'text-pokedex-amber' : 'text-gray-500'}`}>{l.level}</span>
                        <span className="text-gray-400 font-mono">{new Date(l.createdAt).toLocaleTimeString()}</span>
                        <span className="text-charcoal">{l.action}</span>
                      </div>
                      {l.detail && <p className="text-gray-500 mt-0.5">{l.detail}</p>}
                      {l.user && <p className="text-gray-400 mt-0.5">by {l.user.username}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </BottomScreen>
        }
        onNavigate={() => navigate('/home')}
      />
    </>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-cream rounded-lg p-3 text-center">
      <p className="text-2xl font-bold font-mono text-charcoal">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
