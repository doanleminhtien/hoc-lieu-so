import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Download, FileText, Heart, Calendar, User as UserIcon, Building } from 'lucide-react';
import { Material } from '../../types';
import { Badge } from './Badge';
import axiosClient from '../../api/axiosClient';

interface MaterialCardProps {
  material: Material;
  onFavoriteToggle?: (materialId: number, isFav: boolean) => void;
  onLecturerClick?: (lecturerId: number) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onFavoriteToggle, onLecturerClick }) => {
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

  const primaryFileExt = material.files && material.files[0] ? material.files[0].file_extension.replace('.', '').toUpperCase() : 'PDF';
  const authorName = material.author?.full_name || material.author_name || 'Giảng viên';
  const facultyName = material.author?.faculty || material.faculty || 'Khoa CNTT';
  const avatarUrl = material.author?.avatar_url;
  const initial = authorName ? authorName.charAt(0).toUpperCase() : 'G';
  const formattedDate = material.created_at ? new Date(material.created_at).toLocaleDateString('vi-VN') : '';

  return (
    <Link
      to={`/materials/${material.id}`}
      className="group bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col overflow-hidden relative"
    >
      {/* Top Banner & Badges */}
      <div className="h-44 bg-gradient-to-br from-indigo-600/10 via-purple-500/5 to-slate-100 p-4 flex flex-col justify-between relative overflow-hidden">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between z-10">
          <Badge type="access" value={material.access_level} />
          
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full backdrop-blur transition-all shadow-sm ${
              isFavorite
                ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Center File Type Display */}
        <div className="flex items-center justify-center my-auto z-10">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300 border border-slate-100">
            <FileText className="w-8 h-8" />
          </div>
        </div>

        {/* Bottom Category & Extension */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium z-10">
          <span className="truncate max-w-[160px] bg-white/80 backdrop-blur px-2.5 py-1 rounded-lg text-slate-700 font-semibold border border-white">
            {material.category_name}
          </span>
          <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg font-bold text-[10px] shadow-sm">
            {primaryFileExt}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Lecturer Info Header (Requirement 1) */}
          <div
            onClick={handleAuthorClick}
            className={`flex items-center space-x-3 mb-3.5 pb-3 border-b border-slate-100 transition-colors ${
              onLecturerClick ? 'cursor-pointer hover:opacity-90' : ''
            }`}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={authorName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                {initial}
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors">
                {authorName}
              </h4>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Giảng viên · <span className="text-slate-600">{facultyName}</span>
              </p>
            </div>
          </div>

          {/* Material Title */}
          <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-1.5">
            {material.title}
          </h3>

          {/* Subject & Course Code */}
          <div className="flex items-center space-x-2 text-xs font-medium text-indigo-600 mb-2">
            <span>{material.subject}</span>
            {material.course_code && (
              <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold font-mono">
                {material.course_code}
              </span>
            )}
          </div>
        </div>

        {/* Footer: Date & View/Download Counts */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </span>

          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600 font-semibold">{material.view_count}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-indigo-600 font-bold">{material.download_count}</span>
            </span>
          </div>
        </div>

      </div>
    </Link>
  );
};
