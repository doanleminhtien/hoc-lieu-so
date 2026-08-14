import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Building, BookOpen, X, Eye, Download, ShieldCheck, ChevronRight } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

interface LecturerProfileData {
  id: number;
  full_name: string;
  avatar_url?: string;
  user_code?: string;
  faculty?: string;
  role_name?: string;
  published_count: number;
  materials: {
    id: number;
    title: string;
    slug: string;
    subject: string;
    course_code?: string;
    category_name: string;
    view_count: number;
    download_count: number;
    created_at: string;
  }[];
}

interface LecturerProfileModalProps {
  lecturerId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LecturerProfileModal: React.FC<LecturerProfileModalProps> = ({ lecturerId, isOpen, onClose }) => {
  const [data, setData] = useState<LecturerProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && lecturerId) {
      setLoading(true);
      axiosClient
        .get(`/auth/lecturers/${lecturerId}`)
        .then((res: any) => {
          if (res.success) {
            setData(res.data);
          }
        })
        .catch((err) => {
          console.error('Error fetching lecturer profile:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setData(null);
    }
  }, [isOpen, lecturerId]);

  if (!isOpen || !lecturerId) return null;

  const initial = data?.full_name ? data.full_name.charAt(0).toUpperCase() : 'G';
  const facultyName = data?.faculty || 'Khoa Công Nghệ Thông Tin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Hồ Sơ Giảng Viên Chính Thức</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Đang tải thông tin Giảng viên...
          </div>
        ) : !data ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Không tìm thấy thông tin Giảng viên này.
          </div>
        ) : (
          <div className="overflow-y-auto p-6 space-y-6">
            
            {/* Lecturer Card Banner */}
            <div className="flex items-start space-x-4 p-5 bg-gradient-to-br from-indigo-50/70 via-purple-50/30 to-slate-50 rounded-2xl border border-indigo-100/80">
              
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {data.avatar_url ? (
                  <img
                    src={data.avatar_url}
                    alt={data.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xl flex items-center justify-center border-2 border-white shadow-md">
                    {initial}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                  ✓
                </span>
              </div>

              {/* Basic Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-extrabold text-slate-900 truncate mb-1">
                  {data.full_name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-2">
                  <span className="font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                    Giảng viên
                  </span>
                  <span className="flex items-center space-x-1 text-slate-500">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{facultyName}</span>
                  </span>
                </div>
                {data.user_code && (
                  <p className="text-[11px] font-mono text-slate-400">
                    Mã cán bộ: {data.user_code}
                  </p>
                )}
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
                <p className="text-2xl font-extrabold text-indigo-600">{data.published_count}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Học liệu đã thẩm định</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
                <p className="text-2xl font-extrabold text-emerald-600">
                  {data.materials.reduce((acc, m) => acc + (m.download_count || 0), 0)}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Tổng lượt tải bài giảng</p>
              </div>
            </div>

            {/* Materials List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Danh Sách Học Liệu Phát Hành ({data.materials.length})</span>
                </h4>
              </div>

              {data.materials.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                  Giảng viên chưa phát hành bài giảng công khai nào.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {data.materials.map((m) => (
                    <Link
                      key={m.id}
                      to={`/materials/${m.id}`}
                      onClick={onClose}
                      className="p-3 bg-white hover:bg-indigo-50/50 rounded-xl border border-slate-200/80 hover:border-indigo-200 transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {m.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {m.subject} {m.course_code ? `(${m.course_code})` : ''} · <span className="text-indigo-600 font-medium">{m.category_name}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 flex-shrink-0">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{m.view_count}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-indigo-600 font-medium">
                          <Download className="w-3 h-3" />
                          <span>{m.download_count}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
