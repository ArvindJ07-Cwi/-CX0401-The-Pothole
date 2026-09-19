export default function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-neutral-400 font-medium">{name}</p>
        <p className="text-neutral-300 text-sm mt-1">This feature is not yet implemented.</p>
      </div>
    </div>
  );
}
