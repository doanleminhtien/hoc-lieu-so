import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, Trash2, User as UserIcon, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Comment, APIResponse } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface CommentSectionProps {
  materialId: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ materialId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchComments = async () => {
    try {
      const res: APIResponse<{ items: Comment[]; total: number }> = await axiosClient.get(`/materials/${materialId}/comments`);
      if (res.success && res.data) {
        setComments(res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Lỗi nạp bình luận:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (materialId) {
      fetchComments();
    }
  }, [materialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    if (!user) {
      alert('Vui lòng đăng nhập để gửi bình luận.');
      return;
    }

    setSubmitting(true);
    try {
      const res: APIResponse<Comment> = await axiosClient.post(`/materials/${materialId}/comments`, {
        content: newComment.trim(),
      });
      if (res.success && res.data) {
        setComments((prev) => [res.data, ...prev]);
        setTotal((prev) => prev + 1);
        setNewComment('');
      }
    } catch (err: any) {
      alert(err.detail || err.message || 'Không thể gửi bình luận.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

    setDeletingId(commentId);
    try {
      const res: APIResponse = await axiosClient.delete(`/comments/${commentId}`);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      alert(err.detail || err.message || 'Không thể xóa bình luận.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-200">
      <div className="flex items-center space-x-2 mb-6">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="text-base font-extrabold text-slate-900">Thảo Luận & Trao Đổi ({total})</h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết ý kiến hoặc câu hỏi của bạn về bài giảng này..."
              className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-xs text-slate-800 placeholder-slate-400 resize-none font-medium"
              maxLength={1000}
            />
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-2">
              <span className="text-[11px] text-slate-400">
                {newComment.length}/1000 ký tự
              </span>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi bình luận</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl mb-8 flex items-center justify-between font-semibold">
          <span>Bạn cần đăng nhập để tham gia thảo luận về bài giảng này.</span>
          <a href="/login" className="font-bold underline hover:text-amber-900">Đăng nhập ngay</a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Đang nạp thảo luận...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-400 text-xs border border-dashed border-slate-200">
          Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi hoặc gửi nhận xét!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => {
            const authorName = c.user?.full_name || 'Người dùng';
            const roleName = c.user?.role_name || 'STUDENT';
            const canDelete = user && (user.role_name === 'ADMIN' || user.id === c.user_id);
            const initial = authorName.charAt(0).toUpperCase();

            return (
              <div key={c.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-start space-x-3 group">
                <div className="relative flex-shrink-0">
                  {c.user?.avatar_url ? (
                    <img src={c.user.avatar_url} alt={authorName} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {initial}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 text-xs">{authorName}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        roleName === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : roleName === 'LECTURER'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {roleName === 'ADMIN' ? 'Quản trị viên' : roleName === 'LECTURER' ? 'Giảng viên' : 'Sinh viên'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors opacity-80 group-hover:opacity-100"
                        title="Xóa bình luận"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed whitespace-pre-line font-medium">
                    {c.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
