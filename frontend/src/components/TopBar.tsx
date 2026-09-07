import { useState, useEffect, useRef } from 'react';
import {
  UserSquare2, GraduationCap, FileQuestion, BarChart3,
  ShieldCheck, LogOut, UserCog, Bell, CheckCircle2, AlertTriangle, BookOpen
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { ROLE_META } from '@/lib/domains';
import EditProfileModal from '@/components/EditProfileModal';
import type { TabId } from './Sidebar';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/api/learner';
import type { AppNotification } from '@/types';

const TITLES: Record<TabId, { titleKey: string; subKey: string }> = {
  profile: { titleKey: 'nav.learnerProfile', subKey: 'nav.selfAssessDesc' },
  pathway: { titleKey: 'nav.coursePathway', subKey: 'nav.curatedBy' },
  quiz: { titleKey: 'nav.pdfQuizGen', subKey: 'nav.quizGenDesc' },
  admin: { titleKey: 'nav.admin', subKey: 'nav.admin' }, // admin dashboard strings aren't specified, reusing admin key
};

const MOBILE_NAV: { id: TabId; icon: typeof ShieldCheck; labelKey: string }[] = [
  { id: 'profile', icon: UserSquare2, labelKey: 'nav.profile' },
  { id: 'pathway', icon: GraduationCap, labelKey: 'nav.pathway' },
  { id: 'quiz', icon: FileQuestion, labelKey: 'nav.quizzes' },
  { id: 'admin', icon: BarChart3, labelKey: 'nav.admin' },
];

interface Props {
  active: TabId;
  onChange: (id: TabId) => void;
}

export default function TopBar({ active, onChange }: Props) {
  const { user, logout } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const meta = TITLES[active];
  const roleLabel = user ? ROLE_META[user.jobRole]?.label ?? user.jobRole : '';

  useEffect(() => {
    if (user) {
      fetchNotifications().then(setNotifications).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="flex items-center gap-3 px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-ink-900">StatCompetency AI</span>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-lg font-bold text-ink-900">{t(meta.titleKey)}</h2>
            <p className="text-xs text-ink-500">{t(meta.subKey)}</p>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <div className="flex items-center rounded-lg border border-ink-300 bg-white p-0.5 text-[11px] font-semibold text-ink-600 shadow-sm">
              <button
                onClick={() => i18n.changeLanguage('en')}
                className={`rounded-md px-2 py-1 transition ${i18n.language.startsWith('en') ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-300/50' : 'hover:bg-ink-50'}`}
              >
                EN
              </button>
              <span className="w-[1px] h-3 bg-ink-200 mx-0.5" />
              <button
                onClick={() => i18n.changeLanguage('hi')}
                className={`rounded-md px-2 py-1 transition ${i18n.language.startsWith('hi') ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-300/50' : 'hover:bg-ink-50'}`}
              >
                हिन्दी
              </button>
            </div>
            {user && (
              <div className="hidden sm:flex items-center gap-2.5 rounded-lg border border-ink-200 bg-ink-50 px-3 py-1.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-ink-800">{user.name}</p>
                  <p className="text-[10px] text-ink-500">
                    {user.appRole === 'admin' ? t('nav.admin') : roleLabel}
                  </p>
                </div>
              </div>
            )}
            
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative grid h-9 w-9 place-items-center rounded-lg border border-ink-300 bg-white text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-ink-200 bg-white shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/50 px-4 py-3">
                    <h3 className="font-bold text-ink-900">{t('nav.notifications', 'Notifications')}</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        {t('nav.markAllRead', 'Mark all as read')}
                      </button>
                    )}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-ink-500 text-sm">
                        {t('nav.noNotifications', 'No notifications available.')}
                      </div>
                    ) : (
                      <ul className="divide-y divide-ink-100">
                        {notifications.map((n) => (
                          <li 
                            key={n.id} 
                            onClick={() => !n.is_read && handleMarkRead(n.id)}
                            className={`p-4 transition ${n.is_read ? 'bg-white opacity-70' : 'bg-brand-50/30 cursor-pointer hover:bg-brand-50/50'}`}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${n.type === 'gap_alert' ? 'bg-rose-100 text-rose-600' : 'bg-brand-100 text-brand-600'}`}>
                                {n.type === 'gap_alert' ? <AlertTriangle size={14} /> : <BookOpen size={14} />}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-xs ${n.is_read ? 'font-medium text-ink-800' : 'font-bold text-ink-900'}`}>
                                    {n.title}
                                  </p>
                                  <span className="shrink-0 text-[10px] text-ink-400">
                                    {new Date(n.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className={`text-[11px] leading-relaxed ${n.is_read ? 'text-ink-500' : 'text-ink-700 font-medium'}`}>
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <span className="gov-chip bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulseSoft" />
              {t('nav.live')}
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </div>
        </div>

        {/* Mobile tab bar */}
        <nav className="flex lg:hidden border-t border-ink-200 bg-white">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition ${
                  isActive ? 'text-brand-700' : 'text-ink-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                {t(item.labelKey)}
              </button>
            );
          })}
        </nav>
      </header>
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}
