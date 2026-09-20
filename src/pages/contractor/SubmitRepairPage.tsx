import { AlertCircle, CheckCircle2, Image as ImageIcon, Loader2, LocateFixed, MapPin, Send, X, AlertTriangle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import SeverityBadge from '../../components/ui/SeverityBadge';
import { useAuth } from '../../context/AuthContext';
import type { Complaint } from '../../types';

const API = 'http://localhost:8000';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

interface FormValues {
  repairNotes: string;
  lat: string;
  lng: string;
}

function mapComplaint(c: any): Complaint {
  return {
    id: String(c.id),
    referenceNo: `COMP-${String(c.id).padStart(4, '0')}`,
    title: c.title,
    description: c.description,
    location: {
      address: c.address,
      coordinates: { lat: c.latitude ?? 0, lng: c.longitude ?? 0 },
    },
    severity: c.severity,
    status: c.status,
    reportedBy: String(c.citizen_id),
    reportedAt: c.created_at,
    beforePhotoUrl: c.before_image_path ? `${API}${c.before_image_path}` : undefined,
    afterPhotoUrl: c.repair_evidence?.after_image_path ? `${API}${c.repair_evidence.after_image_path}` : undefined,
    repairNote: c.repair_evidence?.repair_notes ?? undefined,
    updatedAt: c.updated_at,
    contractorName: c.contractor_name ?? undefined,
    assignedTo: c.contractor_id ? String(c.contractor_id) : undefined,
  };
}

export default function SubmitRepairPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [job, setJob] = useState<Complaint | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [jobError, setJobError] = useState('');

  const [values, setValues] = useState<FormValues>({ repairNotes: '', lat: '', lng: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!id || !token) return;
    async function loadJob() {
      try {
        const res = await axios.get(`${API}/api/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJob(mapComplaint(res.data));
      } catch (err: any) {
        if (err.response?.status === 404) {
          setJobError('Job not found.');
        } else if (err.response?.status === 403) {
          setJobError('Not authorized. This job might not be assigned to you.');
        } else {
          setJobError('Failed to load job details.');
        }
      } finally {
        setLoadingJob(false);
      }
    }
    loadJob();
  }, [id, token]);

  if (loadingJob) {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center">
        <Loader2 size={28} className="animate-spin text-blue-500 mx-auto" />
        <p className="text-slate-500 text-sm mt-3">Loading job details…</p>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center space-y-4">
        <AlertTriangle size={28} className="text-red-400 mx-auto" />
        <h2 className="text-xl font-semibold text-slate-800">{jobError || 'Job Not Found'}</h2>
        <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Back to Dashboard</button>
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
    if (!job) return;
    
    if (!photoFile) {
      setPhotoError('An after-repair photo is required.');
      return;
    }
    if (job?.status === 'submitted') {
       setSubmitError('Evidence already submitted for this job.');
       setSubmitState('error');
       return;
    }

    setSubmitState('loading');
    setSubmitError('');
    
    const formData = new FormData();
    formData.append('afterPhoto', photoFile);
    if (values.repairNotes) formData.append('repair_notes', values.repairNotes);
    if (values.lat) formData.append('lat', values.lat);
    if (values.lng) formData.append('lng', values.lng);

    try {
      await axios.post(`${API}/api/complaints/${job.id}/evidence`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setSubmitState('success');
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || 'Failed to submit evidence.');
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
        <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Back to Dashboard</button>
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
            <div className="h-32 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden border border-slate-300 text-slate-400 text-xs text-center p-0">
              {job.beforePhotoUrl ? (
                <img src={job.beforePhotoUrl} alt="Before" className="w-full h-full object-cover" />
              ) : (
                <span className="p-4">No photo provided by citizen.</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Submission Form ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-slate-700 font-semibold text-sm border-b border-slate-100 pb-2 mb-4">Repair Evidence</h3>
          
          {job?.status === 'submitted' ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg text-sm">
              Evidence already submitted for this job. You cannot submit again until it is flagged.
            </div>
          ) : (
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
                <div className="bg-red-50 text-red-700 text-xs p-2 rounded flex items-center gap-2"><AlertCircle size={14}/> {submitError}</div>
              )}

              <button type="submit" disabled={submitState === 'loading'} className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors text-sm font-medium">
                {submitState === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit Evidence</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
