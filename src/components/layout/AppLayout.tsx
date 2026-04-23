import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { supabase } from '@/src/lib/supabase';
import { Profile } from '@/src/types';
import { cn } from '@/src/lib/utils';

export default function AppLayout() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      setProfile(data || null);
      setLoading(false);
    }
    checkUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary/20"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-transparent border-t-primary absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-[10px] animate-pulse">Memuat Sesi Digital...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Background Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        role={profile?.role || null} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-w-0",
        "lg:ml-64" // On large screens, sidebar is always w-64
      )}>
        <Header user={profile} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="p-4 lg:p-8">
          <Outlet context={{ profile }} />
        </main>
      </div>
    </div>
  );
}
