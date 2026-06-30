interface BottomScreenProps {
  children: React.ReactNode
}

export function BottomScreen({ children }: BottomScreenProps) {
  return <div className="h-full overflow-auto">{children}</div>
}
