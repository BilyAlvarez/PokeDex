import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUserStore } from '../../stores/userStore'
import { useTranslation } from '../../i18n/useTranslation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { login, loading, error } = useUserStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) {
      sessionStorage.setItem('pokedex-just-logged-in', '1')
      navigate('/home')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50 border border-red-100
                     rounded-xl px-4 py-3"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </motion.div>
      )}

      {/* Form card */}
      <div className="bg-bone rounded-xl border border-cream overflow-hidden">

        {/* Email field */}
        <label className="flex flex-col px-4 pt-4 pb-3.5 border-b border-cream cursor-text group">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 group-focus-within:text-pokedex-red transition-colors">
            {t('loginForm.email')}
          </span>
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-gray-350 shrink-0 group-focus-within:text-pokedex-red transition-colors"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('loginForm.emailPlaceholder')}
              className="flex-1 text-sm text-charcoal placeholder-gray-300 bg-transparent outline-none"
            />
          </div>
        </label>

        {/* Password field */}
        <label className="flex flex-col px-4 pt-4 pb-3.5 cursor-text group">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 group-focus-within:text-pokedex-red transition-colors">
            {t('loginForm.password')}
          </span>
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-gray-350 shrink-0 group-focus-within:text-pokedex-red transition-colors"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <input
              type={showPw ? 'text' : 'password'} required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('loginForm.passwordPlaceholder')}
              className="flex-1 text-sm text-charcoal placeholder-gray-300 bg-transparent outline-none"
            />
            <button
              type="button" tabIndex={-1}
              onClick={() => setShowPw(s => !s)}
              className="text-gray-350 hover:text-gray-500 transition-colors cursor-pointer shrink-0"
            >
              {showPw ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </label>

      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={loading ? {} : { scale: 1.015 }}
        whileTap={loading ? {} : { scale: 0.975 }}
        className="w-full py-3 rounded-xl font-bold text-sm text-white tracking-wide
                   disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #e03030 0%, #b81414 100%)',
          boxShadow: '0 3px 16px rgba(184,20,20,0.42), 0 1px 3px rgba(0,0,0,0.15)',
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            {t('loginForm.signingIn')}
          </span>
        ) : t('loginForm.signIn')}
      </motion.button>

    </form>
  )
}
