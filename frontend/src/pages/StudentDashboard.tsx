import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/ui/Navbar';
import { Heart, Clock, BookOpen, Sparkles, Download } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Material } from '../types';
import { MaterialCard } from '../components/ui/MaterialCard';
import { LecturerProfileModal } from '../components/ui/LecturerProfileModal';

export const StudentDashboard: React.FC = () => {
  const [favoriteMaterials, setFavoriteMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [lecturerModalId, setLecturerModalId] = useState<number | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res: any = await axiosClient.get('/materials?limit=20');
        if (res.success) {
          // Filter materials marked as favorite
          const favs = res.data.items.filter((m: Material) => m.is_favorite);
          setFavoriteMaterials(favs);
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Góc Học Tập Cá Nhân (Student Portal)</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách học liệu yêu thích, tài liệu đã tải và gợi ý ôn tập</p>
        </div>

        {/* Section: Favorites */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <Heart className="w-5 h-5 text-rose-500 fill-current" />
            <h2 className="text-lg font-bold text-slate-900">Học Liệu Đã Lưu Yêu Thích ({favoriteMaterials.length})</h2>
          </div>

          {favoriteMaterials.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200/80 text-center text-slate-400 text-sm">
              Bạn chưa lưu tài liệu nào vào danh sách yêu thích. Hãy nhấn biểu tượng trái tim trên các thẻ bài giảng để lưu lại.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      </main>

      <LecturerProfileModal
        lecturerId={lecturerModalId}
        isOpen={lecturerModalId !== null}
        onClose={() => setLecturerModalId(null)}
      />
    </div>
  );
};
