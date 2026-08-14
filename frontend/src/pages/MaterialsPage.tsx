import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';
import { Search, Filter, BookOpen } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Material, Category, APIResponse } from '../types';
import { MaterialCard } from '../components/ui/MaterialCard';
import { LecturerProfileModal } from '../components/ui/LecturerProfileModal';

export const MaterialsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [lecturerModalId, setLecturerModalId] = useState<number | null>(null);

  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category_id') || '';
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

        const res: any = await axiosClient.get(url);
        if (res.success) {
          setMaterials(res.data.items);
          setTotal(res.data.total);
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

  const handleSortChange = (sort: string) => {
    searchParams.set('sort_by', sort);
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* Search Header */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm mb-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên tài liệu, môn học, tác giả..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <select
              value={categoryParam}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="w-full sm:w-56 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={sortByParam}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full sm:w-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="created_at">Mới nhất</option>
              <option value="downloads">Tải nhiều nhất</option>
              <option value="views">Xem nhiều nhất</option>
            </select>
          </form>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            Kho Học Liệu {categoryParam && categories.find(c => c.id.toString() === categoryParam) ? `- ${categories.find(c => c.id.toString() === categoryParam)?.name}` : ''}
          </h1>
          <span className="text-xs text-slate-500 font-medium">Tìm thấy {total} học liệu</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-400">Đang tìm kiếm học liệu...</div>
        ) : materials.length === 0 ? (
          <div className="p-16 bg-white rounded-3xl border border-slate-200/80 text-center text-slate-400">
            Không tìm thấy học liệu nào phù hợp với từ khóa của bạn.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {materials.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                onLecturerClick={(authorId) => setLecturerModalId(authorId)}
              />
            ))}
          </div>
        )}

      </main>

      <LecturerProfileModal
        lecturerId={lecturerModalId}
        isOpen={lecturerModalId !== null}
        onClose={() => setLecturerModalId(null)}
      />
    </div>
  );
};
