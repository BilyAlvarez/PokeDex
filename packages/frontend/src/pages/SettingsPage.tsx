import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { useUserStore } from '../stores/userStore'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useTranslation } from '../i18n/useTranslation'

export function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { t } = useTranslation()
  const {
    fontSize, setFontSize,
    reduceMotion, setReduceMotion,
    highContrast, setHighContrast,
  } = usePreferencesStore()

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="dex-empty">{t('settings.signIn')}</p>
        </div>
      </AppLayout>
    )
  }

  const sizes = ['small', 'medium', 'large'] as const

  return (
    <AppLayout>
      <div className="max-w-md mx-auto">
        <PageHeader
          title={t('settings.title')}
          onBack={() => navigate('/profile')}
        />

        <div className="app-card p-5 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">{t('settings.fontSize')}</label>
            <div className="flex gap-2">
              {sizes.map(s => (
                <button key={s} onClick={() => setFontSize(s)}
                  className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all cursor-pointer border
                    ${fontSize === s
                      ? 'bg-pokedex-red text-white border-pokedex-dark shadow-sm'
                      : 'bg-white text-charcoal border-cream hover:border-pokedex-red/40'}
                    ${s === 'small' ? 'text-xs' : s === 'large' ? 'text-lg' : 'text-sm'}`}
                >A</button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-charcoal">{t('settings.reduceMotion')}</p>
              <p className="text-xs text-gray-400">{t('settings.reduceMotionDesc')}</p>
            </div>
            <button onClick={() => setReduceMotion(!reduceMotion)}
              className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${reduceMotion ? 'bg-pokedex-red' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${reduceMotion ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-charcoal">{t('settings.highContrast')}</p>
              <p className="text-xs text-gray-400">{t('settings.highContrastDesc')}</p>
            </div>
            <button onClick={() => setHighContrast(!highContrast)}
              className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${highContrast ? 'bg-pokedex-red' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${highContrast ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => navigate('/profile')}>{t('settings.done')}</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
