import React, { useEffect, useState } from 'react';
import { 
  FileEdit, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Loader2,
  BookOpen
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { Exam, Subject } from '@/src/types';
import toast from 'react-hot-toast';
import { cn, formatDate } from '@/src/lib/utils';
import { useOutletContext } from 'react-router-dom';

export default function ExamManagement() {
  const { profile } = useOutletContext<{ profile: any }>();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subject_id: '',
    class: '',
    description: '',
    duration: 60,
    status: 'draft' as const
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [eRes, sRes] = await Promise.all([
      supabase.from('exams').select('*').order('created_at', { ascending: false }),
      supabase.from('subjects').select('*')
    ]);

    if (eRes.error) toast.error(eRes.error.message);
    else setExams(eRes.data || []);

    if (sRes.error) toast.error(sRes.error.message);
    else setSubjects(sRes.data || []);
    
    setLoading(false);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return toast.error('Sesi tidak valid, silakan login ulang.');
    if (!formData.subject_id) return toast.error('Tentukan mata pelajaran terlebih dahulu.');

    const loadingId = toast.loading('Menyiapkan ujian...');
    
    try {
      const { error } = await supabase.from('exams').insert([
        { ...formData, created_by: profile.id }
      ]);

      toast.dismiss(loadingId);
      
      if (error) {
        console.error('Exam creation error:', error);
        toast.error(`Gagal: ${error.message}`);
      } else {
        toast.success('Ujian berhasil dibuat!');
        setIsModalOpen(false);
        setFormData({
          title: '',
          subject_id: '',
          class: '',
          description: '',
          duration: 60,
          status: 'draft' as const
        });
        fetchData();
      }
    } catch (err: any) {
      toast.dismiss(loadingId);
      toast.error('Terjadi kesalahan sistem.');
      console.error(err);
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'draft' ? 'published' : 'draft';
    const { error } = await supabase.from('exams').update({ status: newStatus }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Ujian telah di-${newStatus}`);
      fetchData();
    }
  };

  const deleteExam = async (id: string) => {
    if (!confirm('Hapus ujian ini?')) return;
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Ujian dihapus');
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight italic">Manajemen Ujian</h1>
          <p className="text-gray-500 text-sm italic">Atur jadwal dan detail ujian untuk siswa.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-red-100 transition-all active:scale-95 text-sm"
        >
          <Plus size={20} />
          Buat Ujian Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
             <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : exams.length === 0 ? (
          <div className="col-span-full bg-white p-20 rounded-[32px] border border-gray-100 text-center italic text-gray-400">
            Belum ada ujian. Klik "Buat Ujian Baru" untuk memulai.
          </div>
        ) : exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
             <div className={cn(
                "absolute top-0 right-0 px-6 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl",
                exam.status === 'published' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
             )}>
               {exam.status}
             </div>

             <div className="mb-6">
               <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-primary mb-4">
                 <FileEdit size={24} />
               </div>
               <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 line-clamp-1 italic">{exam.title}</h3>
               <p className="text-xs text-gray-400 flex items-center gap-1">
                 <BookOpen size={14} /> {subjects.find(s => s.id === exam.subject_id)?.name || 'Mata Pelajaran'}
               </p>
             </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                     <Clock size={12} /> Durasi
                   </p>
                   <p className="text-sm font-bold text-gray-700">{exam.duration} Menit</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                     <Users size={12} /> Kelas
                   </p>
                   <p className="text-sm font-bold text-gray-700">{exam.class}</p>
                </div>
             </div>

             <div className="flex gap-2 pt-4 border-t border-gray-50">
                <button 
                  onClick={() => toggleStatus(exam.id, exam.status)}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tighter flex items-center justify-center gap-2 transition-all",
                    exam.status === 'draft' ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  )}
                >
                  {exam.status === 'draft' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  {exam.status === 'draft' ? 'Publish' : 'Unpublish'}
                </button>
                <div className="flex gap-2">
                   <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                     <Eye size={18} />
                   </button>
                   <button 
                    onClick={() => deleteExam(exam.id)}
                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-primary transition-colors">
                     <Trash2 size={18} />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Modal Buat Ujian */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-xl rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <h2 className="text-2xl font-black text-gray-900 mb-6 italic">Buat Ujian Baru</h2>
              <form onSubmit={handleCreateExam} className="space-y-5 text-sm">
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Judul Ujian</label>
                   <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mata Pelajaran</label>
                      <select required value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium">
                        <option value="">Pilih Mapel</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kelas Penerima</label>
                      <input type="text" required placeholder="Contoh: X TKJ 1" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Durasi (Menit)</label>
                       <input type="number" required value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status Awal</label>
                       <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium">
                          <option value="draft">Draft</option>
                          <option value="published">Langsung Terbit</option>
                       </select>
                    </div>
                 </div>
                  <div className="flex gap-4 mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200">Batal</button>
                    <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover shadow-lg shadow-red-100 transition-all active:scale-95">Buat Ujian</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
