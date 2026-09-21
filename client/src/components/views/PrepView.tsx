import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BookOpen, Plus, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';

export const PrepView: React.FC = () => {
  const { user } = useAuth();
  const [preps, setPreps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedPrep, setSelectedPrep] = useState<any | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    topic: '',
    biblicalReference: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [reviewForm, setReviewForm] = useState({
    status: 'APPROVED',
    feedback: '',
  });

  useEffect(() => {
    loadPreps();
  }, [user?.role]);

  const loadPreps = async () => {
    setLoading(true);
    try {
      const res = await api.getPreps();
      if (res.success) {
        setPreps(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrep = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPrep(formData);
      alert('تم إرسال التحضير بنجاح للمراجعة والاعتماد');
      setShowSubmitModal(false);
      loadPreps();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في الإرسال');
    }
  };

  const handleReviewPrep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrep) return;
    try {
      await api.reviewPrep(selectedPrep.id, reviewForm);
      alert('تم حفظ اعتماد التحضير وملاحظات المراجعة');
      setShowReviewModal(false);
      loadPreps();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الاعتماد');
    }
  };

  const isSupervisor = ['STAGE_SECRETARY', 'SECTOR_SECRETARY', 'GENERAL_SECRETARY'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold-400" />
            تحضير الدروس والمناهج (التحضير)
          </h2>
          <p className="text-xs text-slate-400">
            تقديم التحضيرات الأسبوعية، والشواهد الكتابية، واعتماد أمين الخدمة
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gold-600 hover:bg-gold-500 text-slate-950 font-bold text-xs shadow-lg shadow-gold-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>تقديم تحضير جديد</span>
        </button>
      </div>

      {/* Preps List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm animate-pulse">جاري تحميل سجل التحضيرات...</div>
      ) : preps.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
          <p className="text-slate-400 text-sm">لا توجد تحضيرات مقدمة حتى الآن</p>
        </div>
      ) : (
        <div className="space-y-4">
          {preps.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{p.topic}</h3>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>بقلم: {p.author?.fullName}</span>
                    <span>•</span>
                    <span className="text-brand-400 font-medium">الشاهد: {p.biblicalReference || '—'}</span>
                  </div>
                </div>

                <div>
                  {p.status === 'APPROVED' ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      <CheckCircle className="w-3.5 h-3.5" />
                      معتمد
                    </span>
                  ) : p.status === 'NEEDS_REVISION' ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                      <AlertCircle className="w-3.5 h-3.5" />
                      يحتاج تعديل
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
                      <Clock className="w-3.5 h-3.5" />
                      قيد المراجعة
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-300 line-clamp-3 bg-slate-800/30 p-3 rounded-xl whitespace-pre-line border border-slate-800">
                {p.content}
              </div>

              {p.feedback && (
                <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-xs text-gold-300 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">ملاحظات أمين الخدمة ({p.reviewer?.fullName || 'المشرف'}):</span>{' '}
                    {p.feedback}
                  </div>
                </div>
              )}

              {isSupervisor && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedPrep(p);
                      setReviewForm({ status: p.status, feedback: p.feedback || '' });
                      setShowReviewModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                  >
                    مراجعة واعتماد التحضير
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submit Prep Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gold-400" />
              تقديم تحضير درس جديد
            </h3>

            <form onSubmit={handleCreatePrep} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">موضوع الدرس *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مثل السامري الصالح: من هو قريبي؟"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">الشاهد الكتابي</label>
                  <input
                    type="text"
                    placeholder="مثال: لوقا 10 : 25-37"
                    value={formData.biblicalReference}
                    onChange={(e) => setFormData({ ...formData, biblicalReference: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">تاريخ إلقاء الدرس</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">محتوى الدرس بالتفصيل والوسائل الإيضاحية *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="المقدمة التشويقية، نقاط الدرس الرئيسية، التطبيق العملي، الآية للحفظ..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gold-600 hover:bg-gold-500 text-xs font-bold text-slate-950 shadow-lg shadow-gold-600/20"
                >
                  إرسال التحضير الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedPrep && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">
              مراجعة تحضير: {selectedPrep.topic}
            </h3>

            <form onSubmit={handleReviewPrep} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">حالة الاعتماد</label>
                <select
                  value={reviewForm.status}
                  onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="APPROVED">معتمد بالكامل (APPROVED)</option>
                  <option value="NEEDS_REVISION">يحتاج تعديلات ومراجعة (NEEDS_REVISION)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">ملاحظات وتوجيهات أمين الخدمة</label>
                <textarea
                  rows={3}
                  placeholder="اكتب توجيهاتك أو كلمات التشجيع للخادم هنا..."
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-lg shadow-brand-600/20"
                >
                  حفظ الاعتماد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
