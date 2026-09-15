import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, User as UserIcon, LogOut, Menu, Shield, GraduationCap, FileText, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axiosClient from '../../api/axiosClient';
import { NotificationResponse } from '../../types';

interface TopCommandBarProps {
  onToggleSidebar: () => void;
  onOpenProfileModal: () => void;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  onToggleSidebar,
  onOpenProfileModal,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res: any = await axiosClient.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.items);
        setUnreadCount(res.data.unread_count);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (notifId: number) => {
    try {
      await axiosClient.put(`/notifications/${notifId}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/materials?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const getRoleBadge = (roleName?: string) => {
    switch (roleName) {
      case 'ADMIN':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold rounded text-[10px]">Quản trị viên</span>;
      case 'LECTURER':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded text-[10px]">Giảng viên</span>;
      case 'STUDENT':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded text-[10px]">Sinh viên</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs h-16 flex items-center justify-between px-4 sm:px-6">
      
      {/* Left: Mobile Toggle & Brand context */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden transition-colors"
          title="Mở menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="font-extrabold text-slate-900 text-sm tracking-tight">NTTU EduHub</span>
          <span className="text-[11px] text-slate-500 font-medium">Hệ thống Quản lý Học liệu số</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm giáo trình, bài giảng, đề thi..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
          />
        </div>
      </form>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center space-x-3">
        {user ? (
          <>
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserDropdown(false);
                }}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors relative"
                title="Thông báo hệ thống"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Thông báo hệ thống</span>
                    <span className="text-[11px] text-blue-600 font-semibold">{unreadCount} chưa đọc</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">Không có thông báo mới</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.is_read ? 'bg-blue-50/50 font-semibold' : 'text-slate-600'
                          }`}
                        >
                          <p className="text-slate-900 font-bold mb-0.5">{n.title}</p>
                          <p className="text-slate-600 leading-snug text-[11px]">{n.message}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(n.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 max-w-[130px] truncate leading-tight">
                    {user.full_name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {user.role_name === 'ADMIN' ? 'Quản trị viên' : user.role_name === 'LECTURER' ? 'Giảng viên' : 'Sinh viên'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                    <div className="mt-1.5">{getRoleBadge(user.role_name)}</div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenProfileModal();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2 transition-colors mt-1"
                  >
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    <span>Chỉnh sửa hồ sơ cá nhân</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất khỏi hệ thống</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>

    </header>
  );
};
