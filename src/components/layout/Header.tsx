import { Bell, User, Search, Menu } from 'lucide-react';
import { Profile } from '@/src/types';

interface HeaderProps {
  user: Profile | null;
  onMenuClick?: () => void;
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-sm lg:text-lg font-bold text-slate-800">
          Selamat Datang, <span className="text-primary italic">{user?.name || 'User'}</span>
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-64 hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Cari ujian..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
          />
        </div>

        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 italic">{user?.role || 'Guest'}</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border-2 border-primary overflow-hidden">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
