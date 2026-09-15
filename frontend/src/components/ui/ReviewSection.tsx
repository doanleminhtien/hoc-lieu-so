import React, { useEffect, useState } from 'react';
import { Star, Send, Trash2, Loader2, Award } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Review, RatingStats, APIResponse } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { RatingStars } from './RatingStars';

interface ReviewSectionProps {
  materialId: number;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ materialId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats>({
    average_rating: 0,
    total_reviews: 0,
    rating_counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [commentText, setCommentText] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchReviews = async () => {
    try {
      const res: APIResponse<{ items: Review[]; stats: RatingStats; user_review?: Review }> = await axiosClient.get(
        `/materials/${materialId}/reviews`
      );
      if (res.success && res.data) {
        setReviews(res.data.items || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (res.data.user_review) {
          setUserReview(res.data.user_review);
          setSelectedRating(res.data.user_review.rating);
          setCommentText(res.data.user_review.comment || '');
        }
      }
    } catch (err) {
      console.error('Lỗi nạp đánh giá:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (materialId) {
      fetchReviews();
    }
  }, [materialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để gửi đánh giá.');
      return;
    }

    setSubmitting(true);
    try {
      const res: APIResponse<{ stats: RatingStats }> = await axiosClient.post(`/materials/${materialId}/reviews`, {
        rating: selectedRating,
        comment: commentText.trim() || undefined,
      });

      if (res.success) {
        await fetchReviews();
      }
    } catch (err: any) {
      alert(err.detail || err.message || 'Không thể gửi đánh giá.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    setDeletingId(reviewId);
    try {
      const res: APIResponse = await axiosClient.delete(`/reviews/${reviewId}`);
      if (res.success) {
        setUserReview(null);
        setCommentText('');
        setSelectedRating(5);
        await fetchReviews();
      }
    } catch (err: any) {
      alert(err.detail || err.message || 'Không thể xóa đánh giá.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-200">
      <div className="flex items-center space-x-2 mb-6">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h3 className="text-lg font-bold text-slate-900">Đánh Giá & Xếp Hạng Học Liệu</h3>
      </div>

      {/* Summary Rating Banner */}
      <div className="p-6 bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-3xl border border-amber-200/80 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="text-center md:text-left flex flex-col items-center md:items-start border-b md:border-b-0 md:border-r border-amber-200/60 pb-6 md:pb-0 md:pr-6">
          <span className="text-4xl font-black text-slate-900 tracking-tight">
            {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '0.0'}
          </span>
          <div className="my-1.5">
            <RatingStars rating={stats.average_rating} size="lg" />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Dựa trên {stats.total_reviews} lượt đánh giá
          </span>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.rating_counts?.[star] || 0;
            const pct = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center space-x-3 text-xs">
                <span className="w-12 font-bold text-slate-700 flex items-center space-x-1">
                  <span>{star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-slate-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Review Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {userReview ? 'Cập nhật đánh giá của bạn' : 'Đánh giá học liệu này'}
            </span>
            <RatingStars
              rating={selectedRating}
              size="lg"
              interactive={true}
              onRatingChange={(val) => setSelectedRating(val)}
            />
          </div>

          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Chia sẻ nhận xét ngắn của bạn về chất lượng học liệu này..."
            className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all resize-none"
            maxLength={1000}
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] text-slate-400">
              {userReview ? 'Bạn đã gửi 1 đánh giá cho bài giảng này.' : 'Đánh giá giúp cải thiện chất lượng học liệu.'}
            </span>

            <div className="flex items-center space-x-2">
              {userReview && (
                <button
                  type="button"
                  onClick={() => handleDelete(userReview.id)}
                  disabled={deletingId === userReview.id}
                  className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs rounded-xl transition-all"
                >
                  Xóa đánh giá
                </button>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-amber-200 transition-all flex items-center space-x-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5" />
                    <span>{userReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {/* Reviews List */}
      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          <span>Đang nạp danh sách đánh giá...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-400 text-xs border border-dashed border-slate-200">
          Chưa có nhận xét nào. Hãy là người đầu tiên đánh giá bài giảng!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const authorName = r.user?.full_name || 'Người dùng';
            const roleName = r.user?.role_name || 'STUDENT';
            const canDelete = user && (user.role_name === 'ADMIN' || user.id === r.user_id);
            const initial = authorName.charAt(0).toUpperCase();

            return (
              <div key={r.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-start space-x-3 group">
                <div className="relative flex-shrink-0">
                  {r.user?.avatar_url ? (
                    <img src={r.user.avatar_url} alt={authorName} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center border border-amber-200">
                      {initial}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-xs">{authorName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(r.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="mt-1">
                        <RatingStars rating={r.rating} size="sm" />
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors opacity-80 group-hover:opacity-100"
                        title="Xóa nhận xét"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {r.comment && (
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                      {r.comment}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
