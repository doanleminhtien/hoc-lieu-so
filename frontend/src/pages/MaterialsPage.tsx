import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, LayoutList, LayoutGrid, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Material, Category } from '../types';
import { MaterialCard } from '../components/ui/MaterialCard';
import { LecturerProfileModal } from '../components/ui/LecturerProfileModal';

export const MaterialsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [lecturerModalId, setLecturerModalId] = useState<number | null>(null);

  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category_id') || '';
  const accessParam = searchParams.get('access_level') || '';
  const sortByParam = searchParams.get('sort_by') || 'created_at';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [searchQuery, setSearchQuery] = useState(qParam);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res: any = await axiosClient.get('/categories');
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        let url = `/materials?page=${pageParam}&limit=12&sort_by=${sortByParam}`;
        if (qParam) url += `&q=${encodeURIComponent(qParam)}`;
        if (categoryParam) url += `&category_id=${categoryParam}`;
        if (accessParam) url += `&access_level=${accessParam}`;

        const res: any = await axiosClient.get(url);
        if (res.success) {
          setMaterials(res.data.items || []);
          setTotal(res.data.total || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchParams.set('q', searchQuery);
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handleCategorySelect = (catId: string) => {
    if (catId) {
      searchParams.set('category_id', catId);
    } else {
      searchParams.delete('category_id');
    }
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handleAccessLevelSelect = (access: string) => {
    if (access) {
      searchParams.set('access_level', access);
    } else {
      searchParams.delete('access_level');
    }
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handleSortChange = (sort: string) => {
    searchParams.set('sort_by', sort);
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const totalPages = Math.ceil(total / 12);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      searchParams.set('page', newPage.toString());
      setSearchParams(searchParams);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Kho Học Liệu Số (Academic Catalog)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu thư viện giáo trình, bài giảng, đề thi và tài liệu học tập chính quy
          </p>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Hiển thị dạng Danh sách / Bảng"
          >
            <LayoutList className="w-4 h-4" />
            <span>Danh sách</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Hiển thị dạng Lưới Card"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Lưới</span>
          </button>
        </div>
      </div>

      {/* Filter Workspace Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên tài liệu, môn học..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Category Select */}
          <select
            value={categoryParam}
            onChange={(e) => handleCategorySelect(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Tất cả danh mục chuyên ngành</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Access Level Select */}
          <select
            value={accessParam}
            onChange={(e) => handleAccessLevelSelect(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Tất cả quyền truy cập</option>
            <option value="PUBLIC">🔓 Công khai</option>
            <option value="AUTHENTICATED">🏫 Nội bộ trường</option>
            <option value="ROLE_BASED">👥 Theo vai trò</option>
          </select>

          {/* Sort Select */}
          <select
            value={sortByParam}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="created_at">Mới nhất</option>
            <option value="downloads">Tải nhiều nhất</option>
            <option value="views">Xem nhiều nhất</option>
          </select>
        </form>
      </div>

      {/* Results Meta Info */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
        <span>Tìm thấy <strong className="text-slate-900 font-extrabold">{total}</strong> học liệu phù hợp</span>
        {totalPages > 1 && (
          <span>Trang {pageParam} / {totalPages}</span>
        )}
      </div>

      {/* Materials List / Grid Container */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs">Đang nạp danh sách học liệu...</div>
      ) : materials.length === 0 ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200/80 text-center text-slate-400 text-xs">
          Không tìm thấy học liệu nào phù hợp với bộ lọc của bạn.
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {materials.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              viewMode="list"
              onLecturerClick={(authorId) => setLecturerModalId(authorId)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {materials.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              viewMode="grid"
              onLecturerClick={(authorId) => setLecturerModalId(authorId)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <button
            onClick={() => handlePageChange(pageParam - 1)}
            disabled={pageParam <= 1}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl disabled:opacity-50 flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trang trước</span>
          </button>
          
          <span className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">
            {pageParam} / {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pageParam + 1)}
            disabled={pageParam >= totalPages}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl disabled:opacity-50 flex items-center space-x-1"
          >
            <span>Trang sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
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
