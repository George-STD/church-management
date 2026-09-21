import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CalendarCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const FollowUpView: React.FC = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [servants, setServants] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [targetTypeTab, setTargetTypeTab] = useState<'MEMBERS' | 'SERVANTS'>('MEMBERS');

  useEffect(() => {
    loadInitial();
  }, [user?.role]);

  const loadInitial = async () => {
    try {
      const [sessRes, alertRes, memRes, servRes] = await Promise.all([
        api.getSessions(),
        api.getAbsenceAlerts(),
        api.getMembers(),
        api.getServants(),
      ]);

      if (sessRes.success && sessRes.data.length > 0) {
        setActiveSession(sessRes.data[0]);
      }
      if (alertRes.success) setAlerts(alertRes.data);
      if (memRes.success) setMembers(memRes.data);
      if (servRes.success) setServants(servRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAttendance = (targetId: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [targetId]: !prev[targetId],
    }));
  };

  const handleSaveAttendance = async () => {
    if (!activeSession) return;
    try {
      const records = Object.entries(attendanceMap).map(([targetId, attended]) => ({
        targetType: targetTypeTab === 'MEMBERS' ? 'SERVED_MEMBER' : 'SERVANT',
        targetId,
        itemType: 'SERVICE',
        attended,
      }));

      await api.recordAttendance(activeSession.id, records);
      alert('تم حفظ كشف الحضور بنجاح');
      loadInitial();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ الحضور');
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await api.resolveAbsenceAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      alert('تم إغلاق تنبيه الافتقاد');
    } catch (err: any) {
      alert(err.message || 'فشل التحديث');
    }
  };

  const isSupervisor = ['STAGE_SECRETARY', 'SECTOR_SECRETARY', 'GENERAL_SECRETARY'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Header & Session Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-brand-400" />
            جدول المتابعة والغياب الأسبوعي
          </h2>
          <p className="text-xs text-slate-400">
            تسجيل حضور القداس، خدمة مدارس الأحد، والافتقادات
          </p>
        </div>

        {activeSession && (
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300">
            الجلسة الحالية: <span className="font-bold text-white">{activeSession.title || 'خدمة الجمعة'}</span>
          </div>
        )}
      </div>

      {/* Absence Alerts Banner (SRS FR-4.3 / FR-11.1) */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>تنبيهات الغياب المتكرر والافتقاد ({alerts.length} مخدومين/خدام متغيبين)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {alerts.map((al) => (
              <div
                key={al.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-rose-800/40 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-semibold text-white">غياب متكرر ({al.consecutiveCount} أسابيع)</div>
                  <div className="text-[10px] text-slate-400">يتطلب زيارة منزلية أو اتصال رعوي</div>
                </div>
                <button
                  onClick={() => handleResolveAlert(al.id)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[11px] font-medium border border-emerald-500/30 transition"
                >
                  تم الافتقاد
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target Selector Tabs: Members vs Servants */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setTargetTypeTab('MEMBERS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            targetTypeTab === 'MEMBERS'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          حضور المخدومين (الفصل)
        </button>

        {isSupervisor && (
          <button
            onClick={() => setTargetTypeTab('SERVANTS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              targetTypeTab === 'SERVANTS'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            حضور الخدام (إشراف الأمناء)
          </button>
        )}
      </div>

      {/* Attendance Rapid-Tap Checklist (Mobile-First Rapid Input) */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">
            اضغط على الاسم لتحديد (حاضر / غائب) سريعاً
          </span>
          <button
            onClick={handleSaveAttendance}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition"
          >
            حفظ الكشف الآن
          </button>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto">
          {targetTypeTab === 'MEMBERS' ? (
            members.map((m) => {
              const isPresent = attendanceMap[m.id] ?? true;
              return (
                <div
                  key={m.id}
                  onClick={() => handleToggleAttendance(m.id)}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer transition select-none"
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{m.fullName}</div>
                    <div className="text-[11px] text-slate-400">{m.stageName || 'المرحلة'}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPresent ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                        <CheckCircle className="w-3.5 h-3.5" />
                        حاضر
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5" />
                        غائب
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            servants.map((s) => {
              const isPresent = attendanceMap[s.id] ?? true;
              return (
                <div
                  key={s.id}
                  onClick={() => handleToggleAttendance(s.id)}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer transition select-none"
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{s.fullName}</div>
                    <div className="text-[11px] text-brand-400">{s.role} - {s.stageName || 'عام'}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPresent ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                        <CheckCircle className="w-3.5 h-3.5" />
                        حاضر
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5" />
                        غائب
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
