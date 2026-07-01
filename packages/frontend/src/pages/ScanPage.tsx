import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { CameraView } from '../components/camera/CameraView'
import { Button } from '../components/ui/Button'
import { useCamera } from '../hooks/useCamera'
import { useScanStore } from '../stores/scanStore'
import { useSound } from '../hooks/useSound'
import { useTranslation } from '../i18n/useTranslation'

export function ScanPage() {
  const navigate = useNavigate()
  const { videoRef, start, stop, capture } = useCamera()
  const { scanning, result, error, scan } = useScanStore()
  const { playScan } = useSound()
  const [cameraActive, setCameraActive] = useState(false)
  const { t } = useTranslation()

  const handleStartCamera = useCallback(async () => {
    await start('environment')
    setCameraActive(true)
  }, [start])

  const handleStopCamera = useCallback(() => {
    stop()
    setCameraActive(false)
  }, [stop])

  const handleScan = useCallback(async () => {
    if (!capture) return
    const frame = capture()
    if (!frame) return
    playScan()
    await scan(frame)
  }, [capture, playScan, scan])

  const status = scanning ? 'SCANNING' : cameraActive ? 'LIVE' : 'OFF'

  return (
    <AppLayout>
      <PageHeader title={t('scan.title')} subtitle={t('scan.subtitle')} />

      <div className="flex flex-col items-center gap-5">

        {/* ── Pokédex Device ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-sm sm:max-w-md relative"
        >
          {/* Body */}
          <div
            className="relative rounded-3xl overflow-hidden select-none"
            style={{
              background: 'linear-gradient(135deg, #e03030 0%, #cc1f1f 40%, #b01515 100%)',
              boxShadow: '0 24px 64px rgba(176,21,21,0.45), 0 6px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.2)',
            }}
          >
            {/* Left highlight bead */}
            <div className="absolute left-0 top-8 bottom-8 w-0.5 bg-white/15 rounded-full" />

            {/* ── Top section ──────────────────────────────────────────── */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between">

              {/* Blue lens */}
              <motion.div
                animate={scanning ? { scale: [1, 1.06, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="relative w-14 h-14 rounded-full shrink-0"
                style={{
                  background: 'radial-gradient(circle at 32% 32%, #93c5fd 0%, #3b82f6 38%, #1d4ed8 70%, #1e3a8a 100%)',
                  boxShadow: '0 2px 12px rgba(59,130,246,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                  border: '3px solid #bfdbfe',
                }}
              >
                {/* Shine */}
                <div className="absolute top-2 left-2.5 w-4 h-4 rounded-full bg-white/50 blur-[3px]" />
                <div className="absolute top-3 left-3.5 w-2 h-2 rounded-full bg-white/80" />
                <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-white/15" />

                {/* Scanning ring pulse */}
                {scanning && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-cyan-300"
                      animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
                      transition={{ repeat: Infinity, duration: 0.9 }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border border-cyan-200"
                      animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: 0.3 }}
                    />
                  </>
                )}
              </motion.div>

              {/* LEDs */}
              <div className="flex items-center gap-2 mr-2">
                {/* Red LED — always bright, pulses faster when scanning */}
                <motion.div
                  className="w-4 h-4 rounded-full"
                  animate={scanning
                    ? { opacity: [1, 0.15, 1], boxShadow: ['0 0 14px 4px #ff4444', '0 0 4px 1px #ff4444', '0 0 14px 4px #ff4444'] }
                    : { opacity: [1, 0.6, 1], boxShadow: ['0 0 10px 3px #ff4444', '0 0 5px 1px #cc2222', '0 0 10px 3px #ff4444'] }}
                  transition={{ repeat: Infinity, duration: scanning ? 0.45 : 2 }}
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #ff8080 0%, #ff2222 50%, #cc0000 100%)',
                    boxShadow: '0 0 10px 3px #ff4444, 0 0 3px 1px #cc0000',
                  }}
                />
                {/* Yellow LED — active when camera on */}
                <div
                  className="w-3 h-3 rounded-full transition-all duration-300"
                  style={{
                    background: cameraActive ? '#fde68a' : 'rgba(234,179,8,0.3)',
                    boxShadow: cameraActive ? '0 0 8px #fde68a' : 'none',
                  }}
                />
                {/* Green LED — on when camera ready, off when scanning */}
                <motion.div
                  className="w-3 h-3 rounded-full transition-all duration-300"
                  animate={cameraActive && !scanning ? { opacity: [1, 0.6, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    background: (cameraActive && !scanning) ? '#86efac' : 'rgba(34,197,94,0.3)',
                    boxShadow: (cameraActive && !scanning) ? '0 0 8px #86efac' : 'none',
                  }}
                />
              </div>
            </div>

            {/* Horizontal divider stripe */}
            <div className="mx-4 h-px bg-black/20 mb-3" />
            <div className="mx-4 h-px bg-white/10 mb-3" />

            {/* ── Screen bezel ─────────────────────────────────────────── */}
            <div className="px-5 pb-3">
              <div
                className="rounded-xl p-2"
                style={{
                  background: 'linear-gradient(135deg, #9ca3af 0%, #d1d5db 50%, #9ca3af 100%)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                {/* Sensor dots */}
                <div className="flex justify-center gap-2.5 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-900/60" />
                  <div className="w-1.5 h-1.5 rounded-full bg-red-900/60" />
                </div>

                {/* Screen */}
                <div
                  className="relative overflow-hidden rounded-sm"
                  style={{ aspectRatio: '4 / 5', background: '#050505' }}
                >
                  {/* Camera feed */}
                  <CameraView videoRef={videoRef} active={cameraActive} />

                  {/* ── Idle (camera off) ─────────────────────────────── */}
                  {!cameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/8 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                        </svg>
                      </div>
                      <motion.p
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className="text-[10px] text-white/30 font-mono tracking-[0.25em]"
                      >
                        STANDBY
                      </motion.p>
                    </div>
                  )}

                  {/* ── Camera active (ready) ──────────────────────────── */}
                  {cameraActive && !scanning && (
                    <>
                      {/* Corner brackets */}
                      {(['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r', 'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r'] as const).map((cls, i) => (
                        <div
                          key={i}
                          className={`absolute w-5 h-5 border-pokedex-red ${cls}`}
                          style={{ borderWidth: '2px' }}
                        />
                      ))}
                      <motion.div
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                        className="absolute bottom-2 left-0 right-0 flex justify-center"
                      >
                        <span className="text-[9px] text-green-400 font-mono tracking-[0.3em]">READY</span>
                      </motion.div>
                    </>
                  )}

                  {/* ── Scanning animation ────────────────────────────── */}
                  {scanning && (
                    <>
                      {/* Scan line */}
                      <motion.div
                        className="absolute left-0 right-0 h-[2px] pointer-events-none z-20"
                        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(204,31,31,0.6) 20%, #ff4444 50%, rgba(204,31,31,0.6) 80%, transparent 100%)' }}
                        animate={{ top: ['2%', '96%', '2%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                      />

                      {/* Glow beneath scan line */}
                      <motion.div
                        className="absolute left-0 right-0 h-10 pointer-events-none z-10"
                        style={{ background: 'linear-gradient(180deg, rgba(204,31,31,0.12) 0%, transparent 100%)' }}
                        animate={{ top: ['2%', '88%', '2%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                      />

                      {/* Dim overlay */}
                      <div className="absolute inset-0 bg-pokedex-red/8 z-10 pointer-events-none" />

                      {/* Animated corner brackets */}
                      <motion.div
                        className="absolute inset-0 z-20 pointer-events-none"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 0.9 }}
                      >
                        {(['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r', 'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r'] as const).map((cls, i) => (
                          <div
                            key={i}
                            className={`absolute w-6 h-6 border-pokedex-red ${cls}`}
                            style={{ borderWidth: '2px' }}
                          />
                        ))}
                      </motion.div>

                      {/* ANALYZING text */}
                      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                        <motion.div
                          animate={{ opacity: [1, 0.35, 1] }}
                          transition={{ repeat: Infinity, duration: 0.55 }}
                          className="px-4 py-1.5 rounded border border-pokedex-red/50"
                          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
                        >
                          <span className="text-[11px] text-red-400 font-mono font-bold tracking-[0.3em]">
                            ANALYZING...
                          </span>
                        </motion.div>
                      </div>
                    </>
                  )}

                  {/* CRT scanlines */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── Separator ────────────────────────────────────────────── */}
            <div className="mx-4 mt-2 mb-1 h-px bg-black/25" />
            <div className="mx-4 mb-3 h-px bg-white/10" />

            {/* ── Hardware action buttons ───────────────────────────────── */}
            <div className="px-5 pb-4">
              <AnimatePresence mode="wait">
                {!cameraActive ? (
                  /* ── Start camera: single wide button ─── */
                  <motion.button
                    key="start"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleStartCamera}
                    whileTap={{ y: 3 }}
                    className="w-full py-3 rounded-[5px] flex items-center justify-center gap-2.5 cursor-pointer"
                    style={{
                      background: 'linear-gradient(180deg, #2a2a2a 0%, #111 100%)',
                      boxShadow: '0 4px 0 #000, 0 5px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  >
                    <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <span className="text-sm font-bold tracking-[0.18em] text-white/75 font-mono uppercase">
                      {t('scan.startCamera')}
                    </span>
                  </motion.button>
                ) : (
                  /* ── Stop + Scan: two side-by-side buttons ─── */
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-2.5"
                  >
                    {/* STOP button */}
                    <motion.button
                      onClick={handleStopCamera}
                      whileTap={{ y: 3 }}
                      className="flex-1 py-3 rounded-[5px] flex items-center justify-center gap-2 cursor-pointer"
                      style={{
                        background: 'linear-gradient(180deg, #333 0%, #1a1a1a 100%)',
                        boxShadow: '0 4px 0 #000, 0 5px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                      }}
                    >
                      <svg className="w-3.5 h-3.5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                      </svg>
                      <span className="text-xs font-bold tracking-[0.2em] text-white/55 font-mono uppercase">
                        {t('scan.stop')}
                      </span>
                    </motion.button>

                    {/* SCAN button — primary, wider */}
                    <motion.button
                      onClick={handleScan}
                      disabled={scanning}
                      whileTap={!scanning ? { y: 3 } : {}}
                      className="flex-[2] py-5 rounded-[5px] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                      style={{
                        background: scanning
                          ? 'linear-gradient(180deg, #8e1212 0%, #5a0a0a 100%)'
                          : 'linear-gradient(180deg, #e03030 0%, #9a1010 100%)',
                        boxShadow: scanning
                          ? '0 1px 0 #3a0505, inset 0 2px 4px rgba(0,0,0,0.4)'
                          : '0 4px 0 #5a0a0a, 0 5px 10px rgba(204,31,31,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                      }}
                    >
                      {scanning ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                            className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white/70"
                          />
                          <span className="text-xs font-bold tracking-[0.2em] text-white/70 font-mono uppercase">
                            {t('scan.scanning')}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm font-bold tracking-[0.2em] text-white font-mono uppercase">
                            {t('scan.scan')}
                          </span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Decorative bottom strip ───────────────────────────────── */}
            <div className="mx-4 mb-4 h-px bg-black/20" />
            <div className="px-5 pb-4 flex items-center justify-between">

              {/* Green decorative button */}
              <div
                className="w-12 h-5 rounded-[3px]"
                style={{
                  background: 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                <div className="w-full h-px bg-white/20 rounded-t-[3px] mt-0.5" />
              </div>

              {/* Status indicator */}
              <motion.span
                animate={scanning
                  ? { opacity: [1, 0.4, 1] }
                  : cameraActive
                    ? { opacity: [1, 0.7, 1] }
                    : {}}
                transition={{ repeat: Infinity, duration: scanning ? 0.5 : 2 }}
                className="text-[9px] font-mono tracking-[0.3em]"
                style={{ color: scanning ? '#fca5a5' : cameraActive ? '#86efac' : 'rgba(255,255,255,0.35)' }}
              >
                {status}
              </motion.span>

              {/* D-pad (decorative) */}
              <div className="relative w-10 h-10 shrink-0">
                <div className="absolute top-1/2 left-0 right-0 h-[13px] -translate-y-1/2 rounded-[2px]"
                  style={{ background: '#111', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }} />
                <div className="absolute left-1/2 top-0 bottom-0 w-[13px] -translate-x-1/2 rounded-[2px]"
                  style={{ background: '#111', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }} />
                <div className="absolute inset-0 m-auto w-[13px] h-[13px] rounded-[2px]"
                  style={{ background: '#1a1a1a' }} />
              </div>
            </div>

            {/* Bottom edge depth */}
            <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-black/25 rounded-b-full" />
          </div>
        </motion.div>

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="dex-error text-sm text-center max-w-xs"
          >
            {error}
          </motion.p>
        )}

        {/* ── Scan Result ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="w-full max-w-sm sm:max-w-md app-card overflow-hidden"
            >
              {result.identified && result.pokemon ? (
                <div className="flex items-center gap-4 p-4">
                  {result.pokemon.spriteUrl && (
                    <div className="w-16 h-16 rounded-xl bg-bone flex items-center justify-center shrink-0 border border-cream-dark">
                      <img src={result.pokemon.spriteUrl} alt="" className="w-16 h-16 object-contain" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 mb-1.5">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      {t('scan.identified')}
                    </span>
                    <p className="text-lg font-bold text-charcoal capitalize leading-tight">{result.pokemon.name}</p>
                    {result.message && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{result.message}</p>}
                  </div>
                  <Button size="sm" className="shrink-0" onClick={() => navigate(`/pokemon/${result.pokemon!.id}`)}>
                    {t('scan.view')}
                  </Button>
                </div>
              ) : result.candidates ? (
                <div className="p-4">
                  <p className="text-sm font-semibold text-charcoal mb-3">{result.message}</p>
                  <div className="space-y-2">
                    {result.candidates.map((c, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="font-mono text-sm text-charcoal capitalize w-24 truncate">{c.species}</span>
                        <div className="flex-1 bg-bone rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            className="h-full bg-pokedex-cyan rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(c.confidence * 100).toFixed(0)}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="font-mono text-xs text-gray-500 w-9 text-right tabular-nums">
                          {(c.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="dex-empty p-4">{result.message}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!result && !cameraActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="app-card p-6 text-center w-full max-w-sm sm:max-w-md"
          >
            <p className="dex-empty">{t('scan.emptyState')}</p>
          </motion.div>
        )}

      </div>
    </AppLayout>
  )
}
