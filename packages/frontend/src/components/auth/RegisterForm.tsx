import { useState } from 'react'
import { Button } from '../ui/Button'
import { useUserStore } from '../../stores/userStore'

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { register, loading, error } = useUserStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await register(email, username, password)
    if (ok) onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-[#2D2D2D]">Register</h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full bg-white border border-[#E8E0D0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC1F1F]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          minLength={3}
          className="w-full bg-white border border-[#E8E0D0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC1F1F]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full bg-white border border-[#E8E0D0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC1F1F]"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Loading...' : 'Register'}
      </Button>

      {onSwitchToLogin && (
        <p className="text-sm text-center text-gray-500">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className="text-[#CC1F1F] hover:underline cursor-pointer">
            Login
          </button>
        </p>
      )}
    </form>
  )
}
