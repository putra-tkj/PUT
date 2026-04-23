import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  BookOpen, 
  Database, 
  FileEdit, 
  ClipboardList, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';
import { Profile } from '@/src/types';

interface SidebarProps {
  role: string | null;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function Sidebar({ role, isOpen, onClose, className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto close on mobile when location changes
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  const menuItems = {
    admin: [
      { id: 'dash', label: 'Dashboard', icon: LayoutDashboard, path: '/app' },
      { id: 'users', label: 'Manajemen User', icon: Users, path: '/app/users' },
      { id: 'students', label: 'Data Siswa', icon: UserRound, path: '/app/students' },
      { id: 'subjects', label: 'Mata Pelajaran', icon: BookOpen, path: '/app/subjects' },
      { id: 'bank', label: 'Bank Soal', icon: Database, path: '/app/bank' },
      { id: 'exams', label: 'Ujian', icon: FileEdit, path: '/app/exams' },
      { id: 'results', label: 'Hasil Ujian', icon: ClipboardList, path: '/app/results' },
      { id: 'settings', label: 'Pengaturan', icon: Settings, path: '/app/settings' },
    ],
    guru: [
      { id: 'dash', label: 'Dashboard', icon: LayoutDashboard, path: '/app' },
      { id: 'bank', label: 'Bank Soal', icon: Database, path: '/app/bank' },
      { id: 'exams', label: 'Ujian', icon: FileEdit, path: '/app/exams' },
      { id: 'results', label: 'Hasil Ujian', icon: ClipboardList, path: '/app/results' },
    ],
    siswa: [
      { id: 'dash', label: 'Dashboard', icon: LayoutDashboard, path: '/app' },
      { id: 'my-exams', label: 'Ujian Saya', icon: FileEdit, path: '/app/my-exams' },
      { id: 'my-results', label: 'Hasil Saya', icon: ClipboardList, path: '/app/my-results' },
    ],
  };

  const currentMenu = role ? menuItems[role as keyof typeof menuItems] : [];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-500 z-50 flex flex-col",
        // Desktop widths
        isCollapsed ? "lg:w-20" : "lg:w-64",
        // Mobile visibility
        isOpen ? "translate-x-0 w-64 shadow-2xl shadow-slate-900/50" : "-translate-x-full lg:translate-x-0 w-64",
        className
      )}
    >
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
             <span className="text-white font-bold text-xl">S</span>
           </div>
           <div className={cn("leading-tight transition-opacity duration-300", isCollapsed && "lg:opacity-0 lg:w-0 overflow-hidden")}>
             <p className="font-bold text-slate-800 tracking-tight">Prima Unggul</p>
             <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Sistem Ujian</p>
           </div>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1 hover:bg-slate-100 rounded-md text-slate-400"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        {/* Mobile close button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-400"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {currentMenu.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/app'}
            className={({ isActive }) => cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all font-medium",
              isActive 
                ? "sidebar-active" 
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <item.icon size={20} className="shrink-0" />
            <span className={cn(
              "transition-opacity duration-300",
              isCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100"
            )}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-100">
        <div className={cn(
          "bg-slate-50 p-4 rounded-xl mb-4 transition-all duration-300",
          isCollapsed ? "lg:opacity-0 lg:h-0 lg:p-0 overflow-hidden" : "opacity-100"
        )}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role Anda</p>
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">{role}</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 p-3 w-full rounded-xl text-slate-600 hover:bg-red-50 hover:text-primary transition-all font-medium",
            isCollapsed && "lg:justify-center"
          )}
        >
          <LogOut size={20} className="shrink-0" />
          <span className={cn(
            "transition-opacity duration-300",
            isCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100"
          )}>
            Keluar
          </span>
        </button>
      </div>
    </aside>
  );
}
