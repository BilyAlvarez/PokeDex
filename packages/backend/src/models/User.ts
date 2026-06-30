export interface UserData {
  id: string
  email: string
  username: string
  role: string
  createdAt: Date
}

export interface UserProgressData {
  pokemonId: string
  status: 'NOT_SEEN' | 'SEEN' | 'CAUGHT'
  scannedAt: Date | null
  photoUrl: string | null
}

export interface ScanHistoryData {
  id: string
  pokemonId: string
  confidence: number
  imageUrl: string | null
  createdAt: Date
}
