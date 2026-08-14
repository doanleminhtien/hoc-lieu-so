import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogIn, AlertCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';
import { APIResponse } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res: APIResponse<{ access_token: string; refresh_token: string }> = await axiosClient.post('/auth/login', {
        email,
        password,
      });

      if (res.success && res.data) {
        await login(res.data.access_token, res.data.refresh_token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.detail || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <BookOpen className="w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Đăng Nhập Hệ Thống</h2>
          <p className="text-sm text-slate-500 mt-1">Kho Học Liệu Số Trường Đại Học</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Học tập / Công vụ</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@university.edu.vn"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{submitting ? 'Đang xác thực...' : 'Đăng nhập'}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Đăng ký Sinh viên
          </Link>
        </div>
      </div>
    </div>
  );
};
