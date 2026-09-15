import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, Download, Users, TrendingUp, FolderTree, ChevronRight, FileText, Clock, ShieldCheck, GraduationCap, PlusCircle, Eye } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Material, Category } from '../types';
import { Badge } from '../components/ui/Badge';
import { LecturerProfileModal } from '../components/ui/LecturerProfileModal';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<Material[]>([]);
  const [totalMaterials, setTotalMaterials] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [lecturerModalId, setLecturerModalId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, recRes, pendingRes]: any = await Promise.all([
          axiosClient.get('/categories'),
          axiosClient.get('/materials?sort_by=created_at&limit=10'),
          axiosClient.get('/materials?approval_status=PENDING_APPROVAL&limit=1').catch(() => null)
        ]);
        if (catRes.success) setCategories(catRes.data || []);
        if (recRes.success) {
          setRecentMaterials(recRes.data.items || []);
          setTotalMaterials(recRes.data.total || recRes.data.items?.length || 0);
        }
        if (pendingRes && pendingRes.success) {
          setPendingCount(pendingRes.data.total || 0);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu tổng quan hệ thống:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/materials?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* System Overview Workspace Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 font-bold rounded text-[11px]">
              NTTU EduHub Workspace
            </span>
            {user && (
              <span className="text-xs text-slate-500 font-medium">
                • Người dùng: <strong className="text-slate-800">{user.full_name}</strong> ({user.role_name === 'ADMIN' ? 'Quản trị viên' : user.role_name === 'LECTURER' ? 'Giảng viên' : 'Sinh viên'})
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tổng Quan Hệ Thống</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảng điều khiển giám sát quy trình quản lý, phê duyệt và phân phối học liệu số đại học
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {user?.role_name === 'LECTURER' && (
            <Link
              to="/lecturer/dashboard"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo học liệu mới</span>
            </Link>
          )}

          {user?.role_name === 'ADMIN' && (
            <Link
              to="/admin/dashboard?tab=pending"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>Duyệt hàng chờ ({pendingCount})</span>
            </Link>
          )}

          <Link
            to="/materials"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Kho học liệu</span>
          </Link>
        </div>
      </div>

      {/* System KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100 font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Tổng Học Liệu</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{loading ? '...' : totalMaterials}</h3>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100 font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-amber-600">Chờ Phê Duyệt</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">{loading ? '...' : pendingCount}</h3>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100 font-bold">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Danh Mục Đào Tạo</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{loading ? '...' : categories.length}</h3>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-100 font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Tổng Lượt Tải</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {loading ? '...' : recentMaterials.reduce((acc, m) => acc + (m.download_count || 0), 0)}
            </h3>
          </div>
        </div>
      </div>

      {/* Global Academic Search Bar */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên bài giảng, giáo trình, môn học, mã HP..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 flex-shrink-0"
          >
            <span>Tìm kiếm dữ liệu</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        {categories.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Danh mục ngành:</span>
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                to={`/materials?category_id=${cat.id}`}
                className="px-2.5 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-md text-slate-600 font-semibold transition-all border border-slate-200/60 text-[11px]"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Main Data Table Workspace: Recent Materials */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Học Liệu Mới Cập Nhật & Quản Lý</h3>
            <p className="text-xs text-slate-500 mt-0.5">Danh sách các bài giảng và giáo trình vừa được phát hành trong hệ thống</p>
          </div>
          <Link to="/materials" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
            <span>Xem toàn bộ thư viện</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Đang nạp dữ liệu hệ thống...</div>
        ) : recentMaterials.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">Chưa có dữ liệu học liệu.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 font-bold text-[11px]">
                  <th className="p-4">Tên bài giảng / Học liệu</th>
                  <th className="p-4">Môn học & Mã HP</th>
                  <th className="p-4">Giảng viên phụ trách</th>
                  <th className="p-4">Quyền truy cập</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Xem / Tải</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentMaterials.map((m) => {
                  const authorName = m.author?.full_name || m.author_name || 'Giảng viên';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900 max-w-xs">
                        <Link to={`/materials/${m.id}`} className="hover:text-blue-600 transition-colors line-clamp-1">
                          {m.title}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                          {m.category_name}
                        </span>
                      </td>

                      <td className="p-4 font-medium">
                        <p className="text-slate-800 font-semibold">{m.subject}</p>
                        {m.course_code && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded inline-block mt-0.5">
                            {m.course_code}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => setLecturerModalId(m.author?.id || m.author_id)}
                          className="font-bold text-slate-800 hover:text-blue-600 transition-colors text-left"
                        >
                          {authorName}
                        </button>
                      </td>

                      <td className="p-4">
                        <Badge type="access" value={m.access_level} />
                      </td>

                      <td className="p-4">
                        <Badge type="status" value={m.approval_status} />
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center space-x-2 text-[11px] font-semibold text-slate-500">
                          <span className="flex items-center space-x-1" title="Lượt xem">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>{m.view_count}</span>
                          </span>
                          <span className="flex items-center space-x-1 text-blue-600 font-bold" title="Lượt tải">
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            <span>{m.download_count}</span>
                          </span>
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          to={`/materials/${m.id}`}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1"
                        >
                          <span>Chi tiết</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LecturerProfileModal
        lecturerId={lecturerModalId}
        isOpen={lecturerModalId !== null}
        onClose={() => setLecturerModalId(null)}
      />
    </div>
  );
};
