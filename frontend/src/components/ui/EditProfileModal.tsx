import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Building, IdCard, Shield, Save, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axiosClient from '../../api/axiosClient';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, fetchProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [userCode, setUserCode] = useState('');
  const [faculty, setFaculty] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setUserCode(user.user_code || '');
      setFaculty(user.faculty || '');
      setMessage(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setMessage({ type: 'error', text: 'Họ và tên không được để trống.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res: any = await axiosClient.put('/auth/profile', {
        full_name: fullName.trim(),
        user_code: userCode.trim(),
        faculty: faculty.trim(),
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin cá nhân thành công!' });
        await fetchProfile();
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.detail || err.message || 'Không thể cập nhật thông tin cá nhân.',
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
        return 'Quản trị viên Hệ thống';
      case 'LECTURER':
        return 'Tiến sĩ / Giảng viên';
      case 'STUDENT':
        return 'Sinh viên';
      default:
        return roleName;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Chỉnh Sửa Hồ Sơ Cá Nhân</h3>
              <p className="text-xs text-slate-500">Cập nhật thông tin tài khoản người dùng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {message && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2.5 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Email (Read-only) */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Email Hệ Thống (Không thể thay đổi)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Vai Trò Người Dùng
            </label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
              <input
                type="text"
                disabled
                value={getRoleLabel(user.role_name)}
                className="w-full pl-10 pr-4 py-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Họ và Tên <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên đầy đủ..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* User Code (MSSV / Mã Giảng viên) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mã Định Danh (MSSV / Mã Cán bộ / Mã Giảng viên)
            </label>
            <div className="relative">
              <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="VD: SV2200004825 hoặc GV202601"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Faculty / Unit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Khoa / Phụ Trách / Đơn Vị Đào Tạo
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="VD: Khoa Công Nghệ Thông Tin"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-200 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
