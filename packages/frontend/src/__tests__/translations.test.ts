import { describe, it, expect } from 'vitest'
import { translations } from '../i18n/translations'

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

const asRecord = (obj: unknown) => obj as Record<string, unknown>

describe('translations', () => {
  const en = asRecord(translations.en)
  const es = asRecord(translations.es)

  describe('EN', () => {
    it('should resolve nav.home', () => {
      expect(resolve(en, 'nav.home')).toBe('Home')
    })

    it('should resolve home.title', () => {
      expect(resolve(en, 'home.title')).toBe('POK\u00c9DEX')
    })

    it('should return undefined for missing translations', () => {
      expect(resolve(en, 'nonexistent.key')).toBeUndefined()
    })
  })

  describe('ES', () => {
    it('should resolve nav.home', () => {
      expect(resolve(es, 'nav.home')).toBe('Inicio')
    })

    it('should resolve home.title', () => {
      expect(resolve(es, 'home.title')).toBe('POK\u00c9DEX')
    })

    it('should return undefined for missing translations', () => {
      expect(resolve(es, 'nonexistent.key')).toBeUndefined()
    })

    it('should have the same keys as EN', () => {
      const enKeys = collectKeys(en)
      const esKeys = collectKeys(es)
      for (const key of enKeys) {
        expect(esKeys).toContain(key)
      }
    })
  })
})

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectKeys(v as Record<string, unknown>, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}
