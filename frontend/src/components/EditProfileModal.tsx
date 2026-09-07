import { useState } from 'react';
import { X, Save, UserCog, Building2, Cpu, Calculator } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ROLE_META, STATISTICAL_ROLES, TECH_ROLES } from '@/lib/domains';
import type { JobRole } from '@/lib/types';

const DEPARTMENTS = [
  'MoSPI', 'Directorate of Economics & Statistics', 'NITI Aayog',
  'RBI', 'NIC', 'CDAC', 'Registrar General', 'Other',
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ open, onClose }: Props) {
  const { user, updateUser, saveProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [department, setDepartment] = useState(user?.department ?? DEPARTMENTS[0]);
  const [jobRole, setJobRole] = useState<JobRole>(user?.jobRole ?? 'SSO');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!open || !user) return null;

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    updateUser({ name: name.trim(), department, jobRole: jobRole });
    await saveProfile({
      email: user.email,
      name: name.trim(),
      job_role: jobRole,
      department,
      app_role: user.appRole,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-brand-600" />
            <h3 className="text-sm font-bold text-ink-900">Edit Profile &amp; Switch Role</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Current profile summary */}
          <div className="flex items-center gap-3 rounded-lg bg-ink-50 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-800">{user.email}</p>
              <p className="text-xs text-ink-500">
                Current role: {ROLE_META[user.jobRole]?.label ?? user.jobRole}
              </p>
            </div>
          </div>

          <div>
            <label className="gov-label">Full name</label>
            <input className="gov-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="gov-label flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Department
            </label>
            <select className="gov-input" value={department} onChange={(e) => setDepartment(e.target.value)}>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="gov-label">Job role</label>
            <div className="space-y-2.5">
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  <Calculator className="h-3.5 w-3.5" /> Statistical Officers
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {STATISTICAL_ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setJobRole(r)}
                      className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                        jobRole === r
                          ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                          : 'border-ink-300 bg-white text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  <Cpu className="h-3.5 w-3.5" /> IT / Engineering Roles
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TECH_ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setJobRole(r)}
                      className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                        jobRole === r
                          ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                          : 'border-ink-300 bg-white text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Target skills preview */}
          <div className="rounded-lg border border-ink-200 bg-ink-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400 mb-2">
              Target skills for {ROLE_META[jobRole]?.short}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_META[jobRole]?.skills.map((s) => (
                <span key={s} className="gov-chip bg-brand-50 text-brand-700 border border-brand-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-ink-200 px-5 py-4">
          <button onClick={onClose} className="gov-btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="gov-btn-primary">
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
