interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export function LoadingSpinner({ size = 32, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="border-4 border-[#E8E0D0] border-t-[#CC1F1F] rounded-full animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  )
}
