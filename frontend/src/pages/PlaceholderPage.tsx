export default function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-slate-400 font-medium">{name}</p>
        <p className="text-slate-300 text-sm mt-1">This feature is not yet implemented.</p>
      </div>
    </div>
  );
}
