import { Link } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Button } from '../components/ui/Button'
import { useTranslation } from '../i18n/useTranslation'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="text-6xl font-bold text-pokedex-red/30">404</div>
        <h1 className="text-xl font-bold text-charcoal">{t('notFound.title')}</h1>
        <p className="text-sm text-gray-500 max-w-xs">{t('notFound.description')}</p>
        <Link to="/home">
          <Button>{t('notFound.backHome')}</Button>
        </Link>
      </div>
    </AppLayout>
  )
}
