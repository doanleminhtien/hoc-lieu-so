import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, LogOut, User as UserIcon, Shield, FileText, Heart, Bell, Check, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axiosClient from '../../api/axiosClient';
import { NotificationResponse } from '../../types';
import { EditProfileModal } from './EditProfileModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 leading-tight block">HỌC LIỆU SỐ</span>
              <span className="text-xs text-indigo-600 font-medium block">Digital Learning Hub</span>
            </div>
          </Link>

          {/* Quick Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu, giáo trình, bài giảng..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/materials?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                  }
                }}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Nav Items */}
          <div className="flex items-center space-x-4">
            <Link to="/materials" className="hidden sm:inline-block text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
              Kho học liệu
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50">
                      <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">Thông báo hệ thống</span>
                        <span className="text-xs text-indigo-600 font-medium">{unreadCount} chưa đọc</span>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">Không có thông báo mới</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleMarkAsRead(n.id)}
                              className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-indigo-50/50 font-semibold' : 'text-slate-600'}`}
                            >
                              <p className="text-slate-900 font-bold mb-0.5">{n.title}</p>
                              <p className="text-slate-600 leading-snug">{n.message}</p>
                              <span className="text-[10px] text-slate-400 block mt-1">{new Date(n.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {user.role_name === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Quản trị viên</span>
                  </Link>
                )}

                {user.role_name === 'LECTURER' && (
                  <Link to="/lecturer/dashboard" className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tiến sĩ / Giảng viên</span>
                  </Link>
                )}

                {user.role_name === 'STUDENT' && (
                  <Link to="/student/dashboard" className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Sinh viên</span>
                  </Link>
                )}

                {/* Profile User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-800 hidden lg:inline-block max-w-[120px] truncate">{user.full_name}</span>
                  </button>

                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 hidden group-hover:block z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {user.role_name === 'ADMIN' ? 'Quản trị viên' : user.role_name === 'LECTURER' ? 'Tiến sĩ / Giảng viên' : 'Sinh viên'}
                      </span>
                    </div>

                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2 transition-colors mt-1"
                    >
                      <UserIcon className="w-4 h-4 text-indigo-500" />
                      <span>Hồ sơ cá nhân</span>
                    </button>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                  Đăng nhập
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};
