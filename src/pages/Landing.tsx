import { useNavigate } from 'react-router-dom';
import { 
  Monitor, 
  Palette, 
  Calculator, 
  Video, 
  Briefcase, 
  TrendingUp,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Landing() {
  const navigate = useNavigate();

  const jurusan = [
    { name: 'TKJ', desc: 'Teknik Komputer & Jaringan', icon: Monitor },
    { name: 'DKV', desc: 'Desain Komunikasi Visual', icon: Palette },
    { name: 'AK', desc: 'Akuntansi', icon: Calculator },
    { name: 'BC', desc: 'Broadcasting', icon: Video },
    { name: 'MPLB', desc: 'Manajemen Perkantoran & Layanan Bisnis', icon: Briefcase },
    { name: 'BD', desc: 'Bisnis Digital', icon: TrendingUp },
  ];

  const features = [
    { title: 'Ujian Online', desc: 'Sistem ujian yang stabil dan mudah digunakan.', icon: Zap },
    { title: 'Hasil Real-time', desc: 'Nilai langsung keluar setelah ujian selesai.', icon: Clock },
    { title: 'Manajemen Lengkap', desc: 'Kelola siswa, guru, dan soal dalam satu platform.', icon: ShieldCheck },
    { title: 'Dashboard Modern', desc: 'Tampilan bersih dan responsif untuk semua perangkat.', icon: Monitor },
  ];

  return (
    <div className="bg-white">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">SMK Prima Unggul</span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-hover transition-all active:scale-95"
        >
          Masuk
        </button>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 pb-24 flex flex-col lg:flex-row items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-1/2"
        >
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
            Platform Ujian Online <span className="text-primary italic">Modern</span> SMK Prima Unggul
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-lg">
            Wujudkan kemudahan evaluasi pembelajaran dengan sistem ujian berbasis online yang aman, cepat, dan transparan.
          </p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 hover:shadow-lg hover:shadow-red-200 transition-all active:scale-95"
            >
              Mulai Ujian Sekarang <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:w-1/2 relative"
        >
          <div className="w-full h-[400px] bg-red-50 rounded-[40px] border-2 border-primary/10 relative overflow-hidden flex items-center justify-center">
             <div className="grid grid-cols-3 gap-4 p-8">
               {[1,2,3,4,5,6,7,8,9].map(i => (
                 <div key={i} className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-primary/20">
                   <Monitor size={32} />
                 </div>
               ))}
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-red-50 via-transparent to-transparent"></div>
          </div>
          {/* Floating badges */}
          <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
             <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
               <ShieldCheck size={24} />
             </div>
             <div>
               <p className="text-xs text-gray-500 font-medium">Sistem Aman</p>
               <p className="text-sm font-bold text-gray-900">Anti-Cheat</p>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Jurusan Section */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Jurusan Unggulan Kami</h2>
          <p className="text-gray-600 mb-16 max-w-2xl mx-auto italic">Mempersiapkan lulusan yang kompeten dan siap kerja di berbagai bidang industri.</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            {jurusan.map((j) => (
              <div key={j.name} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <j.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{j.name}</h3>
                <p className="text-gray-500 text-sm">{j.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 italic">Mengapa Memilih Platform Kami?</h2>
              <div className="space-y-8">
                {features.map((f) => (
                  <div key={f.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-primary">
                      <f.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{f.title}</h4>
                      <p className="text-gray-600 text-sm">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
               <div className="aspect-square bg-gray-900 rounded-3xl p-8 flex flex-col justify-end">
                 <p className="text-4xl font-bold text-white mb-2">100%</p>
                 <p className="text-gray-400 text-sm italic">Digital Assessment</p>
               </div>
               <div className="aspect-square bg-primary rounded-3xl p-8 flex flex-col justify-end transform translate-y-8">
                 <p className="text-4xl font-bold text-white mb-2">Secure</p>
                 <p className="text-red-100 text-sm italic">Lockdown Browser</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <span className="font-bold text-gray-900 tracking-tight">SMK Prima Unggul</span>
          </div>
          <p className="text-gray-500 text-sm text-center italic">© 2024 SMK Prima Unggul. All rights reserved.</p>
          <div className="flex gap-6 text-gray-400">
             <span className="hover:text-primary cursor-pointer transition-colors">Facebook</span>
             <span className="hover:text-primary cursor-pointer transition-colors">Instagram</span>
             <span className="hover:text-primary cursor-pointer transition-colors">YouTube</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
