import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Search, UserPlus, FileSpreadsheet, Edit3, Phone, BookOpen, Star } from 'lucide-react';

export const MembersView: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  // Form states
  const [evalForm, setEvalForm] = useState({
    financialStatus: '',
    behaviorInService: '',
    integrationWithOthers: '',
    notes: '',
  });

  const [newMemberForm, setNewMemberForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    fatherName: '',
    motherName: '',
    schoolUniversity: '',
    educationalStage: '',
    fatherConfessor: '',
    stageId: user?.stageId || '',
  });

  useEffect(() => {
    loadMembers();
  }, [search]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await api.getMembers({ search });
      if (res.success) {
        setMembers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    try {
      await api.updateMemberEvaluation(selectedMember.id, evalForm);
      alert('تم حفظ تقييم المخدوم بنجاح');
      setShowEvaluationModal(false);
      loadMembers();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ التقييم');
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMember(newMemberForm);
      alert('تمت إضافة المخدوم بنجاح');
      setShowAddModal(false);
      loadMembers();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الإضافة');
    }
  };

  const isSecretary = ['ASSISTANT_SECRETARY', 'STAGE_SECRETARY', 'SECTOR_SECRETARY', 'GENERAL_SECRETARY'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم في سجل المخدومين..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {isSecretary && (
            <>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/20 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة مخدوم</span>
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>استيراد جماعي</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Members Grid / List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm animate-pulse">جاري تحميل سجل المخدومين...</div>
      ) : members.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
          <p className="text-slate-400 text-sm">لا توجد سجلات مخدومين مطابقة للبحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{m.fullName}</h3>
                    <div className="text-xs text-brand-400 mt-0.5">{m.stageName || 'المرحلة'}</div>
                  </div>
                  {m.isAssignedToMe && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                      مسند إليك
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  {m.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{m.phone}</span>
                    </div>
                  )}
                  {m.schoolUniversity && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>{m.schoolUniversity} {m.educationalStage ? `(${m.educationalStage})` : ''}</span>
                    </div>
                  )}
                </div>

                {/* Latest Evaluation Preview */}
                {m.latestEvaluation && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-300 space-y-1">
                    <div className="text-gold-400 font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      التقييم والسلوك بالخدمة:
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {m.latestEvaluation.behaviorInService || 'لا توجد ملاحظات سلوك'}
                    </p>
                  </div>
                )}
              </div>

              {/* Evaluative Edit Button (FR-3.1: Open to assigned servant or secretary) */}
              {(m.isAssignedToMe || isSecretary) && (
                <button
                  onClick={() => {
                    setSelectedMember(m);
                    setEvalForm({
                      financialStatus: m.latestEvaluation?.financialStatus || '',
                      behaviorInService: m.latestEvaluation?.behaviorInService || '',
                      integrationWithOthers: m.latestEvaluation?.integrationWithOthers || '',
                      notes: m.latestEvaluation?.notes || '',
                    });
                    setShowEvaluationModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-gold-400 border border-gold-500/20 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل تقييم المخدوم (الحالة / السلوك / الاندماج)</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Evaluation Modal (SRS FR-3.1 & A2) */}
      {showEvaluationModal && selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-gold-400" />
              تقييم المخدوم: {selectedMember.fullName}
            </h3>
            <p className="text-xs text-slate-400">
              وفقاً لقواعد النظام (FR-3.1)، يقوم الخادم المسند أو أمين الخدمة بتسجيل الحالة المادية والسلوك والاندماج بسرية.
            </p>

            <form onSubmit={handleSaveEvaluation} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الحالة المادية والاجتماعية</label>
                <input
                  type="text"
                  placeholder="مثال: أسرة مستقرة، أو تحتاج دعم في الأنشطة..."
                  value={evalForm.financialStatus}
                  onChange={(e) => setEvalForm({ ...evalForm, financialStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">سلوكه في الخدمة والدرس</label>
                <input
                  type="text"
                  placeholder="مثال: منتظم، هادئ ومستمع جيد، يحتاج تشجيع..."
                  value={evalForm.behaviorInService}
                  onChange={(e) => setEvalForm({ ...evalForm, behaviorInService: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">اندماجه وتفاعله مع باقي المخدومين</label>
                <input
                  type="text"
                  placeholder="مثال: اجتماعي جداً، أو يميل للانعزال..."
                  value={evalForm.integrationWithOthers}
                  onChange={(e) => setEvalForm({ ...evalForm, integrationWithOthers: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">ملاحظات رعوية خاصة</label>
                <textarea
                  rows={2}
                  value={evalForm.notes}
                  onChange={(e) => setEvalForm({ ...evalForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEvaluationModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-lg shadow-brand-600/20"
                >
                  حفظ التقييم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal (FR-3.2) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">إضافة مخدوم جديد في الكشوف</h3>
            <form onSubmit={handleCreateMember} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={newMemberForm.fullName}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">أب الاعتراف</label>
                  <input
                    type="text"
                    value={newMemberForm.fatherConfessor}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, fatherConfessor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">العنوان السكني</label>
                <input
                  type="text"
                  value={newMemberForm.address}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">المدرسة / الجامعة</label>
                  <input
                    type="text"
                    value={newMemberForm.schoolUniversity}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, schoolUniversity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">السنة الدراسية</label>
                  <input
                    type="text"
                    placeholder="مثال: الصف الثاني الإعدادي"
                    value={newMemberForm.educationalStage}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, educationalStage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
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
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal (FR-3.3) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              الاستيراد الجماعي للمخدومين (Excel / CSV)
            </h3>
            <p className="text-xs text-slate-400">
              يمكنك لصق قائمة أسماء المخدومين مباشرة (سطر لكل مخدوم، أو بتنسيق الاسم، رقم الهاتف، العنوان).
            </p>

            <textarea
              rows={6}
              id="bulkTextarea"
              placeholder="مارك يوسف ناصف, 01223344551, شبرا&#10;توماس شريف رفعت, 01223344552, العباسية&#10;كيرلس عماد فهيم, 01223344553, مصر الجديدة"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={async () => {
                  const val = (document.getElementById('bulkTextarea') as HTMLTextAreaElement)?.value;
                  if (!val) return;
                  const lines = val.split('\n').filter((l) => l.trim() !== '');
                  const parsed = lines.map((l) => {
                    const parts = l.split(',').map((p) => p.trim());
                    return { fullName: parts[0], phone: parts[1] || '', address: parts[2] || '' };
                  });
                  try {
                    await api.bulkImportMembers(user?.stageId || '', parsed);
                    alert(`تم استيراد ${parsed.length} مخدوم بنجاح`);
                    setShowImportModal(false);
                    loadMembers();
                  } catch (err: any) {
                    alert(err.message || 'فشل الاستيراد');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20"
              >
                بدء الاستيراد الفوري
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
