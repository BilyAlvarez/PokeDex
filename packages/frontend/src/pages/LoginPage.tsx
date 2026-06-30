import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'

export function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="min-h-screen bg-[#CC1F1F] flex items-center justify-center p-4">
      <div className="bg-[#F5F0E8] rounded-2xl shadow-2xl p-8 w-full max-w-sm border-2 border-[#8E1212]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#CC1F1F] tracking-wider">POKÉDEX</h1>
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
