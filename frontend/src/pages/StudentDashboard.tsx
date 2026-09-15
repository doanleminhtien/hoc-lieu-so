import React, { useEffect, useState } from 'react';
import { Heart, Clock, BookOpen, GraduationCap, ChevronRight } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Material } from '../types';
import { MaterialCard } from '../components/ui/MaterialCard';
import { LecturerProfileModal } from '../components/ui/LecturerProfileModal';
import { useAuth } from '../contexts/AuthContext';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [favoriteMaterials, setFavoriteMaterials] = useState<Material[]>([]);
  const [historyMaterials, setHistoryMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lecturerModalId, setLecturerModalId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [favRes, histRes]: [any, any] = await Promise.all([
          axiosClient.get('/materials?limit=50'),
          axiosClient.get('/materials/history/me?limit=15'),
        ]);

        if (favRes.success) {
          const favs = (favRes.data.items || []).filter((m: Material) => m.is_favorite);
          setFavoriteMaterials(favs);
        }
        if (histRes.success && histRes.data) {
          setHistoryMaterials(histRes.data.items || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Student Welcome Header */}
      <div className="p-6 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 text-white rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-blue-500/30 text-blue-300 rounded text-xs font-bold border border-blue-400/30">
              Sinh viên chính quy
            </span>
            {user?.user_code && (
              <span className="text-xs font-mono text-slate-400">• MSSV: {user.user_code}</span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold mt-2">
            Góc Học Tập Cá Nhân — <span className="text-blue-300">{user?.full_name || 'Sinh viên'}</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Khoa: {user?.faculty || 'Công nghệ Thông tin'} · Theo dõi tiến trình đọc bài giảng và lưu trữ học liệu yêu thích
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur p-1 rounded-xl border border-white/20">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Lịch sử học tập ({historyMaterials.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'favorites' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Yêu thích ({favoriteMaterials.length})
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Bài Giảng Đã Xem Gần Đây</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{historyMaterials.length}</h3>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 border border-rose-100">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Học Liệu Đã Lưu Yêu Thích</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{favoriteMaterials.length}</h3>
          </div>
        </div>
      </div>

      {/* Tab Content 1: Reading History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-extrabold text-slate-900">Nhật Ký Đọc Bài Giảng Gần Đây</h2>
          </div>

          {historyMaterials.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200/80 text-center text-slate-400 text-xs">
              Bạn chưa mở xem bài giảng nào. Vui lòng khám phá Kho học liệu để truy cập tài liệu.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historyMaterials.map((h) => (
                <a
                  key={h.id}
                  href={`/materials/${h.id}`}
                  className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex items-center space-x-4 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:scale-105 transition-transform border border-blue-100">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-slate-900 text-xs truncate group-hover:text-blue-600 transition-colors">
                      {h.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {h.subject} · {h.author_name}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                      Lần xem gần nhất: {new Date(h.viewed_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500 fill-current" />
            <h2 className="text-base font-extrabold text-slate-900">Danh Sách Học Liệu Yêu Thích Đã Lưu</h2>
          </div>

          {favoriteMaterials.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200/80 text-center text-slate-400 text-xs">
              Bạn chưa lưu tài liệu nào vào danh sách yêu thích. Nhấn biểu tượng trái tim trên các thẻ bài giảng để lưu lại.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {favoriteMaterials.map((m) => (
                <MaterialCard
                  key={m.id}
                  material={m}
                  onLecturerClick={(authorId) => setLecturerModalId(authorId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <LecturerProfileModal
        lecturerId={lecturerModalId}
        isOpen={lecturerModalId !== null}
        onClose={() => setLecturerModalId(null)}
      />
    </div>
  );
};
