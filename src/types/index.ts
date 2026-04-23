export type UserRole = 'admin' | 'guru' | 'siswa';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  class?: string;
  created_at: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  class: string;
  major: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  teacher_id: string;
  created_at: string;
}

export interface QuestionBank {
  id: string;
  subject_id: string;
  teacher_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E';
  score_weight: number;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  subject_id: string;
  class: string;
  description: string;
  duration: number;
  start_at: string;
  end_at: string;
  status: 'draft' | 'published';
  created_by: string;
  created_at: string;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  student_id: string;
  started_at: string;
  finished_at?: string;
  score: number;
  status: 'ongoing' | 'completed';
}

export interface StudentAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer?: 'A' | 'B' | 'C' | 'D' | 'E';
  is_correct?: boolean;
}
