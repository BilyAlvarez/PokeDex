import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { useUserStore } from '../stores/userStore'
import { useAvatar } from '../hooks/useAvatar'
import { api } from '../services/api'
import { useTranslation } from '../i18n/useTranslation'

interface UserStats {
  seen: number
  caught: number
  total: number
  scans: number
}

const PROFILE_MENU = [
  { to: '/profile/edit', key: 'editProfile', descKey: 'editProfileDesc', color: 'bg-pokedex-red/10 text-pokedex-red' },
  { to: '/profile/credentials', key: 'credentials', descKey: 'credentialsDesc', color: 'bg-pokedex-amber/10 text-pokedex-amber' },
  { to: '/profile/preferences', key: 'preferences', descKey: 'preferencesDesc', color: 'bg-pokedex-cyan/10 text-pokedex-cyan' },
  { to: '/profile/settings', key: 'settingsAccessibility', descKey: 'settingsDesc', color: 'bg-purple-100 text-purple-500' },
  { to: '/profile/tickets', key: 'supportTickets', descKey: 'supportTicketsDesc', color: 'bg-emerald-100 text-emerald-600' },
]

const MENU_ICONS: Record<string, React.ReactNode> = {
  editProfile: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  credentials: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1,.43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ),
  preferences: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  supportTickets: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M3 7h18M5 7v12a2 2 0 002 2h10a2 2 0 002-2V7M9 12h6M10 16h4" />
    </svg>
  ),
  settingsAccessibility: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
    </svg>
  ),
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { t } = useTranslation()
  const { avatarId, spriteUrl } = useAvatar()
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    if (user) {
      api.user.getStats().then(setStats).catch(() => {})
    }
  }, [user])

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

  const initials = user.username[0].toUpperCase()

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <PageHeader title={t('profile.title')} />
        <div className="app-card p-6 text-center mb-5">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-full bg-pokedex-red/10 flex items-center justify-center
                            border-2 border-pokedex-red/20 overflow-hidden">
              {spriteUrl ? (
                <img src={spriteUrl} alt="Avatar" className="w-16 h-16 object-contain" />
              ) : (
                <span className="text-3xl font-bold text-pokedex-red">{initials}</span>
              )}
            </div>
            {avatarId && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-cream-dark
                              flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-mono text-gray-400 tabular-nums leading-none">
                  #{String(avatarId).padStart(3, '0')}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold text-charcoal">{user.username}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-pokedex-amber/10 border border-pokedex-amber/20">
            <span className="w-1.5 h-1.5 rounded-full bg-pokedex-amber" />
            <span className="text-xs font-semibold text-pokedex-amber uppercase tracking-wider">{user.role}</span>
          </div>
          <p className="text-xs text-gray-400 mt-3 font-mono">{t('profile.memberSince')} {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="space-y-2 mb-5">
          {PROFILE_MENU.map(({ to, key, descKey, color }) => (
            <button key={key} onClick={() => navigate(to)}
              className="w-full app-card p-4 flex items-center gap-3 text-left hover:shadow-md transition-shadow cursor-pointer">
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                {MENU_ICONS[key]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-charcoal">{t(`profile.${key}`)}</p>
                <p className="text-xs text-gray-400">{t(`profile.${descKey}`)}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ))}
        </div>

        {stats && (
          <div className="app-card p-5">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('profile.yourProgress')}</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold font-mono text-pokedex-red tabular-nums">{stats.total}</p>
                <p className="text-xxs text-gray-400 uppercase tracking-wider mt-0.5">{t('profile.seen')}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold font-mono text-pokedex-cyan tabular-nums">{stats.caught}</p>
                <p className="text-xxs text-gray-400 uppercase tracking-wider mt-0.5">{t('profile.caught')}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold font-mono text-pokedex-amber tabular-nums">{stats.scans}</p>
                <p className="text-xxs text-gray-400 uppercase tracking-wider mt-0.5">{t('profile.scans')}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 mb-6 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{t('profile.about')}</p>
          <div className="app-card p-4 inline-block">
            <p className="text-sm text-charcoal font-medium">{t('profile.createdBy')}</p>
            <p className="text-xxs text-gray-400 mt-0.5">{t('profile.appVersion')}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
