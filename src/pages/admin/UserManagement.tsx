import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  UserPlus,
  Filter,
  Loader2
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { Profile } from '@/src/types';
import toast from 'react-hot-toast';
import { cn, formatDate } from '@/src/lib/utils';

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', role: 'siswa', class: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast.error(error.message);
    else setUsers(data || []);
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.loading('Mendaftarkan user baru...');
    
    // Note: In real app, you'd use a Supabase Edge Function or Service Role Client
    // to create users without logging out the current admin.
    // For this demo, we assume we update the profiles table directly
    // and manage Auth via Supabase Console.
    
    const { error } = await supabase.from('profiles').insert([
       { ...formData, id: crypto.randomUUID() } // Mocking UUID for UI demo
    ]);

    toast.dismiss();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('User ditambahkan ke daftar profil.');
      setIsModalOpen(false);
      fetchUsers();
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Hapus user ini?')) return;
    
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('User berhasil dihapus');
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight italic">Manajemen User</h1>
          <p className="text-gray-500 text-sm italic">Kelola akun Guru dan Siswa di platform ini.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-red-100 transition-all active:scale-95 text-sm"
        >
          <UserPlus size={20} />
          Tambah User Baru
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-primary/20 hover:text-primary transition-all">
            <Filter size={18} />
            Filter Role
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest italic">Nama & Email</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest italic">Role</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest italic">Kelas</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest italic">Terdaftar</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest italic text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={40} />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 italic font-medium">Tidak ada user ditemukan.</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      user.role === 'admin' ? "bg-red-100 text-red-600" :
                      user.role === 'guru' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600 font-medium">{user.class || '-'}</td>
                  <td className="px-6 py-5 text-xs text-gray-400">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                         <Edit2 size={18} />
                       </button>
                       <button 
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-colors">
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <h2 className="text-2xl font-black text-gray-900 mb-6 italic">Tambah User Baru</h2>
              <form onSubmit={handleAddUser} className="space-y-5">
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1 tracking-widest">Nama Lengkap</label>
                   <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1 tracking-widest">Email Address</label>
                   <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 tracking-widest">Role</label>
                      <select 
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value as any})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium"
                      >
                        <option value="guru">Guru</option>
                        <option value="siswa">Siswa</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 tracking-widest">Kelas (Khusus Siswa)</label>
                      <input 
                        type="text" 
                        value={formData.class}
                        onChange={e => setFormData({...formData, class: e.target.value})}
                        placeholder="Contoh: X TKJ 1"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-4">
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
                      Simpan User
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
