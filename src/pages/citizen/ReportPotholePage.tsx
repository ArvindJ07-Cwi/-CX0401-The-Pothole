import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  LocateFixed,
  MapPin,
  Send,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Severity } from '../../types';

// ── Types ────────────────────────────────────────────────────────────────────
type SubmitState = 'idle' | 'loading' | 'success' | 'error';

interface FormValues {
  title: string;
  description: string;
  severity: Severity;
  address: string;
  lat: string;
  lng: string;
}

const SEVERITY_OPTIONS: { value: Severity; label: string; color: string }[] = [
  { value: 'low',      label: 'Low — Minor surface damage',          color: 'text-slate-600' },
  { value: 'medium',   label: 'Medium — Moderate depth, avoidable',  color: 'text-amber-600' },
  { value: 'high',     label: 'High — Deep / hard to avoid',         color: 'text-orange-600' },
  { value: 'critical', label: 'Critical — Immediate safety hazard',  color: 'text-red-600' },
];

const INITIAL: FormValues = {
  title: '',
  description: '',
  severity: 'medium',
  address: '',
  lat: '',
  lng: '',
};

// ── Field helpers ─────────────────────────────────────────────────────────────
function FieldLabel({ htmlFor, children, required }: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-600 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-red-500 text-[11px] mt-1">
      <AlertCircle size={10} />
      {msg}
    </p>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReportPotholePage() {
  const navigate    = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues]       = useState<FormValues>(INITIAL);
  const [errors, setErrors]       = useState<Partial<FormValues>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError]     = useState<string>('');
  const [locating, setLocating]         = useState(false);
  const [locError, setLocError]         = useState('');
  const [submitState, setSubmitState]   = useState<SubmitState>('idle');
  const [generatedRef, setGeneratedRef] = useState('');

  // ── Field change ─────────────────────────────────────────────────────────
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  // ── Photo upload ──────────────────────────────────────────────────────────
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

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Geolocation ───────────────────────────────────────────────────────────
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
        setLocError(
          err.code === 1
            ? 'Location access denied. Please allow it in browser settings.'
            : 'Could not get your location. Please enter manually.',
        );
        setLocating(false);
      },
      { timeout: 10_000 },
    );
  }

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Partial<FormValues> = {};
    if (!values.title.trim())       errs.title       = 'Title is required.';
    if (!values.description.trim()) errs.description = 'Description is required.';
    if (values.description.trim().length < 20)
      errs.description = 'Please provide at least 20 characters of description.';
    if (!values.address.trim())     errs.address     = 'Street address / landmark is required.';
    if (!photoFile)                 setPhotoError('A before photo is required.');

    setErrors(errs);
    return Object.keys(errs).length === 0 && !!photoFile;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitState('loading');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('severity', values.severity);
      formData.append('address', values.address);
      if (values.lat) formData.append('lat', values.lat);
      if (values.lng) formData.append('lng', values.lng);
      if (photoFile) formData.append('beforePhoto', photoFile);

      // Using axios as requested
      const res = await axios.post('http://localhost:8000/api/complaints', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const data = res.data;
      setGeneratedRef(`COMP-${String(data.id).padStart(4, '0')}`);
      setSubmitState('success');
    } catch (err) {
      console.error(err);
      setSubmitState('error');
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitState === 'success') {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-slate-800 font-semibold text-lg">Report Submitted!</h2>
            <p className="text-slate-500 text-sm mt-1">
              Your complaint has been received. A municipal officer will review and assign a contractor.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 inline-block">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Reference Number</p>
            <p className="font-mono text-lg font-bold text-slate-800 mt-0.5">{generatedRef}</p>
          </div>
          <p className="text-xs text-slate-400">
            Submitted: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={() => { setValues(INITIAL); setPhotoFile(null); setPhotoPreview(null); setSubmitState('idle'); }}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Report Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-slate-800 text-xl font-semibold">Report a Pothole</h2>
        <p className="text-slate-500 text-sm mt-1">
          Fill in the details below. Fields marked <span className="text-red-500">*</span> are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* ── Card 1: Complaint Details ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-slate-700 font-semibold text-sm border-b border-slate-100 pb-3">
            Complaint Details
          </h3>

          {/* Title */}
          <div>
            <FieldLabel htmlFor="title" required>Complaint Title</FieldLabel>
            <input
              id="title"
              name="title"
              type="text"
              value={values.title}
              onChange={handleChange}
              placeholder="e.g. Deep pothole near school entrance"
              maxLength={120}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-300 ${
                errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
              }`}
            />
            <FieldError msg={errors.title} />
          </div>

          {/* Description */}
          <div>
            <FieldLabel htmlFor="description" required>Description</FieldLabel>
            <textarea
              id="description"
              name="description"
              value={values.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the pothole — size, depth, how long it has been there, and any safety concerns."
              maxLength={1000}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-slate-300 ${
                errors.description ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
              }`}
            />
            <div className="flex justify-between mt-0.5">
              <FieldError msg={errors.description} />
              <span className="text-[10px] text-slate-400 ml-auto">
                {values.description.length}/1000
              </span>
            </div>
          </div>

          {/* Severity */}
          <div>
            <FieldLabel htmlFor="severity" required>Severity</FieldLabel>
            <select
              id="severity"
              name="severity"
              value={values.severity}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Card 2: Before Photo ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="text-slate-700 font-semibold text-sm border-b border-slate-100 pb-3">
            Before Photo <span className="text-red-500">*</span>
          </h3>

          {photoPreview ? (
            /* Preview */
            <div className="relative">
              <img
                src={photoPreview}
                alt="Before photo preview"
                className="w-full h-52 object-cover rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-800/70 hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
                aria-label="Remove photo"
              >
                <X size={14} />
              </button>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {photoFile?.name} ({(photoFile!.size / 1024).toFixed(0)} KB)
              </p>
            </div>
          ) : (
            /* Upload zone */
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center gap-2 transition-colors cursor-pointer ${
                photoError
                  ? 'border-red-300 bg-red-50 hover:bg-red-50'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
              }`}
              aria-label="Upload before photo"
            >
              <ImageIcon size={28} className={photoError ? 'text-red-400' : 'text-slate-400'} />
              <span className="text-sm font-medium text-slate-600">Click to upload a photo</span>
              <span className="text-[11px] text-slate-400">JPEG, PNG, WebP or HEIC · Max 10 MB</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,.heic,.jpg,.jpeg,.png,.webp"
            onChange={handlePhotoChange}
            className="hidden"
            aria-label="Before photo file input"
          />
          <FieldError msg={photoError} />
        </div>

        {/* ── Card 3: Location ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-slate-700 font-semibold text-sm border-b border-slate-100 pb-3">
            Location
          </h3>

          {/* Address */}
          <div>
            <FieldLabel htmlFor="address" required>Street Address / Landmark</FieldLabel>
            <input
              id="address"
              name="address"
              type="text"
              value={values.address}
              onChange={handleChange}
              placeholder="e.g. MG Road, Near Signal No. 4, Pune"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-300 ${
                errors.address ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
              }`}
            />
            <FieldError msg={errors.address} />
          </div>

          {/* Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel htmlFor="lat">GPS Coordinates (optional)</FieldLabel>
              <button
                type="button"
                onClick={handleGeolocate}
                disabled={locating}
                className="inline-flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 font-medium disabled:opacity-60"
              >
                {locating ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <LocateFixed size={11} />
                )}
                {locating ? 'Detecting…' : 'Use my location'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  id="lat"
                  name="lat"
                  type="text"
                  value={values.lat}
                  onChange={handleChange}
                  placeholder="Latitude"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-300"
                />
              </div>
              <div>
                <input
                  id="lng"
                  name="lng"
                  type="text"
                  value={values.lng}
                  onChange={handleChange}
                  placeholder="Longitude"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-300"
                />
              </div>
            </div>
            {locError && <FieldError msg={locError} />}
            {values.lat && values.lng && !locError && (
              <p className="flex items-center gap-1 text-[11px] text-green-600 mt-1">
                <MapPin size={10} />
                Location captured: {values.lat}, {values.lng}
              </p>
            )}
          </div>

          {/* Timestamp note */}
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 size={10} className="text-green-500" />
            Submission timestamp will be recorded automatically on submit.
          </p>
        </div>

        {/* ── Error banner ── */}
        {submitState === 'error' && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm font-medium">Submission failed</p>
              <p className="text-red-500 text-xs mt-0.5">
                Could not reach the server. Please try again.
              </p>
            </div>
          </div>
        )}

        {/* ── Submit ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitState === 'loading'}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            {submitState === 'loading' ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send size={15} />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
