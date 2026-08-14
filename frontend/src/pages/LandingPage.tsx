import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, Download, Users, CheckCircle2, TrendingUp, Sparkles, Filter, ChevronRight } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Material, Category, APIResponse } from '../types';
import { MaterialCard } from '../components/ui/MaterialCard';
import { Navbar } from '../components/ui/Navbar';
import { LecturerProfileModal } from '../components/ui/LecturerProfileModal';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularMaterials, setPopularMaterials] = useState<Material[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [lecturerModalId, setLecturerModalId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, popRes, recRes]: any = await Promise.all([
          axiosClient.get('/categories'),
          axiosClient.get('/materials?sort_by=downloads&limit=4'),
          axiosClient.get('/materials?sort_by=created_at&limit=8')
        ]);
        if (catRes.success) setCategories(catRes.data);
        if (popRes.success) setPopularMaterials(popRes.data.items);
        if (recRes.success) setRecentMaterials(recRes.data.items);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/materials?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-indigo-900 via-indigo-800 to-slate-900 text-white overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur border border-white/20 rounded-full text-xs font-semibold text-indigo-200 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Nền tảng Quản lý & Chia sẻ Học liệu Số Đại học</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Kho Học Liệu Số – <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-indigo-200 to-white">Kết Nối Tri Thức</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Tra cứu giáo trình, bài giảng, đề thi và tài liệu học tập chính quy được thẩm định bởi giảng viên. Tìm kiếm dễ dàng, tải về an toàn.
          </p>

          {/* Large Hero Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex items-center space-x-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 ml-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên tài liệu, môn học, mã HP (e.g. Kiến trúc phần mềm)..."
                className="w-full pl-3 pr-4 py-3 text-slate-800 focus:outline-none text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center space-x-2 flex-shrink-0"
            >
              <span>Tìm kiếm</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Category Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-300">
            <span className="text-slate-400">Danh mục phổ biến:</span>
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                to={`/materials?category_id=${c.id}`}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg transition-all"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Danh Mục Chuyên Ngành</h2>
            <p className="text-sm text-slate-500 mt-1">Phân loại học liệu theo các ngành đào tạo chính quy</p>
          </div>
          <Link to="/materials" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/materials?category_id=${cat.id}`}
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">{cat.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cat.description || 'Học liệu chuyên ngành'}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Materials Section */}
      <section className="py-12 bg-slate-100/70 border-y border-slate-200/60 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Học Liệu Nổi Bật</h2>
                <p className="text-sm text-slate-500">Được tải về và xem nhiều nhất tuần qua</p>
              </div>
            </div>
            <Link to="/materials?sort_by=downloads" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
              <span>Xem thêm</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularMaterials.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                onLecturerClick={(authorId) => setLecturerModalId(authorId)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Materials */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Học Liệu Mới Cập Nhật</h2>
            <p className="text-sm text-slate-500">Tài liệu và bài giảng mới phát hành</p>
          </div>
          <Link to="/materials" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
            <span>Tất cả học liệu</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recentMaterials.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              onLecturerClick={(authorId) => setLecturerModalId(authorId)}
            />
          ))}
        </div>
      </section>

      <LecturerProfileModal
        lecturerId={lecturerModalId}
        isOpen={lecturerModalId !== null}
        onClose={() => setLecturerModalId(null)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 text-white mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">HỌC LIỆU SỐ</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hệ thống Quản lý và Khai thác Học liệu Số dành cho môi trường đào tạo đại học. Đáp ứng tiêu chuẩn kiểm định chất lượng giáo dục.
            </p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Nhóm Sinh Viên Thực Hiện</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>Nguyễn Mai Minh Đạt - MSSV: 2200000873</li>
              <li>Nguyễn Anh Khoa - MSSV: 2200004825</li>
              <li>Phạm Nguyễn Nhật Sơn - MSSV: 2200006700</li>
              <li>Phan Đức Anh - MSSV: 2200004289</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Đồ Án Tốt Nghiệp</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Giảng viên hướng dẫn: TS. Nguyễn Văn Hải
            </p>
            <p className="text-xs text-indigo-400 font-mono">
              FastAPI + React 19 + PostgreSQL Architecture
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © 2026 Digital Learning Material Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
