import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Download, FileText, Heart, Calendar, ChevronRight } from 'lucide-react';
import { Material } from '../../types';
import { Badge } from './Badge';
import { RatingStars } from './RatingStars';
import axiosClient from '../../api/axiosClient';

interface MaterialCardProps {
  material: Material;
  viewMode?: 'grid' | 'list';
  onFavoriteToggle?: (materialId: number, isFav: boolean) => void;
  onLecturerClick?: (lecturerId: number) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  viewMode = 'grid',
  onFavoriteToggle,
  onLecturerClick,
}) => {
  const [isFavorite, setIsFavorite] = React.useState(material.is_favorite || false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res: any = await axiosClient.post(`/materials/${material.id}/favorite`);
      if (res.success) {
        const nextFav = res.data.is_favorite;
        setIsFavorite(nextFav);
        if (onFavoriteToggle) onFavoriteToggle(material.id, nextFav);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    if (onLecturerClick && (material.author?.id || material.author_id)) {
      e.preventDefault();
      e.stopPropagation();
      onLecturerClick(material.author?.id || material.author_id);
    }
  };

  const primaryFileExt = material.files && material.files[0]
    ? material.files[0].file_extension.replace('.', '').toUpperCase()
    : 'PDF';
  const authorName = material.author?.full_name || material.author_name || 'Giảng viên';
  const facultyName = material.author?.faculty || material.faculty || 'Khoa Công nghệ thông tin';
  const avatarUrl = material.author?.avatar_url;
  const initial = authorName ? authorName.charAt(0).toUpperCase() : 'G';
  const formattedDate = material.created_at ? new Date(material.created_at).toLocaleDateString('vi-VN') : '';

  if (viewMode === 'list') {
    return (
      <Link
        to={`/materials/${material.id}`}
        className="group bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-start space-x-4 min-w-0 flex-1">
          {/* File Extension Box */}
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-extrabold text-xs flex flex-col items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-blue-600 mb-0.5" />
            <span className="text-[9px] font-black">{primaryFileExt}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[11px]">
                {material.category_name}
              </span>
              <Badge type="access" value={material.access_level} />
              {material.approval_status && <Badge type="status" value={material.approval_status} />}
            </div>

            <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
              {material.title}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
              <span>
                Môn: <strong className="text-slate-700">{material.subject}</strong> {material.course_code ? `(${material.course_code})` : ''}
              </span>
              <span>•</span>
              <span onClick={handleAuthorClick} className="hover:text-blue-600 transition-colors cursor-pointer">
                Giảng viên: <strong className="text-slate-800">{authorName}</strong>
              </span>
              <span>•</span>
              <span>{facultyName}</span>
            </div>
          </div>
        </div>

        {/* Right Stats & Action */}
        <div className="flex items-center space-x-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 flex-shrink-0 justify-between md:justify-end">
          <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center space-x-1" title="Lượt xem">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{material.view_count}</span>
            </span>
            <span className="flex items-center space-x-1 text-blue-600" title="Lượt tải">
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>{material.download_count}</span>
            </span>
            {formattedDate && <span className="text-[11px] text-slate-400 hidden sm:inline">{formattedDate}</span>}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-rose-600 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/materials/${material.id}`}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col overflow-hidden relative"
    >
      {/* Top Banner Header */}
      <div className="h-36 bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100/50 p-4 flex flex-col justify-between relative">
        <div className="flex items-center justify-between z-10">
          <Badge type="access" value={material.access_level} />
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full backdrop-blur transition-all shadow-xs ${
              isFavorite
                ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-center my-auto z-10">
          <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform border border-blue-100">
            <FileText className="w-7 h-7" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium z-10">
          <span className="truncate max-w-[150px] bg-white/90 backdrop-blur px-2.5 py-0.5 rounded-md text-slate-700 font-semibold border border-slate-200/60 text-[11px]">
            {material.category_name}
          </span>
          <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md font-extrabold text-[10px]">
            {primaryFileExt}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Lecturer Info Header */}
          <div
            onClick={handleAuthorClick}
            className="flex items-center space-x-2.5 mb-3 pb-2.5 border-b border-slate-100"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={authorName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate hover:text-blue-600 transition-colors">
                {authorName}
              </h4>
              <p className="text-[10px] text-slate-500 truncate">{facultyName}</p>
            </div>
          </div>

          <h3 className="font-extrabold text-slate-900 text-xs group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1.5">
            {material.title}
          </h3>

          <div className="flex items-center justify-between text-[11px] font-semibold text-blue-600 mb-2">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="truncate">{material.subject}</span>
              {material.course_code && (
                <span className="px-1 py-0.2 bg-blue-50 text-blue-700 rounded text-[9px] font-mono">
                  {material.course_code}
                </span>
              )}
            </div>
            {material.avg_rating !== undefined && material.avg_rating > 0 && (
              <RatingStars rating={material.avg_rating} size="sm" showScore={true} totalReviews={material.review_count} />
            )}
          </div>
        </div>

        {/* Footer: Date & Counters */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">{formattedDate}</span>
          </span>

          <div className="flex items-center space-x-2.5">
            <span className="flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-700 font-bold">{material.view_count}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-blue-600 font-extrabold">{material.download_count}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
