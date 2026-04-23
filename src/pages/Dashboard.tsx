import { useOutletContext } from 'react-router-dom';
import { 
  Users, 
  UserSquare2, 
  FileEdit, 
  Database, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Profile } from '@/src/types';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { profile } = useOutletContext<{ profile: Profile | null }>();

  if (!profile) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Profil Tidak Ditemukan</h2>
        <p className="text-slate-500 mt-2">Gagal memuat data profil Anda. Silakan coba login kembali.</p>
      </div>
    );
  }

  const stats = {
    admin: [
      { label: 'Total Siswa', value: '450', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Guru', value: '32', icon: UserSquare2, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Total Ujian', value: '18', icon: FileEdit, color: 'text-red-600', bg: 'bg-red-50' },
      { label: 'Total Soal', value: '1,240', icon: Database, color: 'text-orange-600', bg: 'bg-orange-50' },
    ],
    guru: [
      { label: 'Ujian Dibuat', value: '6', icon: FileEdit, color: 'text-red-600', bg: 'bg-red-50' },
      { label: 'Total Soal', value: '120', icon: Database, color: 'text-orange-600', bg: 'bg-orange-50' },
      { label: 'Siswa Mengikuti', value: '145', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Ujian Berjalan', value: '2', icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
    ],
    siswa: [
      { label: 'Ujian Tersedia', value: '3', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
      { label: 'Ujian Selesai', value: '12', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Nilai Terakhir', value: '88.5', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    ],
  };

  const currentStats = stats[profile.role as keyof typeof stats] || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">Halo, {profile.name}! 👋</h1>
        <p className="text-slate-500 mt-1 italic text-sm">Selamat datang di dashboard platform ujian SMK Prima Unggul.</p>
      </div>

      <div className="grid grid-cols-12 grid-rows-6 gap-6 min-h-[800px]">
        {/* Main Hero Card (Large Bento) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-12 lg:col-span-8 row-span-3 bento-card bg-slate-900 border-none relative overflow-hidden flex flex-col justify-between text-white"
        >
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <span className="status-pill bg-primary/20 text-primary border border-primary/30 mb-4 inline-block">Sistem Aktif</span>
            <h3 className="text-4xl font-black mb-4 leading-tight italic">Platform Ujian Berbasis<br/>Kreativitas & Kompetensi</h3>
            <p className="text-slate-400 max-w-md text-sm leading-relaxed">
              Pantau jadwal ujian, hasil belajar, dan perkembangan akademik kamu dengan antarmuka modern yang terintegrasi.
            </p>
          </div>
          
          <div className="flex items-center justify-between relative z-10 mt-8">
            <div className="flex gap-8">
               <div>
                 <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Status Server</p>
                 <p className="font-bold flex items-center gap-2 text-green-400"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online</p>
               </div>
               <div>
                 <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Update Terakhir</p>
                 <p className="font-bold">Baru saja</p>
               </div>
            </div>
            <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-2xl font-black transition-all shadow-lg shadow-red-500/30 active:scale-95 text-sm uppercase tracking-widest">
              Jelajahi Fitur
            </button>
          </div>
        </motion.div>

        {/* Stats Grid 1 */}
        {currentStats.slice(0, 2).map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (idx * 0.1) }}
            className="col-span-12 md:col-span-6 lg:col-span-4 row-span-2 bento-card flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Statistik Real-time</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-5xl font-black text-slate-800 tracking-tighter tabular-nums">{stat.value}</h4>
            </div>
          </motion.div>
        ))}

        {/* Info Column (Right Side) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-12 lg:col-span-4 row-span-4 bento-card flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-black text-slate-800 uppercase tracking-tighter italic">Pengumuman</h4>
            <AlertCircle size={18} className="text-primary" />
          </div>
          
          <div className="space-y-4 flex-1">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Persiapan Ujian Akhir</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">2 Jam Yang Lalu</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-4 border-2 border-slate-50 rounded-2xl text-xs font-black text-slate-400 hover:text-primary hover:border-primary/20 transition-all uppercase tracking-widest mt-6">
            Buka Semua Berita
          </button>
        </motion.div>

        {/* Large Data Card (Bottom Left) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-12 lg:col-span-8 row-span-3 bento-card"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-black text-slate-800 uppercase tracking-tighter text-lg italic">Aktivitas Terkini</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pantauan Aktivitas User Di Platform</p>
            </div>
            <button className="text-primary text-[10px] font-black uppercase tracking-widest bg-red-50 px-4 py-2 rounded-xl">View Analysis</button>
          </div>
          
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl group hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-slate-200">
                    <Database size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm italic">Otomatisasi Penilaian Selesai</p>
                    <p className="text-[10px] text-slate-400 font-medium">Ujian: Administrasi Sistem Jaringan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">100%</p>
                  <span className="status-pill bg-green-100 text-green-600">Success</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Utility local for Dashboard since I didn't export cn to global window
import { cn } from '@/src/lib/utils';
