-- SCHEMA SQL UNTUK SUPABASE --

-- 1. Tabel Profiles (User)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'guru', 'siswa')) NOT NULL,
  class TEXT, -- Untuk siswa
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabel Students (Data Siswa Detil)
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nis TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  major TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabel Subjects (Mata Pelajaran)
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabel Question Bank (Bank Soal)
CREATE TABLE question_bank (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  option_e TEXT NOT NULL,
  correct_answer TEXT CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')) NOT NULL,
  score_weight INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabel Exams (Ujian)
CREATE TABLE exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  class TEXT NOT NULL, -- Kelas yang boleh ikut
  description TEXT,
  duration INTEGER NOT NULL, -- Dalam menit
  start_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft' NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Tabel Relasi Exam-Questions
CREATE TABLE exam_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES question_bank(id) ON DELETE CASCADE NOT NULL
);

-- 7. Tabel Exam Attempts (Pengerjaan Ujian)
CREATE TABLE exam_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE,
  score DECIMAL(5,2) DEFAULT 0,
  status TEXT CHECK (status IN ('ongoing', 'completed')) DEFAULT 'ongoing' NOT NULL
);

-- 8. Tabel Student Answers (Jawaban Siswa)
CREATE TABLE student_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES question_bank(id) ON DELETE CASCADE NOT NULL,
  selected_answer TEXT CHECK (selected_answer IN ('A', 'B', 'C', 'D', 'E')),
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) --

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;

-- 101. Fungsi Helper yang AMAN dari rekursi (Security Definer + Search Path)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'guru'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 102. Update Policy Profiles (Pusat Masalah)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles access policy" ON profiles;
DROP POLICY IF EXISTS "Admin write access" ON profiles;

-- Kebijakan SELECT: User bisa melihat profilnya sendiri ATAU Admin (lewat bypass RLS) bisa melihat semua
CREATE POLICY "Profiles select policy" ON public.profiles 
FOR SELECT USING (
  auth.uid() = id OR check_is_admin()
);

-- Kebijakan WRITE (Insert/Update/Delete): Hanya Admin
CREATE POLICY "Profiles admin write policy" ON public.profiles
FOR ALL USING ( check_is_admin() );

-- 103. Update Policy Students
DROP POLICY IF EXISTS "Admin manage all students" ON students;
DROP POLICY IF EXISTS "Teachers view students" ON students;

CREATE POLICY "Admin manage all students" ON students FOR ALL USING (check_is_admin());
CREATE POLICY "Teachers view students" ON students FOR SELECT USING (check_is_teacher());

-- 104. Update Policy Subjects
DROP POLICY IF EXISTS "Admin manage all subjects" ON subjects;
DROP POLICY IF EXISTS "Public view subjects" ON subjects;

CREATE POLICY "Admin manage all subjects" ON subjects FOR ALL USING (check_is_admin());
CREATE POLICY "Public view subjects" ON subjects FOR SELECT USING (true);

-- 101. Grant All Permissions to Authenticated Users
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.students TO authenticated;
GRANT ALL ON TABLE public.subjects TO authenticated;
GRANT ALL ON TABLE public.question_bank TO authenticated;
GRANT ALL ON TABLE public.exams TO authenticated;
GRANT ALL ON TABLE public.exam_questions TO authenticated;
GRANT ALL ON TABLE public.exam_attempts TO authenticated;
GRANT ALL ON TABLE public.student_answers TO authenticated;

-- 105. Update Policy Question Bank
DROP POLICY IF EXISTS "Admin manage all questions" ON question_bank;
DROP POLICY IF EXISTS "Guru manage own questions" ON question_bank;
DROP POLICY IF EXISTS "Siswa view exam questions" ON question_bank;

-- Admin can do anything
CREATE POLICY "Admin manage all questions" ON question_bank 
FOR ALL TO authenticated 
USING (check_is_admin());

-- Guru can manage their own questions
CREATE POLICY "Guru manage own questions" ON question_bank 
FOR ALL TO authenticated 
USING (teacher_id = auth.uid());

-- Everyone (especially students) can view questions
CREATE POLICY "Siswa view exam questions" ON question_bank 
FOR SELECT TO authenticated 
USING (true);

-- 106. Update Policy Exams
DROP POLICY IF EXISTS "Admin manage all exams" ON exams;
DROP POLICY IF EXISTS "Guru manage own exams" ON exams;
DROP POLICY IF EXISTS "Siswa view class exams" ON exams;

-- Buat fungsi helper untuk mengambil kelas siswa
CREATE OR REPLACE FUNCTION public.get_my_class()
RETURNS TEXT AS $$
  SELECT class FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE POLICY "Admin manage all exams" ON exams FOR ALL USING (check_is_admin());
CREATE POLICY "Guru manage own exams" ON exams FOR ALL USING (created_by = auth.uid());
CREATE POLICY "Siswa view class exams" ON exams FOR SELECT USING (
  status = 'published' AND 
  class = get_my_class()
);

-- Policy Exam Attempts
CREATE POLICY "Siswa manage own attempts" ON exam_attempts FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Guru view attempts on their exams" ON exam_attempts FOR SELECT USING (exam_id IN (SELECT id FROM exams WHERE created_by = auth.uid()));

-- Policy Student Answers
CREATE POLICY "Siswa manage own answers" ON student_answers FOR ALL USING (attempt_id IN (SELECT id FROM exam_attempts WHERE student_id = auth.uid()));
CREATE POLICY "Guru view answers on their exams" ON student_answers FOR SELECT USING (attempt_id IN (SELECT id FROM exam_attempts WHERE exam_id IN (SELECT id FROM exams WHERE created_by = auth.uid())));

-- TRIGGER UNTUK AUTOMATIC ADMIN ROLE PADA USER PERTAMA --
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'admin'
      ELSE COALESCE(new.raw_user_meta_data->>'role', 'siswa')
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
