import React, { useEffect, useState } from 'react';
import { Plus, FileText, Send, Eye, Download, AlertTriangle, CheckCircle2, Clock, FileUp, X, Filter } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Material, Category } from '../types';
import { Badge } from '../components/ui/Badge';
import { ApprovalWorkflowStepper } from '../components/ui/ApprovalWorkflowStepper';
import { useAuth } from '../contexts/AuthContext';

export const LecturerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semester, setSemester] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [accessLevel, setAccessLevel] = useState<string>('PUBLIC');
  const [allowDownload, setAllowDownload] = useState<boolean>(true);
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setSubject('');
    setCourseCode('');
    setAllowDownload(true);
    setFile(null);
    setShowUploadModal(true);
  };

  const openEditModal = (m: Material) => {
    setEditingId(m.id);
    setTitle(m.title);
    setDescription(m.description || '');
    setSubject(m.subject);
    setCourseCode(m.course_code || '');
    setAcademicYear(m.academic_year || '2025-2026');
    setSemester(m.semester || 1);
    setCategoryId(m.category_id);
    setAccessLevel(m.access_level);
    setAllowDownload(m.allow_download !== undefined ? m.allow_download : true);
    setFile(null);
    setShowUploadModal(true);
  };

  const fetchLecturerData = async () => {
    try {
      const [matRes, catRes]: any = await Promise.all([
        axiosClient.get('/materials?approval_status=&limit=50'),
        axiosClient.get('/categories')
      ]);
      if (matRes.success) setMaterials(matRes.data.items || []);
      if (catRes.success) {
        setCategories(catRes.data || []);
        if (catRes.data.length > 0 && !categoryId) setCategoryId(catRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturerData();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !categoryId) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subject', subject);
      formData.append('course_code', courseCode);
      formData.append('academic_year', academicYear);
      formData.append('semester', semester.toString());
      formData.append('faculty', user?.faculty || 'Khoa Công Nghệ Thông Tin');
      formData.append('category_id', categoryId.toString());
      formData.append('access_level', accessLevel);
      formData.append('allow_download', allowDownload ? 'true' : 'false');
      if (tags) formData.append('tags', tags);
      if (file) formData.append('file', file);

      const res: any = editingId
        ? await axiosClient.put(`/materials/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await axiosClient.post('/materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      if (res.success) {
        setShowUploadModal(false);
        setEditingId(null);
        setTitle('');
        setDescription('');
        setSubject('');
        setCourseCode('');
        setFile(null);
        fetchLecturerData();
      }
    } catch (err: any) {
      alert(err.detail || 'Cập nhật học liệu thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitApproval = async (materialId: number) => {
    try {
      const res: any = await axiosClient.post(`/materials/${materialId}/submit`);
      if (res.success) {
        fetchLecturerData();
      }
    } catch (err: any) {
      alert(err.detail || 'Không thể gửi duyệt.');
    }
  };

  const filteredMaterials = statusFilter
    ? materials.filter((m) => m.approval_status === statusFilter)
    : materials;

  const countByStatus = (st: string) => materials.filter((m) => m.approval_status === st).length;

  return (
    <div className="space-y-8">
      
      {/* Lecturer Console Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-blue-500/30 text-blue-300 rounded text-xs font-bold border border-blue-400/30">
              Giảng viên chính thức
            </span>
            <span className="text-xs text-slate-300">• Khoa: {user?.faculty || 'Công nghệ Thông tin'}</span>
          </div>
          <h1 className="text-2xl font-extrabold mt-2">
            Quản Lý & Phê Duyệt Học Liệu Giảng Dạy
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Khởi tạo bài giảng ở dạng bản nháp, gửi yêu cầu thẩm định đến Quản trị viên và theo dõi lượt tải
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload học liệu mới</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Tổng Số Bài Giảng</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{materials.length}</h3>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold uppercase text-amber-600">Đang Chờ Thẩm Định</p>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{countByStatus('PENDING_APPROVAL')}</h3>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold uppercase text-emerald-600">Đã Xuất Bản Thư Viện</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{countByStatus('PUBLISHED')}</h3>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold uppercase text-blue-600">Tổng Lượt Tải Bài Giảng</p>
          <h3 className="text-2xl font-extrabold text-blue-600 mt-1">
            {materials.reduce((acc, m) => acc + (m.download_count || 0), 0)}
          </h3>
        </div>
      </div>

      {/* Materials Workspace Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Workspace Controls Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Danh Sách Học Liệu Của Tôi ({filteredMaterials.length})</h3>
            <p className="text-xs text-slate-500 mt-0.5">Quản lý trạng thái thẩm định và tập tin tài liệu</p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === '' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({materials.length})
            </button>
            <button
              onClick={() => setStatusFilter('DRAFT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'DRAFT' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bản nháp ({countByStatus('DRAFT')})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING_APPROVAL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'PENDING_APPROVAL' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chờ duyệt ({countByStatus('PENDING_APPROVAL')})
            </button>
            <button
              onClick={() => setStatusFilter('PUBLISHED')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'PUBLISHED' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã xuất bản ({countByStatus('PUBLISHED')})
            </button>
            <button
              onClick={() => setStatusFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'REJECTED' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bị từ chối ({countByStatus('REJECTED')})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Đang nạp danh sách học liệu...</div>
        ) : filteredMaterials.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Không tìm thấy học liệu nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMaterials.map((m) => (
              <div key={m.id} className="p-5 hover:bg-slate-50/80 transition-colors">
                
                {/* Rejection Timeline Banner if status is REJECTED */}
                {m.approval_status === 'REJECTED' && (
                  <ApprovalWorkflowStepper
                    status="REJECTED"
                    rejectionReason={m.rejection_reason}
                    onEdit={() => openEditModal(m)}
                    onResubmit={() => handleSubmitApproval(m.id)}
                  />
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge type="status" value={m.approval_status} />
                      <Badge type="access" value={m.access_level} />
                      <span className="text-xs text-slate-500 font-medium">
                        • Môn: <strong className="text-slate-800">{m.subject}</strong> ({m.course_code || 'N/A'})
                      </span>
                    </div>

                    <a href={`/materials/${m.id}`} className="font-extrabold text-slate-900 text-sm hover:text-blue-600 transition-colors block">
                      {m.title}
                    </a>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {m.description || 'Chưa có mô tả'}
                    </p>

                    <div className="mt-2.5 flex items-center space-x-4 text-xs text-slate-400">
                      <span>Lượt xem: <strong className="text-slate-700">{m.view_count}</strong></span>
                      <span>Lượt tải: <strong className="text-blue-600">{m.download_count}</strong></span>
                      <span>Ngày tạo: <strong className="text-slate-700">{new Date(m.created_at).toLocaleDateString('vi-VN')}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {(m.approval_status === 'DRAFT' || m.approval_status === 'REJECTED') && (
                      <>
                        <button
                          onClick={() => openEditModal(m)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
                        >
                          <FileUp className="w-3.5 h-3.5" />
                          <span>Chỉnh sửa</span>
                        </button>

                        <button
                          onClick={() => handleSubmitApproval(m.id)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Gửi phê duyệt</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={async () => {
                        if (confirm(`Bạn có chắc chắn muốn xóa học liệu '${m.title}'?`)) {
                          try {
                            const res: any = await axiosClient.delete(`/materials/${m.id}`);
                            if (res.success) fetchLecturerData();
                          } catch (err: any) {
                            alert(err.detail || 'Không thể xóa học liệu.');
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-all"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingId ? 'Chỉnh Sửa Học Liệu Giảng Dạy' : 'Upload Học Liệu Mới'}
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên học liệu / Bài giảng *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Giáo trình Kiến trúc Phần mềm 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên Môn Học *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="VD: Kiến Trúc Phần Mềm"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mã Học Phần</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="VD: INT3201"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Danh Mục Đào Tạo *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quyền Truy Cập *</label>
                  <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-semibold"
                  >
                    <option value="PUBLIC">Công khai (Public)</option>
                    <option value="AUTHENTICATED">Nội bộ trường (Logged in)</option>
                    <option value="ROLE_BASED">Theo vai trò (Role Based)</option>
                    <option value="PRIVATE">Riêng tư (Private)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="allowDownloadCheck"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="allowDownloadCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Cho phép sinh viên / người đọc tải tập tin về máy
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mô tả tóm tắt học liệu</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tóm tắt nội dung chính của bài giảng..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {editingId ? 'Thay Thế Tệp Đính Kèm Mới (Bỏ qua nếu giữ nguyên file cũ)' : 'Tệp Đính Kèm (PDF, DOCX, PPTX, ZIP, Max 50MB)'}
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all flex items-center space-x-1 disabled:opacity-50"
                >
                  <FileUp className="w-4 h-4" />
                  <span>{submitting ? 'Đang tải lên...' : 'Lưu bản nháp học liệu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
