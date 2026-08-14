import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';
import { FileText, Download, Eye, Heart, User as UserIcon, Calendar, Tag as TagIcon, Shield, ArrowLeft, Building, ChevronRight } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Material, APIResponse } from '../types';
import { Badge } from '../components/ui/Badge';
import { LecturerProfileModal } from '../components/ui/LecturerProfileModal';

export const MaterialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [lecturerModalId, setLecturerModalId] = useState<number | null>(null);

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

  const handleDownload = (fileId?: number) => {
    if (!material) return;
    const url = `/api/v1/materials/${material.id}/download${fileId ? `?file_id=${fileId}` : ''}`;
    window.open(url, '_blank');
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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
          Đang nạp thông tin học liệu...
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-2xl mx-auto px-4 flex flex-col items-center justify-center text-center py-16">
          <Shield className="w-16 h-16 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Không Thể Truy Cập Học Liệu</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'Tài liệu không tồn tại.'}</p>
          <Link to="/materials" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md">
            Quay lại Kho Học Liệu
          </Link>
        </div>
      </div>
    );
  }

  const authorName = material.author?.full_name || material.author_name || 'Giảng viên';
  const facultyName = material.author?.faculty || material.faculty || 'Khoa Công nghệ thông tin';
  const initial = authorName ? authorName.charAt(0).toUpperCase() : 'G';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* Back Link */}
        <Link to="/materials" className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Trở về danh sách học liệu</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-8">
          
          {/* Header Badges */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Badge type="access" value={material.access_level} />
              <Badge type="status" value={material.approval_status} />
              <span className="text-xs font-semibold text-indigo-700 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                {material.category_name}
              </span>
            </div>

            <button
              onClick={handleFavoriteToggle}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                isFav
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              <span>{isFav ? 'Đã yêu thích' : 'Lưu yêu thích'}</span>
            </button>
          </div>

          {/* Author Card Section (Requirement 2) */}
          <div
            onClick={() => setLecturerModalId(material.author?.id || material.author_id)}
            className="flex items-center space-x-4 p-4 sm:p-5 bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-slate-50 rounded-2xl border border-indigo-100 mb-6 cursor-pointer hover:border-indigo-300 transition-all group shadow-sm"
          >
            <div className="relative flex-shrink-0">
              {material.author?.avatar_url ? (
                <img
                  src={material.author.avatar_url}
                  alt={authorName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-lg flex items-center justify-center border-2 border-white shadow-md">
                  {initial}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                  {authorName}
                </h3>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md flex-shrink-0">
                  Giảng viên
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                Giảng viên · <span className="font-semibold text-slate-700">{facultyName}</span>
              </p>
            </div>

            <div className="hidden sm:flex items-center space-x-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform flex-shrink-0">
              <span>Xem hồ sơ</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-4">
            {material.title}
          </h1>

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-6 py-4 border-y border-slate-100 text-xs text-slate-500 mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Môn học: <strong className="text-slate-800">{material.subject} {material.course_code ? `(${material.course_code})` : ''}</strong></span>
            </div>
            {material.created_at && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Ngày đăng: <strong className="text-slate-800">{new Date(material.created_at).toLocaleDateString('vi-VN')}</strong></span>
              </div>
            )}
            <div className="flex items-center space-x-4 ml-auto text-slate-400">
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span className="font-semibold text-slate-700">{material.view_count} lượt xem</span>
              </span>
              <span className="flex items-center space-x-1">
                <Download className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold text-indigo-600">{material.download_count} lượt tải</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Mô Tả Học Liệu</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {material.description || 'Chưa có mô tả chi tiết cho học liệu này.'}
            </p>
          </div>

          {/* Attached Files & Download Action */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Danh Sách Tập Tin Đính Kèm ({material.files ? material.files.length : 0})</h3>
            
            {material.files && material.files.length > 0 ? (
              <div className="space-y-3">
                {material.files.map((f) => (
                  <div key={f.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between hover:bg-indigo-50/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 font-bold text-xs uppercase border border-slate-200">
                        {f.file_extension.replace('.', '')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{f.original_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Dung lượng: {(f.file_size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(f.id)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Tải về an toàn</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-400 text-xs">
                Chưa có tập tin đính kèm cho học liệu này.
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Lecturer Mini Profile Modal */}
      <LecturerProfileModal
        lecturerId={lecturerModalId}
        isOpen={lecturerModalId !== null}
        onClose={() => setLecturerModalId(null)}
      />
    </div>
  );
};
