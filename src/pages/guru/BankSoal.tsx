import React, { useEffect, useState } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter,
  CheckCircle2,
  AlertCircle,
  FileDown,
  FileUp,
  Loader2
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { QuestionBank, Subject } from '@/src/types';
import toast from 'react-hot-toast';
import { cn } from '@/src/lib/utils';
import { useOutletContext } from 'react-router-dom';

export default function BankSoal() {
  const { profile } = useOutletContext<{ profile: any }>();
  const [questions, setQuestions] = useState<QuestionBank[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    subject_id: '',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    option_e: '',
    correct_answer: 'A',
    score_weight: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [qRes, sRes] = await Promise.all([
      supabase.from('question_bank').select('*').order('created_at', { ascending: false }),
      supabase.from('subjects').select('*')
    ]);

    if (qRes.error) toast.error(qRes.error.message);
    else setQuestions(qRes.data || []);

    if (sRes.error) toast.error(sRes.error.message);
    else setSubjects(sRes.data || []);
    
    setLoading(false);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject_id) return toast.error('Pilih mata pelajaran!');

    toast.loading('Menyimpan soal...');
    const { error } = await supabase.from('question_bank').insert([
      { ...formData, teacher_id: profile.id }
    ]);

    toast.dismiss();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Soal berhasil ditambahkan!');
      setIsModalOpen(false);
      setFormData({
        subject_id: '',
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        option_e: '',
        correct_answer: 'A',
        score_weight: 1
      });
      fetchData();
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Hapus soal ini?')) return;
    const { error } = await supabase.from('question_bank').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Soal dihapus');
      fetchData();
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight italic">Bank Soal</h1>
          <p className="text-gray-500 text-sm italic">Kelola daftar pertanyaan untuk ujian.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white text-gray-600 px-4 py-3 rounded-2xl border border-gray-200 font-bold flex items-center gap-2 hover:bg-gray-50 text-sm">
            <FileUp size={20} />
            Import
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-red-100 transition-all active:scale-95 text-sm"
          >
            <Plus size={20} />
            Tambah Soal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
             <h3 className="font-black text-gray-900 italic flex items-center gap-2 uppercase tracking-tighter text-sm">
               <Filter size={18} className="text-primary" /> Filter Mata Pelajaran
             </h3>
             <div className="space-y-2">
                {subjects.map(s => (
                  <label key={s.id} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl cursor-pointer hover:bg-red-50 transition-colors group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-xs font-bold text-gray-600 group-hover:text-primary">{s.name}</span>
                  </label>
                ))}
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari pertanyaan..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium" 
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="bg-white p-20 rounded-[32px] border border-gray-100 text-center italic text-gray-400">
                Belum ada soal tersedia. Klik "Tambah Soal" untuk memulai.
              </div>
            ) : filteredQuestions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:border-primary/20 transition-all group relative">
                 <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                     <span className="w-8 h-8 bg-red-50 text-primary font-black rounded-lg flex items-center justify-center text-xs">
                       {idx + 1}
                     </span>
                     <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded tracking-tighter">
                       {subjects.find(s => s.id === q.subject_id)?.name || 'Umum'}
                     </span>
                     <span className="text-[10px] font-black uppercase bg-gray-50 text-gray-400 px-2 py-0.5 rounded tracking-tighter">
                       Bobot: {q.score_weight}
                     </span>
                   </div>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteQuestion(q.id)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                   </div>
                 </div>
                 <p className="text-gray-900 font-bold mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: q.question }} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {['A', 'B', 'C', 'D', 'E'].map(opt => (
                     <div key={opt} className={cn(
                       "p-3 rounded-xl border text-xs font-medium flex items-center gap-3",
                       q.correct_answer === opt 
                        ? "bg-green-50 border-green-200 text-green-700" 
                        : "bg-gray-50/50 border-gray-100 text-gray-500"
                     )}>
                       <span className={cn(
                         "w-6 h-6 rounded-md flex items-center justify-center font-black",
                         q.correct_answer === opt ? "bg-green-200" : "bg-gray-200"
                       )}>{opt}</span>
                       <span>{(q as any)[`option_${opt.toLowerCase()}`]}</span>
                       {q.correct_answer === opt && <CheckCircle2 size={14} className="ml-auto" />}
                     </div>
                   ))}
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Tambah Soal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-2xl rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-black text-gray-900 mb-6 italic">Tambah Soal Baru</h2>
              <form onSubmit={handleAddQuestion} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 tracking-widest">Mata Pelajaran</label>
                      <select 
                        required
                        value={formData.subject_id}
                        onChange={e => setFormData({...formData, subject_id: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium"
                      >
                        <option value="">Pilih Mapel</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 tracking-widest">Bobot Nilai</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={formData.score_weight}
                        onChange={e => setFormData({...formData, score_weight: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                 </div>
                 
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1 tracking-widest">Pertanyaan</label>
                   <textarea 
                      required
                      placeholder="Tulis pertanyaan di sini..."
                      value={formData.question}
                      onChange={e => setFormData({...formData, question: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium min-h-[120px]"
                   />
                 </div>

                 <div className="space-y-4">
                    {['A', 'B', 'C', 'D', 'E'].map(opt => (
                      <div key={opt} className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 tracking-widest">Pilihan {opt}</label>
                        <input 
                          type="text" 
                          required
                          value={(formData as any)[`option_${opt.toLowerCase()}`]}
                          onChange={e => setFormData({...formData, [`option_${opt.toLowerCase()}`]: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium"
                        />
                      </div>
                    ))}
                 </div>

                 <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1 tracking-widest">Jawaban Benar</label>
                   <div className="flex gap-4">
                      {['A', 'B', 'C', 'D', 'E'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({...formData, correct_answer: opt as any})}
                          className={cn(
                            "flex-1 py-3 rounded-xl font-black transition-all border-2",
                            formData.correct_answer === opt 
                              ? "bg-primary border-primary text-white shadow-md shadow-red-100 scale-105" 
                              : "bg-gray-50 border-transparent text-gray-400"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                   </div>
                 </div>

                 <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-gray-50 py-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover shadow-lg shadow-red-100 transition-all active:scale-95"
                    >
                      Simpan Soal
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
