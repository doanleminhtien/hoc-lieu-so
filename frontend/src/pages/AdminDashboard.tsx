import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/ui/Navbar';
import { Users, FileText, CheckCircle2, Clock, Eye, Download, ShieldAlert, XCircle, Check, Lock, Unlock } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { APIResponse, Material, User } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [kpi, setKpi] = useState<any>(null);
  const [pendingMaterials, setPendingMaterials] = useState<Material[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'kpi' | 'pending' | 'users' | 'logs'>('kpi');

  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [kpiRes, pendingRes, userRes, logRes]: any = await Promise.all([
        axiosClient.get('/admin/dashboard'),
        axiosClient.get('/materials?approval_status=PENDING_APPROVAL&limit=20'),
        axiosClient.get('/admin/users?limit=10'),
        axiosClient.get('/admin/audit-logs?limit=15')
      ]);

      if (kpiRes.success) setKpi(kpiRes.data);
      if (pendingRes.success) setPendingMaterials(pendingRes.data.items);
      if (userRes.success) setUsers(userRes.data.items);
      if (logRes.success) setAuditLogs(logRes.data.items);
    } catch (err) {
      console.error(err);
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
        rejection_reason: rejectReason
      });
      if (res.success) {
        setRejectingId(null);
        setRejectReason('');
        fetchDashboardData();
      }
    } catch (err) {
      alert('Lỗi từ chối học liệu.');
    }
  };

  const handleToggleBlockUser = async (userId: number, currentBlocked: boolean) => {
    try {
      const res: any = await axiosClient.put(`/admin/users/${userId}/status?is_blocked=${!currentBlocked}`);
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.detail || 'Không thể thay đổi trạng thái user.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bảng Quản Trị Hệ Thống (Admin Console)</h1>
            <p className="text-sm text-slate-500 mt-1">Giám sát tổng quan, phê duyệt học liệu và quản lý phân quyền người dùng</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mt-4 md:mt-0 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('kpi')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'kpi' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tổng quan KPIs
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Hàng chờ duyệt</span>
              {pendingMaterials.length > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                  {pendingMaterials.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Người dùng
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Audit Logs
            </button>
          </div>
        </div>

        {/* Tab 1: KPIs & Charts */}
        {activeTab === 'kpi' && kpi && (
          <div className="space-y-8">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Tổng Người Dùng</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.total_users}</h3>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Tài Liệu Đã Phát Hành</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.published_materials}</h3>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Đang Chờ Phê Duyệt</p>
                  <h3 className="text-2xl font-bold text-amber-600 mt-1">{kpi.pending_materials}</h3>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Lượt Tải Toàn Hệ Thống</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.total_downloads}</h3>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">Phân Phối Học Liệu Theo Danh Mục (SQL Aggregation)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kpi.materials_by_category}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Số lượng học liệu" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Pending Approval Queue */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Danh Sách Học Liệu Chờ Duyệt ({pendingMaterials.length})</h3>
              <span className="text-xs text-slate-400">Kiểm duyệt kỹ dung lượng, định dạng và tác giả trước khi xuất bản</span>
            </div>

            {pendingMaterials.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                Không có học liệu nào đang chờ duyệt!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingMaterials.map((m) => (
                  <div key={m.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded text-[10px] uppercase">
                          {m.category_name}
                        </span>
                        <span className="text-xs text-slate-400">• Môn: {m.subject}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base mt-1">{m.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{m.description || 'Chưa có mô tả'}</p>
                      
                      <div className="mt-3 flex items-center space-x-4 text-xs text-slate-400">
                        <span>Tác giả: <strong className="text-slate-700">{m.author_name}</strong></span>
                        <span>Quyền: <strong className="text-slate-700">{m.access_level}</strong></span>
                        <span>Tệp: <strong className="text-slate-700">{m.files?.[0]?.original_name || 'N/A'}</strong></span>
                      </div>
                    </div>

                    {/* Approve / Reject Actions */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleApprove(m.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Phê duyệt</span>
                      </button>
                      <button
                        onClick={() => setRejectingId(m.id)}
                        className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
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
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Quản Lý Người Dùng & Phân Quyền RBAC</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                    <th className="p-4 font-semibold">Họ tên & Email</th>
                    <th className="p-4 font-semibold">Mã SV/GV</th>
                    <th className="p-4 font-semibold">Khoa / Đơn vị</th>
                    <th className="p-4 font-semibold">Vai trò (Role)</th>
                    <th className="p-4 font-semibold">Trạng thái</th>
                    <th className="p-4 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900 text-sm">{u.full_name}</p>
                        <p className="text-slate-400">{u.email}</p>
                      </td>
                      <td className="p-4 font-mono font-medium">{u.user_code || '---'}</td>
                      <td className="p-4">{u.faculty || '---'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          u.role_name === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role_name === 'LECTURER'
                            ? 'bg-indigo-100 text-indigo-700'
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
                        <button
                          onClick={() => handleToggleBlockUser(u.id, u.is_blocked)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center space-x-1 ${
                            u.is_blocked
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          {u.is_blocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{u.is_blocked ? 'Mở khóa' : 'Khóa'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Nhật Ký Hệ Thống (Security & Audit Logs)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                    <th className="p-4 font-semibold">Thời gian</th>
                    <th className="p-4 font-semibold">Người thực hiện</th>
                    <th className="p-4 font-semibold">Hành động (Action)</th>
                    <th className="p-4 font-semibold">Đối tượng</th>
                    <th className="p-4 font-semibold">Chi tiết</th>
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

      </main>

      {/* Modal Rejection Reason */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Nhập Lý Do Từ Chối Phê Duyệt</h3>
            <p className="text-xs text-slate-500 mb-4">Lý do từ chối sẽ được thông báo trực tiếp đến Giảng viên để chỉnh sửa và nộp lại.</p>

            <form onSubmit={handleRejectSubmit}>
              <textarea
                required
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="VD: Định dạng file bài giảng chưa đáp ứng quy chuẩn môn học..."
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
              />

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
