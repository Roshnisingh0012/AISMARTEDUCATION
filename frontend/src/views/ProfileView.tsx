import { useMemo, useState } from 'react';
import {
  Save, RotateCcw, TrendingDown, TrendingUp, CheckCircle2, AlertTriangle,
  User, Briefcase, Clock, Building2, Wrench, Calculator, Cpu, Target,
} from 'lucide-react';
import CompetencyRadar from '@/components/RadarChart';
import DomainSlider from '@/components/Slider';
import {
  DOMAINS, DOMAIN_KEYS, ROLE_TARGETS, ROLE_META,
  STATISTICAL_ROLES, TECH_ROLES, emptyRatings, computeGaps,
} from '@/lib/domains';
import type { JobRole, DomainRatings, LearnerAssessment } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const DEPARTMENTS = [
  'MoSPI', 'Directorate of Economics & Statistics', 'NITI Aayog',
  'RBI', 'NIC', 'CDAC', 'Registrar General', 'Other',
];

export default function ProfileView() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [role, setRole] = useState<JobRole>(user?.jobRole ?? 'SSO');
  const [experience, setExperience] = useState(5);
  const [department, setDepartment] = useState(user?.department ?? DEPARTMENTS[0]);
  const [ratings, setRatings] = useState<DomainRatings>(emptyRatings());
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const target = ROLE_TARGETS[role];
  const roleMeta = ROLE_META[role];
  const gaps = useMemo(() => computeGaps(ratings, target), [ratings, target]);
  const totalGap = useMemo(
    () => DOMAIN_KEYS.reduce((sum, k) => sum + (gaps[k] ?? 0), 0),
    [gaps],
  );
  const avgSelf = useMemo(
    () => Math.round(DOMAIN_KEYS.reduce((s, k) => s + ratings[k], 0) / 4),
    [ratings],
  );

  // Dynamic skill gap matrix: each role's skills mapped to a domain and a gap value
  const skillMatrix = useMemo(() => {
    return roleMeta.skills.map((skill) => {
      // Determine which domain this skill falls under
      let domainKey: typeof DOMAIN_KEYS[number] = 'technical';
      const lower = skill.toLowerCase();
      if (['sampling', 'survey', 'national accounts', 'sqaf', 'nss', 'quality', 'tabulation', 'statistics', 'gdp'].some((k) => lower.includes(k))) {
        domainKey = 'statistical';
      } else if (['leadership', 'communication', 'ethics', 'coordination', 'strategy', 'policy'].some((k) => lower.includes(k))) {
        domainKey = 'behavioural';
      } else if (['api', 'portal', 'india stack', 'open data', 'e-gov', 'digital'].some((k) => lower.includes(k))) {
        domainKey = 'digital_governance';
      }
      const domainGap = gaps[domainKey] ?? 0;
      return { skill, domainKey, domainLabel: DOMAINS.find((d) => d.key === domainKey)?.label ?? '', gap: domainGap };
    });
  }, [roleMeta, gaps]);

  function reset() {
    setRatings(emptyRatings());
    setSavedMsg(null);
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    const payload: Omit<LearnerAssessment, 'id' | 'created_at'> = {
      name: name.trim() || 'Anonymous Learner',
      job_role: role,
      experience_years: experience,
      department,
      self_ratings: ratings,
      target_ratings: target,
      gap_summary: gaps,
    };
    try {
      const { error: dbError } = await supabase.from('learner_assessments').insert(payload);
      if (dbError) throw dbError;
      setSavedMsg('Assessment saved. Your competency profile now feeds the Admin Analytics dashboard.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save assessment. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const isTechRole = TECH_ROLES.includes(role);

  return (
    <div className="space-y-6">
      {!user?.has_completed_diagnostic && (
        <div className="gov-card bg-amber-50 border-l-4 border-l-amber-500 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="mt-1 bg-amber-100 p-2 rounded-full text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-amber-900 font-bold text-lg">Action Required: Mandatory Diagnostic Assessment</h3>
              <p className="text-amber-800 text-sm mt-1 mb-3">
                To calibrate your Competency Profile and receive targeted course recommendations, you must first complete the baseline assessment for your role: <span className="font-semibold">{roleMeta.label}</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      {/* Form column */}
      <div className="space-y-5">
        <section className="gov-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-brand-600" />
            <h3 className="text-sm font-bold text-ink-900">Learner Details</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="gov-label">Full name</label>
              <input className="gov-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anjali Sharma" />
            </div>

            {/* Grouped role selector */}
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
                        onClick={() => setRole(r)}
                        className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                          role === r ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200' : 'border-ink-300 bg-white text-ink-600 hover:bg-ink-50'
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
                        onClick={() => setRole(r)}
                        className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                          role === r ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200' : 'border-ink-300 bg-white text-ink-600 hover:bg-ink-50'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="gov-label flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Experience (yrs)</label>
                <input type="number" min={0} max={40} className="gov-input" value={experience} onChange={(e) => setExperience(Number(e.target.value))} />
              </div>
              <div>
                <label className="gov-label flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Department</label>
                <select className="gov-input" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic skills card */}
        <section className="gov-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-5 w-5 text-brand-600" />
            <h3 className="text-sm font-bold text-ink-900">Target Skills for {roleMeta.short}</h3>
          </div>
          <p className="text-xs text-ink-500 mb-3">{roleMeta.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {roleMeta.skills.map((s) => (
              <span key={s} className="gov-chip bg-brand-50 text-brand-700 border border-brand-200">{s}</span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2">
            <span className={`gov-chip ${isTechRole ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {isTechRole ? 'Tech Track' : 'Statistical Track'}
            </span>
            <span className="text-[11px] text-ink-500">Competency targets adapt to this role&apos;s profile.</span>
          </div>
        </section>

        <section className="gov-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-5 w-5 text-brand-600" />
            <h3 className="text-sm font-bold text-ink-900">Self-Assessment</h3>
          </div>
          <p className="text-xs text-ink-500 mb-4">
            Rate your current proficiency (0–100) in each domain. The target line shows the expected competency for a <strong>{roleMeta.label}</strong>.
          </p>
          <div className="space-y-3">
            {DOMAINS.map((d) => (
              <DomainSlider key={d.key} domain={d} value={ratings[d.key]} onChange={(v) => setRatings((prev) => ({ ...prev, [d.key]: v }))} />
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button onClick={save} disabled={saving} className="gov-btn-primary flex-1">
              <Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save Assessment'}
            </button>
            <button onClick={reset} className="gov-btn-ghost"><RotateCcw className="h-4 w-4" />Reset</button>
          </div>
          {savedMsg && (
            <p className="mt-3 flex items-start gap-1.5 text-xs text-emerald-700 animate-fadeIn">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{savedMsg}
            </p>
          )}
          {error && (
            <p className="mt-3 flex items-start gap-1.5 text-xs text-rose-600 animate-fadeIn">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}
            </p>
          )}
        </section>
      </div>

      {/* Radar + gap analysis column */}
      <div className="space-y-5">
        <section className="gov-card p-5">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
            <div>
              <h3 className="text-sm font-bold text-ink-900">Competency Radar</h3>
              <p className="text-xs text-ink-500">Your self-rated level vs. the {roleMeta.label} target across four domains.</p>
            </div>
            <div className="flex gap-2">
              <div className="rounded-lg bg-ink-50 px-3 py-1.5 text-center">
                <p className="text-[10px] uppercase tracking-wide text-ink-400">Avg level</p>
                <p className="text-lg font-bold text-ink-800">{avgSelf}</p>
              </div>
              <div className="rounded-lg bg-brand-50 px-3 py-1.5 text-center">
                <p className="text-[10px] uppercase tracking-wide text-brand-500">Total gap</p>
                <p className="text-lg font-bold text-brand-700">{totalGap}</p>
              </div>
            </div>
          </div>
          <CompetencyRadar self={ratings} target={target} />
        </section>

        {/* Dynamic Skill Gap Matrix */}
        <section className="gov-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-5 w-5 text-brand-600" />
            <h3 className="text-sm font-bold text-ink-900">Skill Gap Matrix for {roleMeta.label}</h3>
          </div>
          <p className="text-xs text-ink-500 mb-4">
            Each target skill is mapped to a competency domain. The gap column shows how far your self-rating in that domain is from the role target.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-ink-200 text-ink-500">
                  <th className="py-2 pr-4 font-semibold">Skill</th>
                  <th className="py-2 pr-4 font-semibold">Domain</th>
                  <th className="py-2 pr-4 font-semibold">Your level</th>
                  <th className="py-2 pr-4 font-semibold">Target</th>
                  <th className="py-2 pr-4 font-semibold">Gap</th>
                </tr>
              </thead>
              <tbody>
                {skillMatrix.map((row) => {
                  const selfVal = ratings[row.domainKey];
                  const targetVal = target[row.domainKey];
                  const gap = row.gap;
                  const meets = gap <= 0;
                  return (
                    <tr key={row.skill} className="border-b border-ink-100 last:border-0">
                      <td className="py-2 pr-4 font-medium text-ink-800">{row.skill}</td>
                      <td className="py-2 pr-4 text-ink-500">{row.domainLabel}</td>
                      <td className="py-2 pr-4">{selfVal}</td>
                      <td className="py-2 pr-4">{targetVal}</td>
                      <td className="py-2 pr-4">
                        <span className={`gov-chip ${meets ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {meets ? 'On target' : `${gap}`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="gov-card p-5">
          <h3 className="text-sm font-bold text-ink-900 mb-1">Domain Gap Analysis</h3>
          <p className="text-xs text-ink-500 mb-4">Positive gaps indicate areas to develop; zero or negative means you meet or exceed the target.</p>
          <div className="space-y-3">
            {DOMAINS.map((d) => {
              const gap = gaps[d.key] ?? 0;
              const pct = Math.min(100, (gap / 100) * 100);
              const meets = gap <= 0;
              return (
                <div key={d.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-ink-700">{d.label}</span>
                    <span className={meets ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                      {meets ? 'On target' : `${gap} pts to close`}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-ink-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${meets ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-brand-500'}`} style={{ width: `${meets ? 100 : Math.max(4, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {DOMAIN_KEYS.map((k) => {
              const gap = gaps[k] ?? 0;
              const Icon = gap <= 0 ? TrendingUp : TrendingDown;
              return (
                <div key={k} className={`rounded-lg border p-3 ${gap <= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                  <Icon className={`h-4 w-4 ${gap <= 0 ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <p className="mt-1 text-xs font-semibold text-ink-700">{DOMAINS.find((d) => d.key === k)?.label}</p>
                  <p className="text-[11px] text-ink-500">Self {ratings[k]} · Target {target[k]}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
    </div>
  );
}
