import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CalendarDays, Plus, Users } from 'lucide-react';

export const YearPlanView: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'ACTIVITY',
    description: '',
  });

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const res = await api.getYearPlanItems();
      if (res.success) {
        setItems(res.data);
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
      await api.createYearPlanItem(form);
      alert('تم إضافة الفعالية بنجاح');
      setShowAddModal(false);
      loadPlan();
    } catch (err: any) {
      alert(err.message || 'فشل الإضافة');
    }
  };

  const handleSignup = async (itemId: string) => {
    try {
      await api.signupForPlanItem(itemId, 'متطوع للخدمة والتنظيم');
      alert('تم تسجيل رغبتك في المشاركة بنجاح');
      loadPlan();
    } catch (err: any) {
      alert(err.message || 'فشل التسجيل');
    }
  };

  const getCategoryArabic = (cat: string) => {
    switch (cat) {
      case 'CONFERENCE': return 'مؤتمر روحي';
      case 'TRIP': return 'رحلة ترفيهية/ديرية';
      case 'ACTIVITY': return 'نشاط / نادي';
      case 'CURRICULUM': return 'مناهج ودروس';
      case 'MEETING': return 'اجتماع عام';
      default: return cat;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-400" />
            تدبير السنة والفعاليات والتقويم (تدبير السنة)
          </h2>
          <p className="text-xs text-slate-400">
            خطة الخدمة السنوية، المؤتمرات، الرحلات، وتسجيل الخدام للمشاركة
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فعالية بالخطة</span>
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm animate-pulse">جاري تحميل تدبير السنة...</div>
      ) : items.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
          لا توجد فعاليات مسجلة بتدبير السنة حتى الآن
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((it) => {
            const hasSignedUp = it.signups?.some((s: any) => s.userId === user?.id);
            return (
              <div
                key={it.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white">{it.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30 whitespace-nowrap">
                      {getCategoryArabic(it.category)}
                    </span>
                  </div>

                  <div className="text-xs text-brand-400 font-medium mt-1">
                    📅 {new Date(it.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>

                  <p className="text-xs text-slate-300 mt-3 line-clamp-3 bg-slate-800/30 p-3 rounded-xl border border-slate-800">
                    {it.description || 'لا يوجد وصف إضافي'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>المشاركون: {it.signups?.length || 0} خادم</span>
                  </div>

                  <button
                    onClick={() => handleSignup(it.id)}
                    disabled={hasSignedUp}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      hasSignedUp
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20'
                    }`}
                  >
                    {hasSignedUp ? '✓ تم تسجيلك' : 'التسجيل للمشاركة في الخدمة'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">إضافة فعالية جديدة إلى تدبير السنة</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">عنوان الفعالية أو التدبير *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مؤتمر الشباب السنوي، رحلة الأديرة..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">النوع</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="ACTIVITY">نشاط / نادي</option>
                    <option value="CONFERENCE">مؤتمر</option>
                    <option value="TRIP">رحلة</option>
                    <option value="CURRICULUM">مناهج</option>
                    <option value="MEETING">اجتماع</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">التفاصيل والشروط</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-lg shadow-brand-600/20"
                >
                  حفظ الفعالية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
