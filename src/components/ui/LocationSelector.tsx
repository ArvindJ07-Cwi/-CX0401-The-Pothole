import { useState, useMemo } from 'react';
import type { GeographicArea } from '../../types';

interface Props {
  areas: GeographicArea[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  multiSelect?: boolean;
}

export default function LocationSelector({ areas, selectedIds, onChange, multiSelect = false }: Props) {
  const [stateFilter, setStateFilter] = useState<number | ''>('');
  const [regionFilter, setRegionFilter] = useState<number | ''>('');
  const [cityFilter, setCityFilter] = useState<number | ''>('');

  const states = useMemo(() => areas.filter(a => a.level === 'state'), [areas]);
  const regions = useMemo(() => areas.filter(a => a.level === 'region' && a.parent_id === stateFilter), [areas, stateFilter]);
  const cities = useMemo(() => areas.filter(a => a.level === 'city' && a.parent_id === regionFilter), [areas, regionFilter]);
  const localities = useMemo(() => areas.filter(a => a.level === 'locality' && a.parent_id === cityFilter), [areas, cityFilter]);

  const handleSelect = (id: number) => {
    if (multiSelect) {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter(x => x !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    } else {
      onChange([id]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={stateFilter}
          onChange={(e) => {
            setStateFilter(Number(e.target.value) || '');
            setRegionFilter('');
            setCityFilter('');
          }}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select State...</option>
          {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        
        <select
          value={regionFilter}
          onChange={(e) => {
            setRegionFilter(Number(e.target.value) || '');
            setCityFilter('');
          }}
          disabled={!stateFilter}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">Select Region...</option>
          {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(Number(e.target.value) || '')}
          disabled={!regionFilter}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">Select City...</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {cityFilter !== '' && localities.length > 0 && (
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Available Localities</p>
          <div className="grid grid-cols-2 gap-2">
            {localities.map(loc => (
              <label key={loc.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type={multiSelect ? "checkbox" : "radio"}
                  name="locality"
                  checked={selectedIds.includes(loc.id)}
                  onChange={() => handleSelect(loc.id)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                {loc.name}
              </label>
            ))}
          </div>
        </div>
      )}
      
      {multiSelect && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Or Select Larger Areas</p>
          <div className="flex flex-wrap gap-2">
             {stateFilter !== '' && (
                <label className="flex items-center gap-1.5 text-xs bg-slate-100 px-2 py-1 rounded-md cursor-pointer border border-slate-200">
                  <input type="checkbox" checked={selectedIds.includes(Number(stateFilter))} onChange={() => handleSelect(Number(stateFilter))} />
                  Entire {states.find(s=>s.id === Number(stateFilter))?.name}
                </label>
             )}
             {regionFilter !== '' && (
                <label className="flex items-center gap-1.5 text-xs bg-slate-100 px-2 py-1 rounded-md cursor-pointer border border-slate-200">
                  <input type="checkbox" checked={selectedIds.includes(Number(regionFilter))} onChange={() => handleSelect(Number(regionFilter))} />
                  Entire {regions.find(r=>r.id === Number(regionFilter))?.name}
                </label>
             )}
             {cityFilter !== '' && (
                <label className="flex items-center gap-1.5 text-xs bg-slate-100 px-2 py-1 rounded-md cursor-pointer border border-slate-200">
                  <input type="checkbox" checked={selectedIds.includes(Number(cityFilter))} onChange={() => handleSelect(Number(cityFilter))} />
                  Entire {cities.find(c=>c.id === Number(cityFilter))?.name}
                </label>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
