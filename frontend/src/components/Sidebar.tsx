import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  UserSquare2,
  GraduationCap,
  FileQuestion,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ROLE_META } from '@/lib/domains';

export type TabId = 'profile' | 'pathway' | 'quiz' | 'admin';

interface NavItem {
  id: TabId;
  labelKey: string;
  icon: typeof LayoutDashboard;
  description: string;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { id: 'profile', labelKey: 'nav.profile', icon: UserSquare2, description: 'Competency gap assessment' },
  { id: 'pathway', labelKey: 'nav.pathway', icon: GraduationCap, description: 'iGOT & NSSTA recommendations' },
  { id: 'quiz', labelKey: 'nav.quizzes', icon: FileQuestion, description: 'Interactive quizzes & scoring' },
  { id: 'admin', labelKey: 'nav.admin', icon: BarChart3, description: 'Workforce skill gaps', adminOnly: true },
];

interface Props {
  active: TabId;
  onChange: (id: TabId) => void;
}

export default function Sidebar({ active, onChange }: Props) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const items = NAV.filter((item) => !item.adminOnly || user?.appRole === 'admin');
  const roleLabel = user ? ROLE_META[user.jobRole]?.label ?? user.jobRole : '';

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-ink-200 bg-white">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-ink-200">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight text-ink-900">StatCompetency AI</h1>
          <p className="text-[11px] leading-tight text-ink-500">Statistical Competency Platform</p>
        </div>
      </div>

      {/* User card */}
      {user && (
        <div className="mx-3 mt-4 rounded-lg border border-ink-200 bg-ink-50 p-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink-800">{user.name}</p>
              <p className="truncate text-[10px] text-ink-500">
                {user.appRole === 'admin' ? t('nav.admin') : roleLabel}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
              }`}
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'bg-ink-100 text-ink-500 group-hover:bg-ink-200'
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight">{t(item.labelKey)}</span>
                <span className="block truncate text-[11px] text-ink-400">{item.description}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-ink-200">
        <p className="text-[11px] leading-snug text-ink-400">
          Integrated with iGOT Karmayogi &amp; NSSTA for Official Statistics.
        </p>
      </div>
    </aside>
  );
}
