import React from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { LogOut, UserCheck, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const getRoleArabic = (role: string) => {
    switch (role) {
      case 'GENERAL_SECRETARY': return 'أمين عام';
      case 'SECTOR_SECRETARY': return 'أمين قطاع';
      case 'STAGE_SECRETARY': return 'أمين الخدمة';
      case 'ASSISTANT_SECRETARY': return 'مساعد أمين';
      case 'SERVANT': return 'خادم';
      default: return role;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-gold-400 font-bold text-xl">
          ⛪
        </div>
        <div>
          <h1 className="font-bold text-base md:text-lg tracking-wide text-white flex items-center gap-2">
            منظومة إدارة الخدمة
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              V1.0
            </span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            كنيسة القديس العظيم مارمرقس الرسول
          </p>
        </div>
      </div>

      {/* User Actions & Role Switcher */}
      {user && (
        <div className="flex items-center gap-3">
          {/* Fast Role Switcher (Elite Pairing & Evaluation Feature) */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition"
              title="تبديل الدور لتجربة الصلاحيات"
            >
              <UserCheck className="w-3.5 h-3.5 text-gold-400" />
              <span className="hidden md:inline font-medium">تجربة دور:</span>
              <span className="text-gold-400 font-bold">{getRoleArabic(user.role)}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                  تبديل سريع للأدوار الهرمية (SRS §3)
                </div>
                {Object.entries(DEMO_ACCOUNTS).map(([key, acc]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setDropdownOpen(false);
                      switchDemoRole(key);
                    }}
                    className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                      user.role === key ? 'text-gold-400 font-bold bg-slate-800/50' : 'text-slate-300'
                    }`}
                  >
                    <span>{acc.label}</span>
                    {user.role === key && <span className="w-2 h-2 rounded-full bg-gold-400"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-r border-slate-800 pr-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              {user.fullName ? user.fullName[0] : 'خ'}
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-200">{user.fullName}</div>
              <div className="text-[10px] text-slate-400">{user.stageName || user.sectorName || 'الخدمة العامة'}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
