import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { useTranslation } from '../i18n/useTranslation'
import { useUserStore } from '../stores/userStore'
import { api } from '../services/api'
import type { SupportTicket } from '../types/admin'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const

export function SupportTicketsPage() {
  const { user } = useUserStore()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [submitting, setSubmitting] = useState(false)

  const loadTickets = async () => {
    setLoading(true)
    try {
      const data = await api.user.tickets()
      setTickets(data)
    } catch { setMsg('Failed to load tickets') }
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadTickets() }, [])

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="dex-empty">{t('profile.signInToView')}</p>
          <Button className="mt-4" onClick={() => navigate('/login')}>{t('profile.signIn')}</Button>
        </div>
      </AppLayout>
    )
  }

  const createTicket = async () => {
    if (!subject.trim() || !description.trim()) return
    setSubmitting(true)
    try {
      await api.user.createTicket({ subject, description, priority })
      setMsg('Ticket created')
      setFormOpen(false)
      setSubject('')
      setDescription('')
      setPriority('MEDIUM')
      loadTickets()
    } catch (e) { setMsg(String(e)) }
    setSubmitting(false)
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Support Tickets"
          subtitle="Create and track your support requests"
          action={
            <Button size="sm" onClick={() => setFormOpen(true)}>
              + New Ticket
            </Button>
          }
        />

        {msg && (
          <div className="mb-4 text-sm text-pokedex-amber bg-pokedex-amber/10 border border-pokedex-amber/20 rounded-xl px-4 py-2.5">
            {msg}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-pokedex-red/30 border-t-pokedex-red rounded-full animate-spin" />
          </div>
        )}

        {!loading && tickets.length === 0 && (
          <div className="app-card p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-pokedex-amber/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-pokedex-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M3 7h18M5 7v12a2 2 0 002 2h10a2 2 0 002-2V7M9 12h6M10 16h4" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No support tickets yet</p>
            <p className="text-xs text-gray-400 mt-1">Create one to get help from the team</p>
          </div>
        )}

        {!loading && tickets.length > 0 && (
          <div className="space-y-3">
            {tickets.map(t => (
              <div key={t.id} className="app-card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-semibold text-charcoal">{t.subject}</p>
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-mono font-semibold
                    ${t.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' :
                      t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      t.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{t.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {t.priority && (
                    <span className={`font-semibold ${t.priority === 'HIGH' || t.priority === 'CRITICAL' ? 'text-red-500' : ''}`}>
                      {t.priority}
                    </span>
                  )}
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                {t.response && (
                  <p className="text-sm text-gray-600 italic bg-bone rounded-lg px-3 py-2 mt-3">
                    → {t.response}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="New Support Ticket">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Brief summary of your issue"
              className="w-full text-sm border border-cream rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-pokedex-red/40"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your issue in detail"
              rows={4}
              className="w-full text-sm border border-cream rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-pokedex-red/40 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full text-sm border border-cream rounded-lg px-3 py-2 bg-white cursor-pointer focus:outline-none focus:border-pokedex-red/40"
            >
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={createTicket} disabled={submitting || !subject.trim() || !description.trim()}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
