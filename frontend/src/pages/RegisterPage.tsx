import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { APIResponse } from '../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userCode, setUserCode] = useState('');
  const [faculty, setFaculty] = useState('Khoa Công Nghệ Thông Tin');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res: APIResponse = await axiosClient.post('/auth/register', {
        email,
        password,
        full_name: fullName,
        user_code: userCode,
        faculty
      });

      if (res.success) {
        setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng sang Đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.detail || err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <BookOpen className="w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Đăng Ký Tài Khoản Sinh Viên</h2>
          <p className="text-sm text-slate-500 mt-1">Truy cập Kho Học Liệu Số Trường Đại Học</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 text-emerald-700 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Họ và tên</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mã Sinh Viên (MSSV)</label>
              <input
                type="text"
                required
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="2200000873"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Khoa / Viện</label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
              >
                <option value="Khoa Công Nghệ Thông Tin">Khoa Công Nghệ Thông Tin</option>
                <option value="Khoa Khoa Học Dữ Liệu & AI">Khoa Khoa Học Dữ Liệu & AI</option>
                <option value="Khoa Kinh Tế Số">Khoa Kinh Tế Số</option>
                <option value="Khoa Điện Tử Viễn Thông">Khoa Điện Tử Viễn Thông</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Học tập</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu.vn"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
          >
            <UserPlus className="w-4 h-4" />
            <span>{submitting ? 'Đang đăng ký...' : 'Tạo tài khoản sinh viên'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
