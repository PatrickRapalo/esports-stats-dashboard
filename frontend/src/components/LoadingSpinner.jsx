export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-500">
      <div className="w-10 h-10 border-2 border-dark-500 border-t-accent-blue rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
