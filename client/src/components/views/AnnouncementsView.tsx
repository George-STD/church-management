import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Bell, Plus, CheckCheck, Send } from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    targetScopeType: 'STAGE',
    targetRoles: ['SERVANT'],
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.getAnnouncements();
      if (res.success) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAnnouncement(form);
      alert('تم نشر الإعلان بنجاح للجمهور المستهدف');
      setShowModal(false);
      loadAnnouncements();
    } catch (err: any) {
      alert(err.message || 'فشل النشر');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markAnnouncementRead(id);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const canPublish = ['STAGE_SECRETARY', 'SECTOR_SECRETARY', 'GENERAL_SECRETARY'].includes(user?.role);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-gold-400" />
            الإعلانات والتعميمات الإدارية
          </h2>
          <p className="text-xs text-slate-400">
            تنبيهات مواعيد الاجتماعات، القرارات الرسمية، وتوجيهات الأمانة
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gold-600 hover:bg-gold-500 text-slate-950 font-bold text-xs shadow-lg shadow-gold-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>نشر تعميم جديد</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm animate-pulse">جاري تحميل الإعلانات...</div>
      ) : announcements.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
          لا توجد إعلانات موجهة إليك في الوقت الحالي
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`p-5 rounded-2xl border transition space-y-3 ${
                a.isRead
                  ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                  : 'bg-slate-900 border-gold-500/30 shadow-lg shadow-gold-500/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {!a.isRead && (
                      <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping"></span>
                    )}
                    {a.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1">
                    المرسل: <span className="text-gold-400 font-semibold">{a.authorName}</span> ({a.authorRole}) •{' '}
                    {new Date(a.createdAt).toLocaleDateString('ar-EG')}
                  </div>
                </div>

                {!a.isRead && (
                  <button
                    onClick={() => handleMarkRead(a.id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-brand-400" />
                    <span>تحديد كمقروء</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/40 p-3.5 rounded-xl border border-slate-800/60 whitespace-pre-line">
                {a.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal with Downward Authority Validation (FR-10.2) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-gold-400" />
              نشر إعلان / تعميم رسمي
            </h3>
            <p className="text-xs text-slate-400">
              قاعدة النظام (FR-10.2): يتم توجيه الإعلان للأدوار المساوية أو الأقل من دورك في التسلسل الهرمي فقط.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">عنوان الإعلان *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تنبيه هام بشأن موعد اجتماع الخدام..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الجمهور المستهدف (الأدوار)</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="p-2 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.targetRoles.includes('SERVANT')}
                      onChange={(e) => {
                        if (e.target.checked) setForm({ ...form, targetRoles: [...form.targetRoles, 'SERVANT'] });
                        else setForm({ ...form, targetRoles: form.targetRoles.filter((r) => r !== 'SERVANT') });
                      }}
                    />
                    <span>الخدام (SERVANT)</span>
                  </label>

                  <label className="p-2 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.targetRoles.includes('ASSISTANT_SECRETARY')}
                      onChange={(e) => {
                        if (e.target.checked) setForm({ ...form, targetRoles: [...form.targetRoles, 'ASSISTANT_SECRETARY'] });
                        else setForm({ ...form, targetRoles: form.targetRoles.filter((r) => r !== 'ASSISTANT_SECRETARY') });
                      }}
                    />
                    <span>مساعدو الأمناء</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">نص التعميم / الإعلان *</label>
                <textarea
                  rows={5}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gold-600 hover:bg-gold-500 text-xs font-bold text-slate-950 shadow-lg shadow-gold-600/20"
                >
                  نشر الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
