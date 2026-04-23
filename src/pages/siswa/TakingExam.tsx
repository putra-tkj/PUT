import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { Exam, QuestionBank, ExamAttempt, StudentAnswer } from '@/src/types';
import toast from 'react-hot-toast';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function TakingExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<QuestionBank[]>([]);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  // Fetch Exam Data
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      // Get Exam
      const { data: examData } = await supabase.from('exams').select('*').eq('id', id).single();
      if (!examData) return navigate('/app/my-exams');
      setExam(examData);

      // Get Questions for this subject (Simplified relation)
      const { data: questionsData } = await supabase
        .from('question_bank')
        .select('*')
        .eq('subject_id', examData.subject_id);
      
      setQuestions(questionsData || []);

      // Get or Create Attempt
      const { data: attemptData } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', id)
        .eq('student_id', user.id)
        .single();
      
      setAttempt(attemptData);

      // Calculate time left from duration
      const startedAt = new Date(attemptData.started_at);
      const now = new Date();
      const elapsedMinutes = (now.getTime() - startedAt.getTime()) / 60000;
      const totalSeconds = (examData.duration - Math.floor(elapsedMinutes)) * 60;
      setTimeLeft(totalSeconds > 0 ? totalSeconds : 0);

      // Fetch saved answers
      const { data: savedAnswers } = await supabase
        .from('student_answers')
        .select('*')
        .eq('attempt_id', attemptData.id);
      
      const answersMap: Record<string, string> = {};
      savedAnswers?.forEach(a => {
        answersMap[a.question_id] = a.selected_answer || '';
      });
      setAnswers(answersMap);

      setLoading(false);
    }
    fetchData();
  }, [id, navigate]);

  // Timer Effect
  useEffect(() => {
    if (timeLeft <= 0 && !loading) {
      finishExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  const saveAnswer = async (questionId: string, answer: string) => {
    if (!attempt || attempt.status === 'completed') return;

    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setSaving(true);
    
    // Check if correct
    const question = questions.find(q => q.id === questionId);
    const isCorrect = question?.correct_answer === answer;

    const { error } = await supabase.from('student_answers').upsert([
      {
        attempt_id: attempt.id,
        question_id: questionId,
        selected_answer: answer,
        is_correct: isCorrect
      }
    ], { onConflict: 'attempt_id,question_id' });

    if (error) toast.error('Gagal menyimpan jawaban: ' + error.message);
    setSaving(false);
  };

  const finishExam = async () => {
    if (!attempt || attempt.status === 'completed') return;
    if (timeLeft > 0 && !confirm('Yakin ingin menyelesaikan ujian? Anda tidak dapat merubah jawaban lagi.')) return;

    setLoading(true);
    
    // Calculate final score
    const { data: finalAnswers } = await supabase
      .from('student_answers')
      .select('*')
      .eq('attempt_id', attempt.id);
    
    const correctCount = finalAnswers?.filter(a => a.is_correct).length || 0;
    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const { error } = await supabase
      .from('exam_attempts')
      .update({
        finished_at: new Date().toISOString(),
        score: score,
        status: 'completed'
      })
      .eq('id', attempt.id);

    if (error) {
      toast.error('Gagal mengirim ujian: ' + error.message);
      setLoading(false);
    } else {
      toast.success('Ujian selesai! Skor Anda: ' + score.toFixed(1));
      navigate('/app/my-exams');
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  if (loading || !exam) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
          <p className="text-gray-500 font-bold italic tracking-tight">Menyiapkan lembar ujian...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Exam Header */}
      <nav className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-50">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">P</div>
            <div>
               <h2 className="font-black text-gray-900 leading-none italic">{exam.title}</h2>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Soal Ke {currentIndex + 1} Dari {questions.length}</p>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className={cn(
              "flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 font-bold",
              timeLeft < 300 ? "bg-red-50 border-red-100 text-primary animate-pulse" : "bg-gray-50 border-gray-100 text-gray-600"
            )}>
              <Clock size={20} />
              <span className="text-lg font-black tracking-tighter tabular-nums">{formatTime(timeLeft)}</span>
            </div>
            
            <button 
              onClick={finishExam}
              className="bg-primary text-white px-8 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-red-100 active:scale-95 transition-all"
            >
              Selesai
            </button>
         </div>
      </nav>

      <div className="flex-1 container mx-auto px-6 py-12 flex gap-8">
        {/* Main Section */}
        <div className="flex-1 space-y-8">
           <AnimatePresence mode="wait">
              <motion.div 
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-sm min-h-[400px]"
              >
                <div className="mb-10">
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Pertanyaan</p>
                   <h1 className="text-2xl font-bold text-gray-900 leading-relaxed italic" dangerouslySetInnerHTML={{ __html: currentQuestion?.question }} />
                </div>

                <div className="grid grid-cols-1 gap-4">
                   {['A', 'B', 'C', 'D', 'E'].map(opt => (
                     <button
                        key={opt}
                        onClick={() => saveAnswer(currentQuestion.id, opt)}
                        className={cn(
                          "group p-6 rounded-3xl border-2 text-left flex items-center gap-6 transition-all",
                          answers[currentQuestion.id] === opt 
                            ? "border-primary bg-red-50/30 text-primary ring-4 ring-primary/5" 
                            : "border-gray-50 bg-gray-50/30 text-gray-600 hover:border-gray-200"
                        )}
                     >
                       <span className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors shrink-0",
                         answers[currentQuestion.id] === opt ? "bg-primary text-white" : "bg-white text-gray-400 group-hover:text-primary"
                       )}>{opt}</span>
                       <span className="font-bold text-lg">{(currentQuestion as any)[`option_${opt.toLowerCase()}`]}</span>
                       {answers[currentQuestion.id] === opt && <CheckCircle2 size={24} className="ml-auto" />}
                     </button>
                   ))}
                </div>
              </motion.div>
           </AnimatePresence>

           <div className="flex items-center justify-between">
              <button 
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-100 rounded-3xl font-black text-gray-400 hover:text-primary hover:border-primary disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-100 transition-all uppercase text-xs tracking-widest"
              >
                <ChevronLeft size={20} /> Sebelumnya
              </button>
              
              <div className="flex items-center gap-2">
                 {saving && <p className="text-[10px] font-black italic text-primary animate-pulse flex items-center gap-1 uppercase tracking-widest"><Save size={12}/> Auto Saving...</p>}
              </div>

              <button 
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-100 rounded-3xl font-black text-gray-400 hover:text-primary hover:border-primary disabled:opacity-30 transition-all uppercase text-xs tracking-widest"
              >
                Selanjutnya <ChevronRight size={20} />
              </button>
           </div>
        </div>

        {/* Sidebar Navigasi Soal */}
        <div className="w-80 space-y-6 hidden lg:block">
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm sticky top-32">
              <h3 className="font-black text-gray-900 italic mb-6 flex items-center gap-2 uppercase tracking-tighter text-sm">
                <AlertCircle size={18} className="text-primary" /> Nomor Soal
              </h3>
              <div className="grid grid-cols-5 gap-3">
                 {questions.map((q, idx) => (
                   <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "aspect-square rounded-xl flex items-center justify-center font-black text-xs transition-all",
                      currentIndex === idx ? "bg-primary text-white scale-110 shadow-lg shadow-red-100 ring-4 ring-primary/10" :
                      answers[q.id] ? "bg-green-100 text-green-600" : "bg-gray-50 text-gray-300 hover:bg-gray-100"
                    )}
                   >
                     {idx + 1}
                   </button>
                 ))}
              </div>
              <div className="mt-8 pt-8 border-t border-gray-50 space-y-3">
                 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <div className="w-3 h-3 bg-primary rounded-full"></div> Sedang Dikerjakan
                 </div>
                 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div> Sudah Dijawab
                 </div>
                 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <div className="w-3 h-3 bg-gray-200 rounded-full"></div> Belum Dijawab
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
