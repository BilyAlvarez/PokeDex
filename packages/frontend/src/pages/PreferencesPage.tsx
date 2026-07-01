import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { useUserStore } from '../stores/userStore'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useTranslation } from '../i18n/useTranslation'

export function PreferencesPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { t } = useTranslation()
  const {
    language, setLanguage,
    notifications, setNotifications,
    compactView, setCompactView,
  } = usePreferencesStore()

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="dex-empty">{t('preferences.signIn')}</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto">
        <PageHeader
          title={t('preferences.title')}
          onBack={() => navigate('/profile')}
        />

        <div className="app-card p-5 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">{t('preferences.language')}</label>
            <div className="flex gap-2">
              {(['en', 'es'] as const).map(l => (
                <button key={l} onClick={() => setLanguage(l)}
                  className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all cursor-pointer border
                    ${language === l
                      ? 'bg-pokedex-red text-white border-pokedex-dark shadow-sm'
                      : 'bg-white text-charcoal border-cream hover:border-pokedex-red/40'}`}
                >{l === 'en' ? t('preferences.english') : t('preferences.spanish')}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-charcoal">{t('preferences.notifications')}</p>
              <p className="text-xs text-gray-400">{t('preferences.notificationsDesc')}</p>
            </div>
            <button onClick={() => setNotifications(!notifications)}
              className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${notifications ? 'bg-pokedex-red' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-charcoal">{t('preferences.compactView')}</p>
              <p className="text-xs text-gray-400">{t('preferences.compactViewDesc')}</p>
            </div>
            <button onClick={() => setCompactView(!compactView)}
              className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${compactView ? 'bg-pokedex-red' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${compactView ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => navigate('/profile')}>{t('preferences.done')}</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
