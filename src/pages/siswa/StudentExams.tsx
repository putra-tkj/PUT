import { useEffect, useState } from 'react';
import { 
  FileEdit, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  PlayCircle,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { Exam, ExamAttempt, Subject, Profile } from '@/src/types';
import toast from 'react-hot-toast';
import { cn, formatDate } from '@/src/lib/utils';
import { useOutletContext, useNavigate } from 'react-router-dom';

export default function StudentExams() {
  const { profile } = useOutletContext<{ profile: Profile | null }>();
  const [exams, setExams] = useState<(Exam & { subject?: Subject; attempt?: ExamAttempt })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      fetchExams();
    }
  }, [profile]);

  const fetchExams = async () => {
    if (!profile) return;
    setLoading(true);
    // Fetch exams for student class
    const { data: examsData, error: eError } = await supabase
      .from('exams')
      .select('*, subjects(*)')
      .eq('class', profile.class)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (eError) {
      toast.error(eError.message);
      setLoading(false);
      return;
    }

    // Fetch attempts for this student
    const { data: attemptsData, error: aError } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('student_id', profile.id);

    if (aError) toast.error(aError.message);

    const merged = (examsData || []).map(exam => ({
      ...exam,
      subject: (exam as any).subjects,
      attempt: (attemptsData || []).find(a => a.exam_id === exam.id)
    }));

    setExams(merged);
    setLoading(false);
  };

  const startExam = async (exam: Exam) => {
    if (!confirm('Mulai pengerjaan ujian sekarang? Waktu akan terus berjalan.')) return;

    // Create attempt if not exists
    let { data: attempt } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('exam_id', exam.id)
      .eq('student_id', profile.id)
      .single();

    if (!attempt) {
      const { data: newAttempt, error } = await supabase
        .from('exam_attempts')
        .insert([{ exam_id: exam.id, student_id: profile.id, status: 'ongoing' }])
        .select()
        .single();
      
      if (error) {
        toast.error('Gagal memulai ujian: ' + error.message);
        return;
      }
      attempt = newAttempt;
    }

    if (attempt?.status === 'completed') {
      toast.error('Anda sudah menyelesaikan ujian ini.');
      return;
    }

    navigate(`/app/exam/${exam.id}`);
  };

  if (!profile) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Profil Tidak Ditemukan</h2>
        <p className="text-slate-500 mt-2">Gagal memuat data profil Anda. Silakan coba login kembali.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight italic">Ujian Saya</h1>
        <p className="text-gray-500 text-sm italic">Daftar ujian yang tersedia untuk kelas {profile.class}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : exams.length === 0 ? (
          <div className="col-span-full bg-white p-20 rounded-[32px] border border-gray-100 text-center italic text-gray-400">
            Tidak ada ujian tersedia untuk kelas Anda saat ini.
          </div>
        ) : exams.map((item) => {
          return (
            <div key={item.id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col h-full">
               <div className={cn(
                  "absolute top-0 right-0 px-5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl",
                  item.attempt?.status === 'completed' ? "bg-green-100 text-green-600" : "bg-red-100 text-primary animate-pulse"
               )}>
                 {item.attempt?.status === 'completed' ? 'Selesai' : 'Tersedia'}
               </div>

               <div className="mb-6 flex-1">
                 <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-primary mb-4">
                   <FileEdit size={24} />
                 </div>
                 <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 line-clamp-2 italic">{item.title}</h3>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                   {item.subject?.name || 'Mata Pelajaran'}
                 </p>
               </div>

               <div className="space-y-3 mb-6">
                 <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-400 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> Durasi</span>
                    <span className="text-gray-700">{item.duration} Menit</span>
                 </div>
               </div>

               {item.attempt?.status === 'completed' ? (
                 <div className="bg-green-50 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Skor Akhir</p>
                      <p className="text-xl font-black text-green-700">{item.attempt.score}</p>
                    </div>
                    <CheckCircle2 size={24} className="text-green-500" />
                 </div>
               ) : (
                 <button 
                  onClick={() => startExam(item)}
                  className="w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 bg-primary text-white hover:bg-primary-hover shadow-lg shadow-red-100"
                 >
                   <PlayCircle size={18} />
                   Mulai Ujian
                 </button>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
