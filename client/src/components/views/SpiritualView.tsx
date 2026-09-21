import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Heart, Lock, ShieldCheck, Calendar } from 'lucide-react';

export const SpiritualView: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hadCommunion: false,
    hadConfession: false,
    regularPrayer: true,
    scriptureReadingMinutes: 15,
    privateNotes: '',
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await api.getSpiritualEntries();
      if (res.success) {
        setEntries(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.logSpiritualEntry(form);
      alert('تم حفظ السجل الروحي بنجاح في خزنتك الخاصة المشفرة');
      loadEntries();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Privacy Notice Banner (SRS NFR-3.4) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            الخزنة الروحية الشخصية (Zero-Leak Security Vault)
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            وفقاً لمتطلبات النظام (SRS NFR-3.4 & FR-6.2)، هذه البيانات مشفرة وخاصة بك وحدك. لا تظهر لأي أمين خدمة أو في أي تقارير أو لوحات إحصائية عامة إطلاقاً.
          </p>
        </div>
      </div>

      {/* Log Form Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          تسجيل المتابعة الروحية لليوم
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-slate-300 mb-1">التاريخ</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition">
              <input
                type="checkbox"
                checked={form.hadCommunion}
                onChange={(e) => setForm({ ...form, hadCommunion: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-0"
              />
              <span className="text-xs font-semibold text-white">التناول من الأسرار المقدسة</span>
            </label>

            <label className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition">
              <input
                type="checkbox"
                checked={form.hadConfession}
                onChange={(e) => setForm({ ...form, hadConfession: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-0"
              />
              <span className="text-xs font-semibold text-white">جلسة اعتراف مع أب الاعتراف</span>
            </label>

            <label className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition">
              <input
                type="checkbox"
                checked={form.regularPrayer}
                onChange={(e) => setForm({ ...form, regularPrayer: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-0"
              />
              <span className="text-xs font-semibold text-white">صلاة المزامير والصلوات الخاصة</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">قراءة الإنجيل (بالدقائق)</label>
            <input
              type="number"
              min={0}
              value={form.scriptureReadingMinutes}
              onChange={(e) => setForm({ ...form, scriptureReadingMinutes: parseInt(e.target.value, 10) || 0 })}
              className="w-32 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">خواطر أو تدريب روحي خاص</label>
            <textarea
              rows={2}
              placeholder="تدريب الأسبوع، آية للملاحظة، مشاعر روحية خاصة..."
              value={form.privateNotes}
              onChange={(e) => setForm({ ...form, privateNotes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition"
            >
              حفظ السجل في الخزنة
            </button>
          </div>
        </form>
      </div>

      {/* Historical Entries */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300">سجلاتي الروحية السابقة</h3>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm animate-pulse">جاري فك تشفير السجلات...</div>
        ) : entries.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
            لا توجد سجلات روحية محفوظة حتى الآن
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-white">
                    {new Date(entry.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {entry.hadCommunion && (
                    <span className="px-2.5 py-1 rounded-full bg-gold-500/20 text-gold-400 font-semibold">
                      تناول
                    </span>
                  )}
                  {entry.hadConfession && (
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 font-semibold">
                      اعتراف
                    </span>
                  )}
                  {entry.regularPrayer && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                      صلاة
                    </span>
                  )}
                  <span className="text-slate-400">
                    📖 {entry.scriptureReadingMinutes} دقيقة إنجيل
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
