import { useCallback } from 'react'
import { useScanStore } from '../stores/scanStore'

export function useScan() {
  const { scanning, result, error, scan: storeScan, clear } = useScanStore()

  const scan = useCallback(async (image: string) => {
    await storeScan(image)
  }, [storeScan])

  return { scanning, result, error, scan, clear }
}
