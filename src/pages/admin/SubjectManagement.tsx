import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  BookOpen, 
  Edit2, 
  Trash2, 
  Loader2,
  GraduationCap,
  User
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { Subject, Profile } from '@/src/types';
import toast from 'react-hot-toast';
import { cn } from '@/src/lib/utils';

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Subjects
    const { data: subData, error: subError } = await supabase
      .from('subjects')
      .select('*')
      .order('name');
    
    if (subError) toast.error(subError.message);
    else setSubjects(subData || []);
    
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('subjects').insert([formData]);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Mata pelajaran berhasil ditambahkan');
      setIsModalOpen(false);
      setFormData({ name: '' });
      fetchData();
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Hapus mata pelajaran ini?')) return;
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Mata pelajaran berhasil dihapus');
      fetchData();
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight italic">Mata Pelajaran</h1>
          <p className="text-gray-500 text-sm italic">Kelola daftar kurikulum dan penugasan guru pengampu.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-red-100 transition-all active:scale-95 text-sm"
        >
          <Plus size={20} />
          Tambah Mapel
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari mata pelajaran..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest italic">Mata Pelajaran</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest italic text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={2} className="py-20 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></td></tr>
              ) : filteredSubjects.length === 0 ? (
                <tr><td colSpan={2} className="py-20 text-center text-gray-400 italic">Belum ada mata pelajaran.</td></tr>
              ) : filteredSubjects.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-primary">
                          <BookOpen size={20} />
                       </div>
                       <span className="font-bold text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-bold">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={18} /></button>
                       <button onClick={() => deleteSubject(s.id)} className="p-2 text-gray-400 hover:text-primary"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl">
              <h2 className="text-2xl font-black text-gray-900 mb-6 italic">Tambah Mata Pelajaran</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Mata Pelajaran</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:outline-none" placeholder="Contoh: Administrasi Sistem Jaringan" />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold">Batal</button>
                    <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-red-100">Simpan Mapel</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
