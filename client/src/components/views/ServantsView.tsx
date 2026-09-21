import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UserSquare2, UserPlus, Star, ArrowLeftRight, Ban, Phone, MapPin } from 'lucide-react';

export const ServantsView: React.FC = () => {
  const { user } = useAuth();
  const [servants, setServants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServant, setSelectedServant] = useState<any | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddServantModal, setShowAddServantModal] = useState(false);

  // Form states
  const [evalForm, setEvalForm] = useState({
    financialStatus: '',
    behaviorWithServed: '',
    behaviorWithServants: '',
    cooperation: '',
    individualWork: '',
    periodNotes: '',
  });

  const [transferForm, setTransferForm] = useState({
    toStageId: '',
    reason: '',
  });

  const [newServantForm, setNewServantForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    role: 'SERVANT',
    fatherConfessor: '',
  });

  useEffect(() => {
    loadServants();
  }, [user?.role]);

  const loadServants = async () => {
    setLoading(true);
    try {
      const res = await api.getServants();
      if (res.success) {
        setServants(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServant) return;
    try {
      await api.updateServantEvaluation(selectedServant.id, evalForm);
      alert('تم حفظ تقييم الخادم في السجل التراكمي بنجاح');
      setShowEvaluationModal(false);
      loadServants();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ التقييم');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServant) return;
    try {
      await api.transferServant(selectedServant.id, transferForm);
      alert('تم نقل الخادم وتسجيل العملية في سجل الانتقالات');
      setShowTransferModal(false);
      loadServants();
    } catch (err: any) {
      alert(err.message || 'فشل النقل');
    }
  };

  const handleToggleSuspend = async (servant: any) => {
    const newStatus = servant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const reason = prompt(`يرجى كتابة سبب ${newStatus === 'SUSPENDED' ? 'تجميد' : 'إعادة تفعيل'} الحساب:`);
    if (reason === null) return;
    try {
      await api.suspendServant(servant.id, { status: newStatus, reason });
      alert('تم تحديث حالة الحساب');
      loadServants();
    } catch (err: any) {
      alert(err.message || 'فشل التحديث');
    }
  };

  const handleCreateServant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createServant(newServantForm);
      alert('تم إنشاء حساب الخادم بنجاح');
      setShowAddServantModal(false);
      loadServants();
    } catch (err: any) {
      alert(err.message || 'فشل إنشاء الحساب');
    }
  };

  const isGeneralSecretary = user?.role === 'GENERAL_SECRETARY';
  const isSecretary = ['STAGE_SECRETARY', 'SECTOR_SECRETARY', 'GENERAL_SECRETARY'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserSquare2 className="w-5 h-5 text-brand-400" />
            سجل الخدام ومتابعة الأمانة (الخدام)
          </h2>
          <p className="text-xs text-slate-400">
            بيانات الخدام، التقييم الإشرافي (سلوك، تعاون، مبادرة)، وسجل الانتقالات
          </p>
        </div>

        {isSecretary && (
          <button
            onClick={() => setShowAddServantModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة خادم جديد</span>
          </button>
        )}
      </div>

      {/* Servants Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm animate-pulse">جاري تحميل سجل الخدام...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servants.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{s.fullName}</h3>
                    <div className="text-xs text-gold-400 font-semibold mt-0.5">{s.role}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      s.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {s.status === 'ACTIVE' ? 'نشط' : 'مجمد'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{s.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{s.stageName || s.sectorName || 'الأمانة العامة'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                {/* Evaluative action: enabled if supervisor */}
                {isSecretary && user?.id !== s.id && (
                  <button
                    onClick={async () => {
                      setSelectedServant(s);
                      try {
                        const full = await api.getServantById(s.id);
                        if (full.data?.evaluation) {
                          setEvalForm(full.data.evaluation);
                        } else {
                          setEvalForm({
                            financialStatus: '',
                            behaviorWithServed: '',
                            behaviorWithServants: '',
                            cooperation: '',
                            individualWork: '',
                            periodNotes: '',
                          });
                        }
                      } catch {
                        // ignore
                      }
                      setShowEvaluationModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gold-400 border border-gold-500/20 transition"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>تقييم الخادم (الإشراف)</span>
                  </button>
                )}

                {/* General Secretary Actions (FR-1.4: Transfer & Suspend) */}
                {isGeneralSecretary && user?.id !== s.id && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedServant(s);
                        setShowTransferModal(true);
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-brand-400" />
                      <span>نقل لمرحلة</span>
                    </button>

                    <button
                      onClick={() => handleToggleSuspend(s)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-medium border transition ${
                        s.status === 'ACTIVE'
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{s.status === 'ACTIVE' ? 'تجميد' : 'تفعيل'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evaluation Modal (SRS A1: Supervisor sets evaluative fields) */}
      {showEvaluationModal && selectedServant && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-gold-400" />
              تقييم الخادم: {selectedServant.fullName}
            </h3>
            <p className="text-xs text-slate-400">
              تسجيل التقييم الدوري وفقاً لمعايير الخدمة (الحالة المادية، السلوك مع المخدومين والخدام، التعاون، المبادرة والعمل الفردي).
            </p>

            <form onSubmit={handleSaveEvaluation} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">الحالة المادية</label>
                  <input
                    type="text"
                    value={evalForm.financialStatus}
                    onChange={(e) => setEvalForm({ ...evalForm, financialStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">روح التعاون والالتزام</label>
                  <input
                    type="text"
                    value={evalForm.cooperation}
                    onChange={(e) => setEvalForm({ ...evalForm, cooperation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">السلوك مع المخدومين</label>
                <input
                  type="text"
                  value={evalForm.behaviorWithServed}
                  onChange={(e) => setEvalForm({ ...evalForm, behaviorWithServed: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">السلوك مع زملائه الخدام</label>
                <input
                  type="text"
                  value={evalForm.behaviorWithServants}
                  onChange={(e) => setEvalForm({ ...evalForm, behaviorWithServants: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">المبادرة والعمل الفردي</label>
                <input
                  type="text"
                  value={evalForm.individualWork}
                  onChange={(e) => setEvalForm({ ...evalForm, individualWork: e.target.value })}
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

      {/* Transfer Modal (General Secretary Only, FR-1.4) */}
      {showTransferModal && selectedServant && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-brand-400" />
              نقل خادم إلى مرحلة أخرى (الأمانة العامة)
            </h3>
            <p className="text-xs text-slate-400">
              الخادم: <span className="text-white font-bold">{selectedServant.fullName}</span>
            </p>

            <form onSubmit={handleTransfer} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">المرحلة الجديدة</label>
                <select
                  required
                  value={transferForm.toStageId}
                  onChange={(e) => setTransferForm({ ...transferForm, toStageId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="">اختر المرحلة المستهدفة...</option>
                  <option value="stage-nursery">حضانة</option>
                  <option value="stage-primary-1-2">ابتدائي 1 و 2</option>
                  <option value="stage-primary-3-4">ابتدائي 3 و 4</option>
                  <option value="stage-primary-5-6">ابتدائي 5 و 6</option>
                  <option value="stage-prep-boys">اعدادي بنين</option>
                  <option value="stage-prep-girls">اعدادي بنات</option>
                  <option value="stage-secondary-boys">ثانوي بنين</option>
                  <option value="stage-secondary-girls">ثانوي بنات</option>
                  <option value="stage-university">جامعة وخريجين</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">سبب النقل الرعوي</label>
                <textarea
                  rows={2}
                  required
                  placeholder="اكتب مبررات النقل لسجل الانتقالات..."
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-lg shadow-brand-600/20"
                >
                  تأكيد النقل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Servant Modal (FR-1.2) */}
      {showAddServantModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">إضافة خادم جديد</h3>
            <form onSubmit={handleCreateServant} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={newServantForm.fullName}
                  onChange={(e) => setNewServantForm({ ...newServantForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={newServantForm.phone}
                    onChange={(e) => setNewServantForm({ ...newServantForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">كلمة المرور *</label>
                  <input
                    type="password"
                    required
                    value={newServantForm.password}
                    onChange={(e) => setNewServantForm({ ...newServantForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">أب الاعتراف</label>
                <input
                  type="text"
                  value={newServantForm.fatherConfessor}
                  onChange={(e) => setNewServantForm({ ...newServantForm, fatherConfessor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddServantModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-lg shadow-brand-600/20"
                >
                  إنشاء الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
