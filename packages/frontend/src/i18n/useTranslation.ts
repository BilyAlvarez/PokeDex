import { usePreferencesStore } from '../stores/preferencesStore'
import { translations, type Lang } from './translations'

function resolve(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return typeof current === 'string' ? current : undefined
}

export function useTranslation() {
  const language = usePreferencesStore(s => s.language)
  const lang: Lang = language === 'es' ? 'es' : 'en'

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let text = resolve(translations[lang] as unknown as Record<string, unknown>, key)
      ?? resolve(translations.en as unknown as Record<string, unknown>, key)
      ?? key
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, String(v))
      }
    }
    return text
  }

  return { t, language: lang }
}
