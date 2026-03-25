export default function ErrorBanner({ message }) {
  return (
    <div className="bg-red-950/50 border border-red-900 text-red-400 rounded-xl px-5 py-4 text-sm">
      <strong>Error:</strong> {message}
      <p className="mt-1 text-red-500/70 text-xs">Make sure the backend is running on localhost:8000</p>
    </div>
  )
}
