import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'

export function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="dex-login-page">
      <div className="dex-login-card">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-pokedex-red tracking-wider">POKÉDEX</h1>
        </div>

        {mode === 'login' ? (
          <LoginForm onSuccess={() => navigate('/home')} onSwitchToRegister={() => setMode('register')} />
        ) : (
          <RegisterForm onSuccess={() => navigate('/home')} onSwitchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  )
}
