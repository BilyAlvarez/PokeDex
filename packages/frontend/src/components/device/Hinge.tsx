export function Hinge() {
  return (
    <div className="hidden md:flex flex-col items-center justify-center px-3">
      <div className="flex flex-col items-center gap-1">
        <div className="w-5 h-5 rounded-full bg-gradient-to-b from-hinge-knob to-hinge-bar shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.3)]" />
        <div className="w-1.5 h-10 bg-gradient-to-b from-pokedex-dark to-hinge-bar rounded-full shadow-inner" />
        <div className="w-5 h-5 rounded-full bg-gradient-to-b from-hinge-knob to-hinge-bar shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.3)]" />
      </div>
    </div>
  )
}
