import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { FileSpreadsheet, Download, ShieldCheck, FileText } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { user } = useAuth();

  const handleDownloadMembersExcel = () => {
    const url = api.getExportMembersExcelUrl(user?.stageId);
    window.open(url, '_blank');
  };

  const isSecretary = ['STAGE_SECRETARY', 'SECTOR_SECRETARY', 'GENERAL_SECRETARY'].includes(user?.role);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          مركز التقارير وتصدير ملفات Excel و PDF
        </h2>
        <p className="text-xs text-slate-400">
          تصدير كشوف الحضور، سجلات المخدومين، والإحصائيات الرسمية متوافقة بالكامل مع التنسيق العربي (RTL)
        </p>
      </div>

      {/* Audit Warning */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-300">
          <span className="font-bold text-white">ضوابط حماية البيانات وتدقيق التصدير (SRS NFR-3.3):</span>{' '}
          كل عملية تصدير لكشوف تحتوي على أرقام هواتف أو عناوين قُصّر يتم تسجيلها تلقائياً في سجل الرقابة والأمان (Audit Log) مع وقت وتاريخ واسم المصدر.
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Report 1: Members Roster Excel */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">كشف المخدومين الشامل (Excel)</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              ملف Excel منسق بالكامل من اليمين إلى اليسار، يتضمن الأسماء، أرقام الهواتف، العناوين، الخدام المسؤولين، وملاحظات السلوك.
            </p>
          </div>

          <button
            onClick={handleDownloadMembersExcel}
            disabled={!isSecretary}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
              isSecretary
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isSecretary ? 'تصدير الكشف (Excel .xlsx)' : 'صلاحية تصدير لأمين الخدمة فقط'}</span>
          </button>
        </div>

        {/* Report 2: Attendance Statistical Summary */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">بيان نسب الحضور والغياب الربع سنوي</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              تقرير إحصائي يوضح نسب التزام الخدام والمخدومين بقداسات وخدمات الـ 12 أسبوعاً الماضية.
            </p>
          </div>

          <button
            onClick={() => alert('جاري تجهيز تقرير نسب الحضور...')}
            disabled={!isSecretary}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
              isSecretary
                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isSecretary ? 'توليد التقرير' : 'مقتصر على أمين الخدمة'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
