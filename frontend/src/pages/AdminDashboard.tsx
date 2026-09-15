import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, FileText, CheckCircle2, Clock, Eye, Download, ShieldAlert, XCircle, Check, Lock, Unlock, AlertTriangle, UserPlus, Edit3 } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Material, User } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [kpi, setKpi] = useState<any>(null);
  const [pendingMaterials, setPendingMaterials] = useState<Material[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Đọc tham số tab từ URL
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  // Chuẩn hóa activeTab theo URL (overview/kpi -> kpi)
  const activeTab = (tabFromUrl === 'pending' || tabFromUrl === 'users' || tabFromUrl === 'logs')
    ? tabFromUrl
    : 'kpi';

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  // STATE QUẢN LÝ MODAL THÊM & SỬA NGƯỜI DÙNG
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    full_name: '',
    email: '',
    user_code: '',
    faculty: 'Khoa Công nghệ Thông tin',
    role_name: 'LECTURER',
    password: 'Password123@'
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    role_name: 'LECTURER',
    faculty: '',
    user_code: ''
  });

  const fetchDashboardData = async () => {
    try {
      const [kpiRes, pendingRes, userRes, logRes]: any = await Promise.all([
        axiosClient.get('/admin/dashboard'),
        axiosClient.get('/materials?approval_status=PENDING_APPROVAL&limit=20'),
        axiosClient.get('/admin/users?limit=20'),
        axiosClient.get('/admin/audit-logs?limit=20')
      ]);

      if (kpiRes.success) setKpi(kpiRes.data);
      if (pendingRes.success) setPendingMaterials(pendingRes.data.items || []);
      if (userRes.success) setUsers(userRes.data.items || []);
      if (logRes.success) setAuditLogs(logRes.data.items || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu bảng quản trị:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (materialId: number) => {
    try {
      const res: any = await axiosClient.post(`/materials/${materialId}/approve`);
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert('Không thể phê duyệt học liệu này.');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId || !rejectReason.trim()) return;
    try {
      const res: any = await axiosClient.post(`/materials/${rejectingId}/reject`, {
        rejection_reason: rejectReason.trim()
      });
      if (res.success) {
        setRejectingId(null);
        setRejectReason('');
        fetchDashboardData();
      }
    } catch (err) {
      alert('Lỗi khi gửi từ chối học liệu.');
    }
  };

  const handleToggleBlockUser = async (userId: number, currentBlocked: boolean) => {
    try {
      const res: any = await axiosClient.put(`/admin/users/${userId}/status?is_blocked=${!currentBlocked}`);
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.detail || 'Không thể thay đổi trạng thái tài khoản.');
    }
  };

  // HÀM TẠO NGUỜI DÙNG / GIẢNG VIÊN MỚI
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await axiosClient.post('/admin/users', newUserForm);
      if (res.success || res.status === 200 || res.id) {
        setIsAddUserModalOpen(false);
        setNewUserForm({
          full_name: '',
          email: '',
          user_code: '',
          faculty: 'Khoa Công nghệ Thông tin',
          role_name: 'LECTURER',
          password: 'Password123@'
        });
        fetchDashboardData();
        alert('Tạo tài khoản thành công!');
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể tạo tài khoản người dùng.');
    }
  };

  // HÀM PHÂN QUYỀN / CẬP NHẬT TÀI KHOẢN
  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditUserForm({
      role_name: u.role_name || 'STUDENT',
      faculty: u.faculty || '',
      user_code: u.user_code || ''
    });
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res: any = await axiosClient.put(`/admin/users/${editingUser.id}`, editUserForm);
      if (res.success || res.status === 200) {
        setEditingUser(null);
        fetchDashboardData();
        alert('Cập nhật phân quyền thành công!');
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Lỗi khi cập nhật tài khoản.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Bảng Quản Trị Hệ Thống (Admin Console)</h1>
          <p className="text-xs text-slate-500 mt-1">Giám sát chỉ số vận hành, thẩm định học liệu và phân quyền tài khoản người dùng</p>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => handleTabChange('kpi')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'kpi' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tổng quan KPIs
          </button>
          <button
            onClick={() => handleTabChange('pending')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              activeTab === 'pending' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Hàng chờ duyệt</span>
            {pendingMaterials.length > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-extrabold">
                {pendingMaterials.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('users')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Người dùng & RBAC
          </button>
          <button
            onClick={() => handleTabChange('logs')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'logs' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nhật ký bảo mật
          </button>
        </div>
      </div>

      {/* Tab 1: KPIs & Charts */}
      {activeTab === 'kpi' && kpi && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Tổng Người Dùng</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{kpi.total_users}</h3>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Học Liệu Phát Hành</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{kpi.published_materials}</h3>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-amber-600">Đang Chờ Phê Duyệt</p>
                <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">{kpi.pending_materials}</h3>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-100">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Lượt Tải Toàn Hệ Thống</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{kpi.total_downloads}</h3>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">
              Phân Phối Học Liệu Theo Danh Mục Đào Tạo
            </h3>
            <p className="text-xs text-slate-500 mb-4">Thống kê số lượng bài giảng đã thẩm định qua truy vấn tổng hợp SQL</p>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpi.materials_by_category}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} name="Số lượng học liệu" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pending Approval Queue */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Hàng Chờ Phê Duyệt Học Liệu ({pendingMaterials.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">Kiểm duyệt kỹ thông tin môn học, tác giả và tệp đính kèm trước khi cho phép công khai</p>
            </div>
          </div>

          {pendingMaterials.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Hiện tại không có học liệu nào đang chờ duyệt.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingMaterials.map((m) => (
                <div key={m.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px] uppercase">
                        {m.category_name}
                      </span>
                      <span className="text-xs text-slate-400">• Môn: {m.subject}</span>
                    </div>

                    <a href={`/materials/${m.id}`} className="font-extrabold text-slate-900 text-sm hover:text-blue-600 transition-colors block">
                      {m.title}
                    </a>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{m.description || 'Chưa có mô tả'}</p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Tác giả: <strong className="text-slate-800">{m.author_name}</strong></span>
                      <span>Quyền truy cập: <strong className="text-slate-800">{m.access_level}</strong></span>
                      <span>Tệp: <strong className="text-slate-800">{m.files?.[0]?.original_name || 'N/A'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(m.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Phê duyệt</span>
                    </button>
                    <button
                      onClick={() => setRejectingId(m.id)}
                      className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border border-rose-200"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Từ chối</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: User Management Table */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Quản Lý Người Dùng & Phân Quyền Vai Trò</h3>
              <p className="text-xs text-slate-500 mt-0.5">Danh sách các tài khoản sinh viên, giảng viên và quản trị viên</p>
            </div>

            {/* NÚT THÊM NGUỜI DÙNG / GIẢNG VIÊN */}
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm người dùng mới</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 font-bold">
                  <th className="p-4">Họ tên & Email</th>
                  <th className="p-4">Mã MSSV / CB</th>
                  <th className="p-4">Khoa / Đơn vị</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-xs">{u.full_name}</p>
                      <p className="text-slate-400">{u.email}</p>
                    </td>
                    <td className="p-4 font-mono font-semibold">{u.user_code || '---'}</td>
                    <td className="p-4">{u.faculty || '---'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${
                        u.role_name === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role_name === 'LECTURER'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.role_name === 'ADMIN' ? 'Quản trị viên' : u.role_name === 'LECTURER' ? 'Giảng viên' : 'Sinh viên'}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.is_blocked ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">Đã khóa</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Hoạt động</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* NÚT PHÂN QUYỀN / SỬA */}
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-all"
                          title="Phân quyền / Sửa thông tin"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* NÚT KHÓA / MỞ KHÓA */}
                        <button
                          onClick={() => handleToggleBlockUser(u.id, u.is_blocked)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1 ${
                            u.is_blocked
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          {u.is_blocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{u.is_blocked ? 'Mở khóa' : 'Khóa'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Security Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">Nhật Ký Bảo Mật System Audit Logs</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ghi vết các thao tác phê duyệt, đăng nhập và truy cập dữ liệu kỹ thuật</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 font-bold">
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Người thực hiện</th>
                  <th className="p-4">Hành động</th>
                  <th className="p-4">Đối tượng</th>
                  <th className="p-4">Chi tiết kỹ thuật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {auditLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-slate-400">{new Date(l.created_at).toLocaleString('vi-VN')}</td>
                    <td className="p-4 font-sans font-bold text-slate-900">{l.user_name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold">{l.action}</span>
                    </td>
                    <td className="p-4">{l.target_entity} (ID: {l.target_id})</td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{JSON.stringify(l.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: TỪ CHỐI BÀI GIẢNG */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Nhập Lý Do Từ Chối Phê Duyệt</h3>
            <p className="text-xs text-slate-500 mb-4">Lý do từ chối sẽ được chuyển thẳng sang Giảng viên để chỉnh sửa và nộp lại.</p>

            <form onSubmit={handleRejectSubmit}>
              <textarea
                required
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="VD: Tập tin đính kèm thiếu trang bìa theo mẫu chính quy..."
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
              />

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-all"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TẠO TÀI KHOẢN NGƯỜI DÙNG / GIẢNG VIÊN MỚI */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Thêm Tài Khoản / Giảng Viên Mới</h3>
              <p className="text-xs text-slate-500">Khởi tạo tài khoản chính thức và cấp quyền ban đầu</p>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  placeholder="TS. Nguyễn Văn A"
                  value={newUserForm.full_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Trường</label>
                <input
                  type="email"
                  required
                  placeholder="nguyenvana@university.edu.vn"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Cán Bộ / MSSV</label>
                  <input
                    type="text"
                    required
                    placeholder="GV202602"
                    value={newUserForm.user_code}
                    onChange={(e) => setNewUserForm({ ...newUserForm, user_code: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vai Trò Vai Trò</label>
                  <select
                    value={newUserForm.role_name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role_name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
                  >
                    <option value="LECTURER">Giảng viên</option>
                    <option value="STUDENT">Sinh viên</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khoa / Đơn Vị Quản Lý</label>
                <input
                  type="text"
                  required
                  placeholder="Khoa Công nghệ Thông tin"
                  value={newUserForm.faculty}
                  onChange={(e) => setNewUserForm({ ...newUserForm, faculty: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mật Khẩu Ban Đầu</label>
                <input
                  type="text"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all"
                >
                  Xác nhận Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CẬP NHẬT PHÂN QUYỀN VAI TRÒ */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Phân Quyền & Chỉnh Sửa Tài Khoản</h3>
              <p className="text-xs text-slate-500">Đang chỉnh sửa: <strong>{editingUser.full_name}</strong> ({editingUser.email})</p>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vai Trò Hệ Thống</label>
                <select
                  value={editUserForm.role_name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role_name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
                >
                  <option value="STUDENT">Sinh viên</option>
                  <option value="LECTURER">Giảng viên</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Cán Bộ / MSSV</label>
                <input
                  type="text"
                  value={editUserForm.user_code}
                  onChange={(e) => setEditUserForm({ ...editUserForm, user_code: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khoa / Đơn Vị Quản Lý</label>
                <input
                  type="text"
                  value={editUserForm.faculty}
                  onChange={(e) => setEditUserForm({ ...editUserForm, faculty: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all"
                >
                  Cập Nhật Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};