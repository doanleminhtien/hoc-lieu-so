import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Heart,
  Clock,
  User,
  PlusCircle,
  FileCheck,
  CheckCircle,
  Users,
  ShieldAlert,
  BarChart3,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
  onOpenProfileModal?: () => void;
  onOpenCreateModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  onOpenProfileModal,
  onOpenCreateModal,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  // Hàm kiểm tra trạng thái Active chính xác theo từng Route và Query Parameter
  const isCurrent = (targetPath: string) => {
    const [targetPathname, targetQueryStr] = targetPath.split('?');
    const currentPathname = location.pathname;

    if (currentPathname !== targetPathname) {
      return false;
    }

    const currentParams = new URLSearchParams(location.search);

    // Trường hợp 1: Link mục tiêu CÓ chứa query parameter (VD: ?tab=categories, ?tab=kpi, ?status=PENDING_APPROVAL)
    if (targetQueryStr) {
      const targetParams = new URLSearchParams(targetQueryStr);
      for (const [key, value] of targetParams.entries()) {
        if (currentParams.get(key) !== value) {
          return false;
        }
      }
      return true;
    }

    // Trường hợp 2: Link mục tiêu KHÔNG CÓ query parameter (VD: /materials, /admin/dashboard)
    // Nếu trang hiện tại đang chứa bất kỳ query parameter nào (như ?tab=... hoặc ?status=...) -> Không active link gốc
    const hasTab = currentParams.has('tab');
    const hasStatus = currentParams.has('status');

    if (hasTab || hasStatus) {
      return false;
    }

    return true;
  };

  const roleName = user?.role_name || 'GUEST';

  const getRoleLabel = () => {
    switch (roleName) {
      case 'ADMIN':
        return 'Quản trị viên Hệ thống';
      case 'LECTURER':
        return 'Tiến sĩ / Giảng viên';
      case 'STUDENT':
        return 'Sinh viên chính quy';
      default:
        return 'Khách truy cập';
    }
  };

  const activeClass = 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40';
  const inactiveClass = 'hover:bg-slate-800 text-slate-300 hover:text-white';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Identity Header */}
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/60">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-900/50 flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-extrabold text-white text-base tracking-tight truncate leading-none">NTTU EduHub</h1>
            <p className="text-[11px] text-blue-400 font-medium truncate mt-1">Hệ thống Quản lý Học liệu số</p>
          </div>
        </div>

        {/* User Role Card */}
        {user ? (
          <div className="px-4 py-3 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-blue-400 font-semibold truncate mt-0.5">{getRoleLabel()}</p>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 mx-3 my-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Môi trường Học thuật</span>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded">Chính quy</span>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
          
          {/* STUDENT MENU */}
          {roleName === 'STUDENT' && (
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                KHÔNG GIAN SINH VIÊN
              </p>
              <nav className="space-y-1 text-xs font-medium">
                <Link
                  to="/student/dashboard"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/student/dashboard') ? activeClass : inactiveClass
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Tổng quan</span>
                </Link>

                <Link
                  to="/materials"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/materials') ? activeClass : inactiveClass
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Kho học liệu</span>
                </Link>

                <Link
                  to="/materials?tab=categories"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/materials?tab=categories') ? activeClass : inactiveClass
                  }`}
                >
                  <FolderTree className="w-4 h-4" />
                  <span>Danh mục ngành</span>
                </Link>

                <Link
                  to="/student/dashboard?tab=favorites"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/student/dashboard?tab=favorites') ? activeClass : inactiveClass
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Yêu thích đã lưu</span>
                </Link>

                <Link
                  to="/student/dashboard?tab=history"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/student/dashboard?tab=history') ? activeClass : inactiveClass
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Lịch sử học tập</span>
                </Link>

                {onOpenProfileModal && (
                  <button
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                      onOpenProfileModal();
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-left"
                  >
                    <User className="w-4 h-4" />
                    <span>Hồ sơ cá nhân</span>
                  </button>
                )}
              </nav>
            </div>
          )}

          {/* LECTURER MENU */}
          {roleName === 'LECTURER' && (
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                KHÔNG GIAN GIẢNG VIÊN
              </p>
              <nav className="space-y-1 text-xs font-medium">
                <Link
                  to="/lecturer/dashboard"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/lecturer/dashboard') ? activeClass : inactiveClass
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Tổng quan</span>
                </Link>

                <Link
                  to="/materials"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/materials') ? activeClass : inactiveClass
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Thư viện chung</span>
                </Link>

                <button
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                    if (onOpenCreateModal) onOpenCreateModal();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-semibold transition-all text-left border border-blue-500/30"
                >
                  <PlusCircle className="w-4 h-4 text-blue-400" />
                  <span>Tạo học liệu mới</span>
                </button>

                <Link
                  to="/lecturer/dashboard?status=PENDING_APPROVAL"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/lecturer/dashboard?status=PENDING_APPROVAL') ? activeClass : inactiveClass
                  }`}
                >
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <span>Chờ phê duyệt</span>
                </Link>

                <Link
                  to="/lecturer/dashboard?status=PUBLISHED"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/lecturer/dashboard?status=PUBLISHED') ? activeClass : inactiveClass
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Đã xuất bản</span>
                </Link>

                {onOpenProfileModal && (
                  <button
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                      onOpenProfileModal();
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-left"
                  >
                    <User className="w-4 h-4" />
                    <span>Hồ sơ giảng viên</span>
                  </button>
                )}
              </nav>
            </div>
          )}

          {/* ADMIN MENU */}
          {roleName === 'ADMIN' && (
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                QUẢN TRỊ HỆ THỐNG
              </p>
              <nav className="space-y-1 text-xs font-medium">
                <Link
                  to="/admin/dashboard"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/admin/dashboard') ? activeClass : inactiveClass
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Tổng quan hệ thống</span>
                </Link>

                <Link
                  to="/materials"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/materials') ? activeClass : inactiveClass
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Kho học liệu toàn trường</span>
                </Link>

                <Link
                  to="/admin/dashboard?tab=pending"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/admin/dashboard?tab=pending') ? activeClass : inactiveClass
                  }`}
                >
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <span>Hàng chờ phê duyệt</span>
                </Link>

                <Link
                  to="/admin/dashboard?tab=users"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/admin/dashboard?tab=users') ? activeClass : inactiveClass
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Quản lý người dùng</span>
                </Link>

                <Link
                  to="/admin/dashboard?tab=categories"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/admin/dashboard?tab=categories') ? activeClass : inactiveClass
                  }`}
                >
                  <FolderTree className="w-4 h-4" />
                  <span>Danh mục đào tạo</span>
                </Link>

                <Link
                  to="/admin/dashboard?tab=logs"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/admin/dashboard?tab=logs') ? activeClass : inactiveClass
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <span>Nhật ký bảo mật</span>
                </Link>

                <Link
                  to="/admin/dashboard?tab=kpi"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/admin/dashboard?tab=kpi') ? activeClass : inactiveClass
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Thống kê báo cáo</span>
                </Link>
              </nav>
            </div>
          )}

          {/* GUEST MENU */}
          {roleName === 'GUEST' && (
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                ĐIỀU HƯỚNG HỌC THUẬT
              </p>
              <nav className="space-y-1 text-xs font-medium">
                <Link
                  to="/"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/') ? activeClass : inactiveClass
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Tổng quan hệ thống</span>
                </Link>

                <Link
                  to="/materials"
                  onClick={onCloseMobile}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent('/materials') ? activeClass : inactiveClass
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Kho học liệu</span>
                </Link>

                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <Link
                    to="/login"
                    onClick={onCloseMobile}
                    className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập hệ thống</span>
                  </Link>

                  <Link
                    to="/register"
                    onClick={onCloseMobile}
                    className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all border border-slate-700"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Đăng ký tài khoản</span>
                  </Link>
                </div>
              </nav>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">Phiên bản 3.0</span>
            <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded text-[9px] font-mono">Academic</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Đồ án tốt nghiệp Đại học NTTU</p>
        </div>
      </aside>
    </>
  );
};