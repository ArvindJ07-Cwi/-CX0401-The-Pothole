import { AlertCircle, CheckCircle2, Image as ImageIcon, Loader2, LocateFixed, MapPin, Send, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SeverityBadge from '../../components/ui/SeverityBadge';
import { MOCK_CONTRACTOR_JOBS } from '../../data/mockContractorJobs';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

interface FormValues {
  repairNotes: string;
  lat: string;
  lng: string;
}

export default function SubmitRepairPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // MOCK FETCH - Replace with API
  const job = MOCK_CONTRACTOR_JOBS.find(j => j.id === id);

  const [values, setValues] = useState<FormValues>({ repairNotes: '', lat: '', lng: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center">
        <h2 className="text-xl font-semibold text-slate-800">Job Not Found</h2>
        <p className="text-slate-500 mt-2">The requested repair job does not exist or you do not have permission.</p>
        <button onClick={() => navigate('/jobs')} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Back to Jobs</button>
      </div>
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoError('');
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowed.includes(file.type) && !file.name.toLowerCase().match(/\.(jpe?g|png|webp|heic)$/)) {
      setPhotoError('Only JPEG, PNG, WebP, or HEIC images are accepted.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('File must be under 10 MB.');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleGeolocate() {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValues((prev) => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      (err) => {
        setLocError(err.code === 1 ? 'Location access denied.' : 'Could not get your location.');
        setLocating(false);
      },
      { timeout: 10_000 },
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!photoFile) {
      setPhotoError('An after-repair photo is required.');
      return;
    }

    setSubmitState('loading');
    
    // MOCK API CALL
    await new Promise((res) => setTimeout(res, 1800));
    
    if (Math.random() > 0.1) {
      setSubmitState('success');
    } else {
      setSubmitState('error');
    }
  }

  if (submitState === 'success') {
    return (
      <div className="max-w-lg mx-auto mt-10 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-4">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h2 className="text-slate-800 font-semibold text-lg">Evidence Submitted!</h2>
        <p className="text-slate-500 text-sm mt-1">
          Repair evidence for <strong>{job.referenceNo}</strong> has been submitted. It is now <strong>Pending Verification</strong>.
        </p>
        <button onClick={() => navigate('/jobs')} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-slate-800 text-xl font-semibold">Submit Repair Evidence</h2>
        <p className="text-slate-500 text-sm mt-1">Job Reference: {job.referenceNo}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Original Complaint Details ── */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-slate-700 font-semibold text-sm border-b border-slate-200 pb-2">Original Complaint</h3>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Title</p>
            <p className="text-slate-800 text-sm mt-0.5 font-medium">{job.title}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Description</p>
            <p className="text-slate-700 text-sm mt-0.5">{job.description}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Severity</p>
            <SeverityBadge severity={job.severity} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Location</p>
            <p className="text-slate-700 text-sm mt-0.5 flex items-start gap-1">
              <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
              {job.location.address}
            </p>
          </div>
          <div className="pt-2">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Before Photo</p>
            <div className="h-32 bg-slate-200 rounded-lg flex items-center justify-center border border-slate-300 text-slate-400 text-xs text-center p-4">
              {job.beforePhotoUrl ? (
                <img src={job.beforePhotoUrl} alt="Before" className="w-full h-full object-cover rounded-lg" />
              ) : (
                'No photo provided by citizen.'
              )}
            </div>
          </div>
        </div>

        {/* ── Submission Form ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-slate-700 font-semibold text-sm border-b border-slate-100 pb-2 mb-4">Repair Evidence</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* After Photo */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">After Photo <span className="text-red-500">*</span></label>
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="After" className="w-full h-40 object-cover rounded-lg border border-slate-200" />
                  <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="absolute top-2 right-2 w-7 h-7 bg-slate-800/70 text-white rounded-full flex items-center justify-center"><X size={14} /></button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-40 border-2 border-dashed border-slate-200 bg-slate-50 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100">
                  <ImageIcon size={24} className="mb-2" />
                  <span className="text-sm">Upload repaired photo</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              {photoError && <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1"><AlertCircle size={10} />{photoError}</p>}
            </div>

            {/* Location Check-in */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-600">Repair Location Check-in</label>
                <button type="button" onClick={handleGeolocate} disabled={locating} className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                  {locating ? <Loader2 size={10} className="animate-spin" /> : <LocateFixed size={10} />}
                  Capture Location
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input readOnly value={values.lat} placeholder="Lat" className="w-full px-2 py-1.5 text-xs border rounded bg-slate-50 text-slate-500" />
                <input readOnly value={values.lng} placeholder="Lng" className="w-full px-2 py-1.5 text-xs border rounded bg-slate-50 text-slate-500" />
              </div>
              {locError && <p className="text-red-500 text-[11px] mt-1">{locError}</p>}
            </div>

            {/* Repair Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Repair Notes (optional)</label>
              <textarea
                value={values.repairNotes}
                onChange={(e) => setValues(prev => ({...prev, repairNotes: e.target.value}))}
                rows={3}
                placeholder="Details about materials used, dimensions repaired, etc."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-slate-300"
              />
            </div>

            {submitState === 'error' && (
              <div className="bg-red-50 text-red-700 text-xs p-2 rounded flex gap-1"><AlertCircle size={14}/> Submit failed. Try again.</div>
            )}

            <button type="submit" disabled={submitState === 'loading'} className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors text-sm font-medium">
              {submitState === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit Evidence</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
