import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  CalendarCheck,
  BookOpen,
  Heart,
  CalendarDays,
  Bell,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'لوحة القيادة', icon: LayoutDashboard },
    { id: 'members', label: 'سجل المخدومين', icon: Users },
    { id: 'follow-up', label: 'جدول المتابعة والغياب', icon: CalendarCheck },
    { id: 'prep', label: 'تحضير الدروس', icon: BookOpen },
    { id: 'spiritual', label: 'الخزنة الروحية (خاص)', icon: Heart },
    { id: 'servants', label: 'سجل الخدام والتقييم', icon: UserSquare2 },
    { id: 'year-plan', label: 'تدبير السنة والفعاليات', icon: CalendarDays },
    { id: 'announcements', label: 'الإعلانات والتعميمات', icon: Bell },
    { id: 'reports', label: 'التقارير وسجلات Excel', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/60 border-l border-slate-800 p-3 h-[calc(100vh-61px)] sticky top-[61px]">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Security Info Card */}
        <div className="mt-auto p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-400 space-y-1">
          <div className="text-slate-300 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            نظام حماية وسرية البيانات
          </div>
          <p className="text-[10px] leading-relaxed">
            البيانات الروحية وتقييمات المخدومين مشفرة وخاضعة لضوابط الصلاحيات الهرمية الصارمة (SRS NFR-3.1).
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Mobile-First NFR-1.1) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 py-2 px-3 flex justify-around items-center">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition ${
                isActive ? 'text-brand-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
