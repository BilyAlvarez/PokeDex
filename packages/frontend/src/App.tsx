import { Routes, Route } from 'react-router-dom'
import { SplashScreen, HomePage, ScanPage, PokemonPage, MyPokedexPage, SearchPage, AssistantPage, LoginPage } from './pages'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/pokemon/:id" element={<PokemonPage />} />
      <Route path="/pokedex" element={<MyPokedexPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/assistant" element={<AssistantPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}
