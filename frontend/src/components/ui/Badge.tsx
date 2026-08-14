import React from 'react';
import { AccessLevel, ApprovalStatus } from '../../types';

interface BadgeProps {
  type: 'access' | 'status';
  value: AccessLevel | ApprovalStatus | string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = value;

  if (type === 'access') {
    switch (value) {
      case 'PUBLIC':
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = 'Công khai';
        break;
      case 'AUTHENTICATED':
        style = 'bg-blue-50 text-blue-700 border-blue-200';
        label = 'Nội bộ trường';
        break;
      case 'ROLE_BASED':
        style = 'bg-purple-50 text-purple-700 border-purple-200';
        label = 'Theo vai trò';
        break;
      case 'PRIVATE':
        style = 'bg-rose-50 text-rose-700 border-rose-200';
        label = 'Riêng tư';
        break;
    }
  } else if (type === 'status') {
    switch (value) {
      case 'DRAFT':
        style = 'bg-slate-100 text-slate-600 border-slate-200';
        label = 'Bản nháp';
        break;
      case 'PENDING_APPROVAL':
        style = 'bg-amber-50 text-amber-700 border-amber-200';
        label = 'Chờ duyệt';
        break;
      case 'APPROVED':
        style = 'bg-teal-50 text-teal-700 border-teal-200';
        label = 'Đã duyệt';
        break;
      case 'REJECTED':
        style = 'bg-rose-50 text-rose-700 border-rose-200';
        label = 'Bị từ chối';
        break;
      case 'PUBLISHED':
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = 'Đã xuất bản';
        break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {label}
    </span>
  );
};
