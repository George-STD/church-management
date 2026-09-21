import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Users, UserCheck, AlertTriangle, BookOpen, Heart, Activity } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [user?.role]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardAnalytics();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 text-sm animate-pulse">جاري تحميل بيانات لوحة القيادة...</div>
      </div>
    );
  }

  const isServant = user?.role === 'SERVANT';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-900/60 via-slate-900 to-indigo-950/50 border border-slate-800 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">
            {user?.stageName || user?.sectorName || 'الأمانة العامة'}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-2">
            سلام ونعمة، {user?.fullName} ✝️
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            {isServant
              ? 'مرحباً بك في لوحة متابعة فصلك وخدمتك الروحية. يمكنك هنا تسجيل التحضير ومتابعة حضور مخدوميك.'
              : 'نظرة عامة وإحصائيات مباشرة على مستوى الخدمة والمتابعة الرعوية لقطاعك.'}
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isServant ? (
          <>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs">المخدومين المسندين</span>
                <Users className="w-4 h-4 text-brand-400" />
              </div>
              <div className="text-2xl font-bold text-white">{data?.myAssignedMembersCount || 0}</div>
              <div className="text-[10px] text-slate-400">في فصلك الحالي</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs">نسبة حضور الخدمة</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{data?.attendanceRate || 100}%</div>
              <div className="text-[10px] text-slate-400">خلال آخر شهرين</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs">الدروس المحضرة</span>
                <BookOpen className="w-4 h-4 text-gold-400" />
              </div>
              <div className="text-2xl font-bold text-white">{data?.myPrepsCount || 0}</div>
              <div className="text-[10px] text-slate-400">تحضيرات معتمدة</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs">تنبيهات الافتقاد</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">{data?.activeAlertsCount || 0}</div>
              <div className="text-[10px] text-slate-400">مخدومين بحاجة لافتقاد</div>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs">إجمالي الخدام</span>
                <UserCheck className="w-4 h-4 text-brand-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {data?.stageServantsCount || data?.totalServants || 0}
              </div>
              <div className="text-[10px] text-slate-400">ضمن نطاق مسؤوليتك</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs">إجمالي المخدومين</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {data?.stageMembersCount || data?.totalMembers || 0}
              </div>
              <div className="text-[10px] text-slate-400">مسجلين في الكشوف</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs">تنبيهات الغياب المتكرر</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-400">
                {data?.activeAlertsCount || data?.totalAlerts || 0}
              </div>
              <div className="text-[10px] text-slate-400">تحتاج تدخلاً رعوياً</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs">متوسط حضور الخدمة</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                {data?.memberAttendanceRate || data?.overallHealthRate || 85}%
              </div>
              <div className="text-[10px] text-slate-400">معدل الانضباط العام</div>
            </div>
          </>
        )}
      </div>

      {/* Quick Spiritual & Follow-up Prompt */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">الحياة الروحية الخاصة (الخزنة المشفرة)</div>
            <div className="text-xs text-slate-400">سجل التناول، الاعتراف، والصلاة محفوظ بسرية تامة ولا يظهر لأحد</div>
          </div>
        </div>
        <span className="text-xs font-medium text-brand-400 bg-brand-500/10 px-3 py-1.5 rounded-lg border border-brand-500/20">
          محمي بتشفير تام
        </span>
      </div>
    </div>
  );
};
