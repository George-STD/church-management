import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { Shield, LogIn, KeyRound, Phone, Sparkles } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Church Header Card */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-amber-500 items-center justify-center shadow-xl shadow-brand-500/20 text-3xl text-gold-300 font-bold mb-1">
            ⛪
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            منظومة إدارة الخدمة الكنسية
          </h1>
          <p className="text-xs text-slate-400">
            كنيسة القديس العظيم مارمرقس الرسول • نظام المتابعة الرعوية
          </p>
        </div>

        {/* Login Box */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium text-center animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رقم الهاتف أو البريد الإلكتروني
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="01000000001 أو البريد..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-600/25 transition disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
            </button>
          </form>

          {/* Quick Demo Role Switcher (Instant Evaluation for pair programming) */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="text-[11px] font-semibold text-gold-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تجربة فورية بضغطة زر (حسابات تجريبية للأدوار الخمسة):</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {Object.entries(DEMO_ACCOUNTS).map(([key, acc]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchDemoRole(key)}
                  className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition text-right truncate"
                  title={acc.label}
                >
                  <span className="font-bold text-gold-400 block truncate">{acc.roleName}</span>
                  <span className="text-[10px] text-slate-400 truncate block">{acc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>منظومة آمنة ومحمية وفق أعلى معايير أمان وتشفير البيانات</span>
        </div>
      </div>
    </div>
  );
};
