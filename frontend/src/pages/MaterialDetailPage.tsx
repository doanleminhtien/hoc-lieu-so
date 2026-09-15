import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Eye, Heart, Calendar, ArrowLeft, Building, ChevronRight, Loader2, ShieldAlert, FileText, CheckCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Material, APIResponse } from '../types';
import { Badge } from '../components/ui/Badge';
import { ApprovalWorkflowStepper } from '../components/ui/ApprovalWorkflowStepper';
import { LecturerProfileModal } from '../components/ui/LecturerProfileModal';
import { CommentSection } from '../components/ui/CommentSection';
import { ReviewSection } from '../components/ui/ReviewSection';

export const MaterialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [lecturerModalId, setLecturerModalId] = useState<number | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res: APIResponse<Material> = await axiosClient.get(`/materials/${id}`);
        if (res.success && res.data) {
          setMaterial(res.data);
          setIsFav(res.data.is_favorite || false);
        }
      } catch (err: any) {
        setError(err.detail || err.message || 'Không có quyền truy cập hoặc tài liệu không tồn tại.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleDownload = async (fileId?: number, fileName?: string) => {
    if (!material) return;
    const targetFileId = fileId || (material.files && material.files.length > 0 ? material.files[0].id : undefined);
    if (!targetFileId) return;

    setDownloadingFileId(targetFileId);
    try {
      const response: any = await axiosClient.get(`/materials/${material.id}/download?file_id=${targetFileId}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName || 'hoc_lieu_so');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Increment download count locally for instant UI update
      setMaterial((prev) => (prev ? { ...prev, download_count: prev.download_count + 1 } : prev));
    } catch (err: any) {
      let errMsg = 'Bạn không có quyền tải tập tin này hoặc tập tin không tồn tại.';
      if (err instanceof Blob) {
        try {
          const text = await err.text();
          const json = JSON.parse(text);
          if (json.detail) errMsg = json.detail;
        } catch (_) {}
      } else if (err?.detail) {
        errMsg = err.detail;
      } else if (err?.message) {
        errMsg = err.message;
      }
      alert(errMsg);
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!material) return;
    try {
      const res: any = await axiosClient.post(`/materials/${material.id}/favorite`);
      if (res.success) {
        setIsFav(res.data.is_favorite);
      }
    } catch (err) {
      alert('Vui lòng đăng nhập để lưu tài liệu yêu thích.');
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 text-xs">
        Đang nạp thông tin chi tiết học liệu...
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="max-w-2xl mx-auto px-4 flex flex-col items-center justify-center text-center py-16">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Không Thể Truy Cập Học Liệu</h2>
        <p className="text-xs text-slate-500 mb-6">{error || 'Tài liệu không tồn tại.'}</p>
        <Link to="/materials" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md">
          Quay lại Kho Học Liệu
        </Link>
      </div>
    );
  }

  const authorName = material.author?.full_name || material.author_name || 'Giảng viên';
  const facultyName = material.author?.faculty || material.faculty || 'Khoa Công nghệ thông tin';
  const initial = authorName ? authorName.charAt(0).toUpperCase() : 'G';

  return (
    <div className="space-y-6">
      
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/materials"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trở về Kho Học Liệu</span>
        </Link>

        <button
          onClick={handleFavoriteToggle}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
            isFav
              ? 'bg-rose-50 text-rose-600 border-rose-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          <span>{isFav ? 'Đã yêu thích' : 'Lưu yêu thích'}</span>
        </button>
      </div>

      {/* Approval Lifecycle Stepper UI */}
      <ApprovalWorkflowStepper
        status={material.approval_status}
        rejectionReason={material.rejection_reason}
      />

      {/* Academic Workspace Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width): Main Document Details & Files */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            
            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs border border-blue-100">
                  {material.category_name}
                </span>
                <Badge type="access" value={material.access_level} />
                <Badge type="status" value={material.approval_status} />
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                {material.title}
              </h1>
            </div>

            {/* Document Description */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Tóm Tắt Nội Dung Học Liệu
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                {material.description || 'Chưa có tóm tắt nội dung chi tiết cho học liệu này.'}
              </p>
            </div>

            {/* Attached Files & Downloading Panel */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Tập Tin Đính Kèm ({material.files ? material.files.length : 0})
              </h3>

              {material.files && material.files.length > 0 ? (
                <div className="space-y-3">
                  {material.files.map((f) => (
                    <div
                      key={f.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex flex-col items-center justify-center text-blue-600 font-extrabold text-xs uppercase border border-slate-200 flex-shrink-0">
                          <FileText className="w-4 h-4 text-blue-600 mb-0.5" />
                          <span className="text-[9px] font-black">{f.file_extension.replace('.', '')}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 text-xs truncate">{f.original_name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Dung lượng: {(f.file_size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      {material.allow_download === false ? (
                        <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl text-center">
                          Chỉ hỗ trợ xem trực tuyến
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDownload(f.id, f.original_name)}
                          disabled={downloadingFileId === f.id}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 flex-shrink-0"
                        >
                          {downloadingFileId === f.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Đang tải...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Tải về máy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                  Chưa có tập tin đính kèm cho học liệu này.
                </div>
              )}
            </div>

          </div>

          {/* Review Section */}
          <ReviewSection materialId={material.id} />

          {/* Comment Section */}
          <CommentSection materialId={material.id} />
        </div>

        {/* Right Column (1/3 width): Metadata & Lecturer Profile */}
        <div className="space-y-6">
          
          {/* Lecturer Card */}
          <div
            onClick={() => setLecturerModalId(material.author?.id || material.author_id)}
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-blue-300 transition-all group"
          >
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">Tác Giả & Giảng Viên Phụ Trách</p>
            <div className="flex items-center space-x-3">
              {material.author?.avatar_url ? (
                <img
                  src={material.author.avatar_url}
                  alt={authorName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold text-base flex items-center justify-center flex-shrink-0 shadow-xs">
                  {initial}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                  {authorName}
                </h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">{facultyName}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                  Giảng viên chính thức
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
              <span>Xem hồ sơ công khai</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Document Properties Meta Box */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100">
              Thông Tin Học Thuật
            </h4>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Môn học:</span>
              <strong className="text-slate-900 font-bold">{material.subject}</strong>
            </div>

            {material.course_code && (
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Mã học phần:</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono font-bold">
                  {material.course_code}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Quyền truy cập:</span>
              <Badge type="access" value={material.access_level} />
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Lượt xem:</span>
              <span className="font-bold text-slate-900">{material.view_count}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Lượt tải:</span>
              <span className="font-bold text-blue-600">{material.download_count}</span>
            </div>

            {material.created_at && (
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Ngày đăng:</span>
                <span className="font-medium text-slate-700">
                  {new Date(material.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>

        </div>

      </div>

      <LecturerProfileModal
        lecturerId={lecturerModalId}
        isOpen={lecturerModalId !== null}
        onClose={() => setLecturerModalId(null)}
      />
    </div>
  );
};
