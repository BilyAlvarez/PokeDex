import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { useUserStore } from '../stores/userStore'
import { api } from '../services/api'
import { useTranslation } from '../i18n/useTranslation'

export function EditCredentialsPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { t } = useTranslation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [isError, setIsError] = useState(false)

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="dex-empty">{t('editCredentials.signInToManage')}</p>
        </div>
      </AppLayout>
    )
  }

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      setMsg(t('editCredentials.noMatch'))
      setIsError(true)
      return
    }
    if (newPassword.length < 6) {
      setMsg(t('editCredentials.tooShort'))
      setIsError(true)
      return
    }
    try {
      await api.user.changePassword({ currentPassword, newPassword })
      setMsg(t('editCredentials.updated'))
      setIsError(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setMsg(t('editCredentials.incorrectCurrent'))
      setIsError(true)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto">
        <PageHeader
          title={t('editCredentials.title')}
          onBack={() => navigate('/profile')}
        />

        <div className="app-card p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{t('editCredentials.currentPassword')}</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full text-sm border border-cream rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-pokedex-red/40" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{t('editCredentials.newPassword')}</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full text-sm border border-cream rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-pokedex-red/40" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{t('editCredentials.confirmPassword')}</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full text-sm border border-cream rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-pokedex-red/40" />
          </div>

          {msg && (
            <p className={`text-sm text-center ${isError ? 'text-red-500' : 'text-pokedex-amber'}`}>{msg}</p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>{t('editCredentials.cancel')}</Button>
            <Button size="sm" onClick={handleSave}>{t('editCredentials.update')}</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
