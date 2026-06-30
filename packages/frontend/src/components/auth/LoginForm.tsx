import { useState } from 'react'
import { Button } from '../ui/Button'
import { useUserStore } from '../../stores/userStore'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error } = useUserStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-[#2D2D2D]">Login</h2>

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
        <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full bg-white border border-[#E8E0D0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC1F1F]"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Loading...' : 'Login'}
      </Button>

      {onSwitchToRegister && (
        <p className="text-sm text-center text-gray-500">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToRegister} className="text-[#CC1F1F] hover:underline cursor-pointer">
            Register
          </button>
        </p>
      )}
    </form>
  )
}
