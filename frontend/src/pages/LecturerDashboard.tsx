import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/ui/Navbar';
import { Plus, FileText, Send, Eye, Download, AlertTriangle, CheckCircle2, Clock, XCircle, FileUp } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { APIResponse, Material, Category } from '../types';
import { Badge } from '../components/ui/Badge';

export const LecturerDashboard: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semester, setSemester] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [accessLevel, setAccessLevel] = useState<string>('PUBLIC');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchLecturerData = async () => {
    try {
      const [matRes, catRes]: any = await Promise.all([
        axiosClient.get('/materials?approval_status=&limit=50'),
        axiosClient.get('/categories')
      ]);
      if (matRes.success) setMaterials(matRes.data.items);
      if (catRes.success) {
        setCategories(catRes.data);
        if (catRes.data.length > 0) setCategoryId(catRes.data[0].id);
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
      formData.append('faculty', 'Khoa Công Nghệ Thông Tin');
      formData.append('category_id', categoryId.toString());
      formData.append('access_level', accessLevel);
      if (tags) formData.append('tags', tags);
      if (file) formData.append('file', file);

      const res: any = await axiosClient.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        setShowUploadModal(false);
        // Reset form
        setTitle('');
        setDescription('');
        setSubject('');
        setCourseCode('');
        setFile(null);
        fetchLecturerData();
      }
    } catch (err: any) {
      alert(err.detail || 'Upload thất bại.');
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản Lý Học Liệu Giảng Dạy (Lecturer Console)</h1>
            <p className="text-sm text-slate-500 mt-1">Đăng tải, theo dõi tiến trình phê duyệt và cập nhật nội dung bài giảng</p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Upload Học Liệu Mới</span>
          </button>
        </div>

        {/* Materials Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Danh Sách Học Liệu Của Tôi ({materials.length})</h3>
          </div>

          {materials.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Bạn chưa đăng tải học liệu nào. Hãy nhấn "Upload Học Liệu Mới" để bắt đầu.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {materials.map((m) => (
                <div key={m.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge type="status" value={m.approval_status} />
                      <Badge type="access" value={m.access_level} />
                      <span className="text-xs text-slate-400">• Môn: {m.subject} ({m.course_code || 'N/A'})</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">{m.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{m.description || 'Chưa có mô tả'}</p>

                    {/* Rejection Reason Notice */}
                    {m.approval_status === 'REJECTED' && m.rejection_reason && (
                      <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold block">Lý do từ chối từ Admin:</strong>
                          <span>{m.rejection_reason}</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center space-x-4 text-xs text-slate-400">
                      <span>Lượt xem: <strong className="text-slate-700">{m.view_count}</strong></span>
                      <span>Lượt tải: <strong className="text-slate-700">{m.download_count}</strong></span>
                      <span>Ngày tạo: <strong className="text-slate-700">{new Date(m.created_at).toLocaleDateString('vi-VN')}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    {(m.approval_status === 'DRAFT' || m.approval_status === 'REJECTED') && (
                      <button
                        onClick={() => handleSubmitApproval(m.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi duyệt</span>
                      </button>
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
                      className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-all"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Upload Học Liệu Giảng Dạy</h3>
            <p className="text-xs text-slate-500 mb-6">Tài liệu sau khi tạo ở dạng DRAFT, vui lòng nhấn Gửi Duyệt để Admin thẩm định.</p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tên học liệu / Bài giảng *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Giáo trình Kiến trúc Phần mềm 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tên Môn Học *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="VD: Kiến Trúc Phần Mềm"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mã Học Phần</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="VD: INT3201"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Danh Mục *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Quyền Truy Cập *</label>
                  <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="PUBLIC">Công khai (Public)</option>
                    <option value="AUTHENTICATED">Nội bộ trường (Logged in)</option>
                    <option value="ROLE_BASED">Theo vai trò (Role Based)</option>
                    <option value="PRIVATE">Riêng tư (Private)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mô tả học liệu</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tóm tắt nội dung chính của bài giảng..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Chọn Tệp Đính Kèm (PDF, DOCX, PPTX, ZIP, Max 50MB)</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
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
                  className="px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center space-x-1 disabled:opacity-50"
                >
                  <FileUp className="w-4 h-4" />
                  <span>{submitting ? 'Đang tải lên...' : 'Tạo bản nháp học liệu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
