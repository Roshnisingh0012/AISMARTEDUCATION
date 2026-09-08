import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ExternalLink, Clock, Layers, Sparkles,
  ArrowRight, CheckCircle2, Loader2, BookOpen, BookMarked,
} from 'lucide-react';
import { COURSES } from '@/lib/courses';
import {
  DOMAINS, DOMAIN_KEYS, ALL_ROLES, ROLE_META,
  STATISTICAL_ROLES, TECH_ROLES,
} from '@/lib/domains';
import type { CourseCard, DomainKey, JobRole } from '@/lib/types';
import type { LearnerAssessment } from '@/lib/types';
import type { CourseRecommendation } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { fetchRecommendations } from '@/api/learner';
import { useTranslation } from 'react-i18next';

const ROLE_BADGE: Record<string, string> = {
  'iGOT Karmayogi': 'bg-brand-50 text-brand-700 border-brand-200',
  NSSTA: 'bg-sky-50 text-sky-700 border-sky-200',
  'NSSTA TPAC': 'bg-sky-50 text-sky-700 border-sky-200',
};

const LEVEL_BADGE: Record<string, string> = {
  Foundation: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  Advanced: 'bg-rose-50 text-rose-700 border-rose-200',
};

const DOMAIN_LABEL: Record<DomainKey, string> = {
  statistical: 'Statistical',
  technical: 'Technical',
  digital_governance: 'Digital Gov',
  behavioural: 'Behavioural',
};

interface EnrollmentRow {
  id: string;
  course_id: string;
  course_title: string;
  status: string;
  created_at: string;
}

export default function PathwayView() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isHi = i18n?.language?.startsWith('hi') ?? false;

  // @ts-ignore
  const role = user?.role || user?.designation || user?.jobRole || 'Senior Statistical Officer';
  const [assessment, setAssessment] = useState<LearnerAssessment | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Load existing enrollments from Supabase on mount
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from('course_enrollments')
        .select('id, course_id, course_title, status, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (data) {
        const rows = data as EnrollmentRow[];
        setEnrollments(rows);
        setEnrolledIds(new Set(rows.map((r) => r.course_id)));
      }
    })();
  }, []);

  // Load latest assessment for personalised ordering
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('learner_assessments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setAssessment(data as LearnerAssessment);
    })();
  }, []);

  const enroll = useCallback(
    async (course: CourseRecommendation) => {
      if (enrolledIds.has(course.course_id)) return;
      setPendingId(course.course_id);
      try {
        if (!user) throw new Error('Not signed in');

        try {
          if (supabase) {
            await supabase.from('course_enrollments').upsert(
              {
                user_id: user.email,
                learner_email: user.email,
                learner_name: user.name,
                course_id: course.course_id,
                course_title: course.title,
                job_role: user.jobRole,
                status: 'enrolled',
              },
              { onConflict: 'learner_email,course_id' },
            );
          }
        } catch (_) {}

        const newRow: EnrollmentRow = {
          id: crypto.randomUUID(),
          course_id: course.course_id,
          course_title: course.title,
          status: 'enrolled',
          created_at: new Date().toISOString(),
        };
        setEnrollments((prev) => [newRow, ...prev]);
        setEnrolledIds((prev) => new Set([...prev, course.course_id]));

        if (course.external_url) {
          window.open(course.external_url, '_blank', 'noopener,noreferrer');
        }
      } catch (err) {
        console.error('Enrollment error:', err);
        // Fallback open if offline
        if (course.external_url) {
          window.open(course.external_url, '_blank', 'noopener,noreferrer');
        }
      } finally {
        setPendingId(null);
      }
    },
    [enrolledIds, user],
  );

  const [recommended, setRecommended] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchRecommendations();
        setRecommended(res.courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Enrolled course details (matched from COURSES)
  const enrolledCourses = useMemo(() => {
    return enrollments
      .map((e) => {
        const course = COURSES.find((c) => c.id === e.course_id);
        return course ? { ...course, enrolledAt: e.created_at, status: e.status } : null;
      })
      .filter((c): c is CourseCard & { enrolledAt: string; status: string } => c !== null);
  }, [enrollments]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="gov-card p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="text-blue-600" size={26} />
              {t('pathway.title')}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{t('pathway.subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-50 border border-blue-200 text-blue-800 font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm">
              {t('pathway.targetRole')}: {role}
            </span>
            <span className="bg-gray-100 text-gray-700 font-semibold px-3 py-1.5 rounded-xl text-xs">
              {recommended.length} {t('pathway.courses')}
            </span>
          </div>
        </div>
      </div>

      {/* Enrolled Courses section */}
      {enrolledCourses.length > 0 && (
        <section className="gov-card p-5 bg-white border border-emerald-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookMarked className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900">{t('pathway.enrolled')}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {enrolledCourses.length}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${ROLE_BADGE[course.provider] || 'bg-gray-100 text-gray-700'}`}>
                    {course.provider}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {t('pathway.enrolled')}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">{course.title}</h4>
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {course.durationHours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" /> {DOMAIN_LABEL[course.domain]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Courses Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <div>{isHi ? 'पाठ्यक्रम लोड हो रहे हैं...' : 'Loading personalized course pathway...'}</div>
        </div>
      ) : recommended.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm text-gray-500">
          {isHi ? 'वर्तमान में कोई अनुशंसित पाठ्यक्रम उपलब्ध नहीं है।' : 'No recommended courses currently found.'}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recommended.map((course, idx) => {
            const isEnrolled = enrolledIds.has(course.course_id);
            const isPending = pendingId === course.course_id;
            return (
              <article
                key={course.course_id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${ROLE_BADGE[course.provider] || 'bg-gray-100 text-gray-700'}`}>
                      {course.provider}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${LEVEL_BADGE[course.level] || 'bg-gray-100 text-gray-700'}`}>
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">
                    {course.title}
                  </h3>
                  
                  <div className="mt-3 bg-amber-50/80 text-amber-900 text-xs p-3 rounded-xl font-medium flex items-start gap-2 border border-amber-200/50">
                    <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>{course.reason}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <Clock size={14} /> {course.duration || '4-6 Hours'}
                  </span>
                  <button
                    onClick={() => enroll(course)}
                    disabled={isEnrolled || isPending}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isEnrolled
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                    }`}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isEnrolled ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        {t('pathway.enrolled')}
                      </>
                    ) : (
                      <>
                        {t('pathway.enrollNow')}
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}