import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Login berhasil!');
      navigate('/app');
    } catch (error: any) {
      toast.error(error.message || 'Login gagal, periksa email/password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 p-2 text-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="p-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-lg shadow-red-100">P</div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight italic">Masuk ke Platform</h1>
            <p className="text-gray-500 mt-2 text-sm italic">Silakan masukkan akun SMK Prima Unggul Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary-hover hover:shadow-lg hover:shadow-red-100 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'Login Sekarang'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400 italic">
            Akun pertama otomatis menjadi Admin. Guru & Siswa akan didaftarkan oleh Admin.
          </p>
        </div>
      </div>
    </div>
  );
}
