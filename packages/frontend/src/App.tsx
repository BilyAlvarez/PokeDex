import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SplashScreen, HomePage, ScanPage, PokemonPage, MyPokedexPage, SearchPage, AssistantPage, LoginPage, AdminPage } from './pages'

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><SplashScreen /></AnimatedPage>} />
        <Route path="/home" element={<AnimatedPage><HomePage /></AnimatedPage>} />
        <Route path="/scan" element={<AnimatedPage><ScanPage /></AnimatedPage>} />
        <Route path="/pokemon/:id" element={<AnimatedPage><PokemonPage /></AnimatedPage>} />
        <Route path="/pokedex" element={<AnimatedPage><MyPokedexPage /></AnimatedPage>} />
        <Route path="/search" element={<AnimatedPage><SearchPage /></AnimatedPage>} />
        <Route path="/assistant" element={<AnimatedPage><AssistantPage /></AnimatedPage>} />
        <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
        <Route path="/admin" element={<AnimatedPage><AdminPage /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  )
}
