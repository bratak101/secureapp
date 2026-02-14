export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Ładowanie…</p>
    </div>
  )
}
