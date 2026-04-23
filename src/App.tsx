import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import StudentData from './pages/admin/StudentData';
import SubjectManagement from './pages/admin/SubjectManagement';
import BankSoal from './pages/guru/BankSoal';
import ExamManagement from './pages/guru/ExamManagement';
import StudentExams from './pages/siswa/StudentExams';
import TakingExam from './pages/siswa/TakingExam';

// Dummy/Placeholder for other pages to prevent errors
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 italic text-gray-400">
    Halaman {title} sedang dalam pengembangan.
  </div>
);

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          
          {/* Admin Routes */}
          <Route path="users" element={<UserManagement />} />
          <Route path="students" element={<StudentData />} />
          <Route path="subjects" element={<SubjectManagement />} />
          
          {/* Shared Guru & Admin */}
          <Route path="bank" element={<BankSoal />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route path="results" element={<Placeholder title="Hasil Ujian" />} />
          
          {/* Siswa Routes */}
          <Route path="my-exams" element={<StudentExams />} />
          <Route path="exam/:id" element={<TakingExam />} />
          <Route path="my-results" element={<Placeholder title="Hasil Saya" />} />
          
          <Route path="settings" element={<Placeholder title="Pengaturan" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
