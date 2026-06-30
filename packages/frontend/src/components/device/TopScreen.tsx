interface TopScreenProps {
  children: React.ReactNode
}

export function TopScreen({ children }: TopScreenProps) {
  return <div className="flex flex-col items-center justify-center h-full gap-2">{children}</div>
}
