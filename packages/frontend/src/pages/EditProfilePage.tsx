import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { PokemonAvatarPicker } from '../components/ui/PokemonAvatarPicker'
import { useUserStore } from '../stores/userStore'
import { useAvatar } from '../hooks/useAvatar'
import { api } from '../services/api'
import { useTranslation } from '../i18n/useTranslation'

export function EditProfilePage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { t } = useTranslation()
  const { avatarId, setAvatarId, spriteUrl } = useAvatar()
  const [username, setUsername] = useState(user?.username ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [msg, setMsg] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="dex-empty">{t('editProfile.signInToEdit')}</p>
        </div>
      </AppLayout>
    )
  }

  const handleSave = async () => {
    try {
      await api.user.updateProfile({ username, email })
      useUserStore.setState({ user: { ...user, username, email } })
      setMsg(t('editProfile.saved'))
    } catch {
      setMsg('Failed to save profile')
    }
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto">
        <PageHeader
          title={t('editProfile.title')}
          onBack={() => navigate('/profile')}
        />

        <div className="app-card p-5 space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2 pb-1">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-pokedex-red/10 flex items-center justify-center
                              border-2 border-pokedex-red/20 overflow-hidden">
                {spriteUrl ? (
                  <img src={spriteUrl} alt="Avatar" className="w-16 h-16 object-contain" />
                ) : (
                  <span className="text-3xl font-bold text-pokedex-red">{username[0]?.toUpperCase() || '?'}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-pokedex-red text-white
                           flex items-center justify-center shadow-md hover:bg-pokedex-dark
                           transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setPickerOpen(true)}
                className="text-xs text-pokedex-red hover:text-pokedex-dark transition-colors cursor-pointer font-medium">
                {avatarId ? 'Change Pokémon' : 'Choose Pokémon avatar'}
              </button>
              {avatarId && (
                <button type="button" onClick={() => setAvatarId(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                  Remove
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{t('editProfile.username')}</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full text-sm border border-cream rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-pokedex-red/40" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{t('editProfile.email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full text-sm border border-cream rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-pokedex-red/40" />
          </div>

          {msg && <p className="text-sm text-pokedex-amber text-center">{msg}</p>}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>{t('editProfile.cancel')}</Button>
            <Button size="sm" onClick={handleSave}>{t('editProfile.save')}</Button>
          </div>
        </div>
      </div>
      {pickerOpen && (
        <PokemonAvatarPicker
          currentId={avatarId}
          onSelect={id => { setAvatarId(id); setPickerOpen(false) }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </AppLayout>
  )
}
