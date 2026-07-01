import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SplashScreen, HomePage, ScanPage, PokemonPage, MyPokedexPage, AssistantPage, LoginPage, AdminPage, AdminLoginPage, GalleryPage, ProfilePage, EditProfilePage, EditCredentialsPage, PreferencesPage, SettingsPage, SupportTicketsPage, TypeChartPage, TeamBuilderPage, NotFoundPage } from './pages'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { usePreferencesStore } from './stores/preferencesStore'

function PreferencesApplier() {
  const { fontSize, reduceMotion, highContrast, theme } = usePreferencesStore()

  useEffect(() => {
    const root = document.documentElement

    root.classList.remove('text-sm', 'text-base', 'text-lg')
    if (fontSize === 'small') root.classList.add('text-sm')
    else if (fontSize === 'large') root.classList.add('text-lg')
    else root.classList.add('text-base')

    root.classList.toggle('reduce-motion', reduceMotion)
    root.classList.toggle('high-contrast', highContrast)
    root.classList.toggle('dark', theme === 'dark')
  }, [fontSize, reduceMotion, highContrast, theme])

  return null
}

export default function App() {
  return (
    <>
      <PreferencesApplier />
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/pokemon/:id" element={<PokemonPage />} />
        <Route path="/pokedex" element={<MyPokedexPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/profile/credentials" element={<EditCredentialsPage />} />
        <Route path="/profile/preferences" element={<PreferencesPage />} />
        <Route path="/profile/settings" element={<SettingsPage />} />
        <Route path="/profile/tickets" element={<SupportTicketsPage />} />
        <Route path="/type-chart" element={<TypeChartPage />} />
        <Route path="/team-builder" element={<TeamBuilderPage />} />
        <Route path="/search" element={<Navigate to="/gallery" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </ErrorBoundary>
    </>
  )
}
