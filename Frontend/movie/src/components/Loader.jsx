export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
      <span>{label}</span>
    </div>
  );
}
