export default function EventDetailsLoading() {
  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl animate-pulse px-4 py-8">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="h-72 rounded-2xl bg-slate-200 md:col-span-2 md:h-96" />
        <div className="h-72 rounded-2xl bg-slate-100 md:h-96" />
      </div>
      <div className="mt-8 h-64 rounded-2xl bg-slate-100" />
    </div>
  );
}
