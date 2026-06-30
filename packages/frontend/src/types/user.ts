export interface UserData {
  id: string
  email: string
  username: string
  role: string
  createdAt: string
}

export interface AuthResponse {
  user: UserData
  token: string
}

export interface UserProgressData {
  pokemonId: string
  status: 'NOT_SEEN' | 'SEEN' | 'CAUGHT'
  scannedAt: string | null
  photoUrl: string | null
}

export interface ScanHistoryData {
  id: string
  pokemonId: string
  confidence: number
  imageUrl: string | null
  createdAt: string
}
