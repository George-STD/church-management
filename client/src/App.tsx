import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { MembersView } from './components/views/MembersView';
import { FollowUpView } from './components/views/FollowUpView';
import { PrepView } from './components/views/PrepView';
import { SpiritualView } from './components/views/SpiritualView';
import { ServantsView } from './components/views/ServantsView';
import { YearPlanView } from './components/views/YearPlanView';
import { AnnouncementsView } from './components/views/AnnouncementsView';
import { ReportsView } from './components/views/ReportsView';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-2xl text-gold-400 animate-bounce mb-3">
          ⛪
        </div>
        <div className="text-slate-400 text-sm font-medium animate-pulse">
          جاري تجهيز منظومة الخدمة...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'members':
        return <MembersView />;
      case 'follow-up':
        return <FollowUpView />;
      case 'prep':
        return <PrepView />;
      case 'spiritual':
        return <SpiritualView />;
      case 'servants':
        return <ServantsView />;
      case 'year-plan':
        return <YearPlanView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-arabic selection:bg-brand-500 selection:text-white pb-16 md:pb-0">
      <Navbar />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-full">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};
