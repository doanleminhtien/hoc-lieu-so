import React from 'react';
import { AccessLevel, ApprovalStatus } from '../../types';
import { Globe, GraduationCap, ShieldCheck, Lock, FileEdit, Clock, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

interface BadgeProps {
  type: 'access' | 'status';
  value: AccessLevel | ApprovalStatus | string;
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, showIcon = true }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = value;
  let IconComponent: React.ComponentType<{ className?: string }> | null = null;

  if (type === 'access') {
    switch (value) {
      case 'PUBLIC':
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = '🔓 Công khai';
        IconComponent = Globe;
        break;
      case 'AUTHENTICATED':
        style = 'bg-blue-50 text-blue-700 border-blue-200';
        label = '🏫 Nội bộ trường';
        IconComponent = GraduationCap;
        break;
      case 'ROLE_BASED':
        style = 'bg-purple-50 text-purple-700 border-purple-200';
        label = '👥 Theo vai trò';
        IconComponent = ShieldCheck;
        break;
      case 'PRIVATE':
        style = 'bg-rose-50 text-rose-700 border-rose-200';
        label = '🔒 Riêng tư';
        IconComponent = Lock;
        break;
      default:
        label = value;
    }
  } else if (type === 'status') {
    switch (value) {
      case 'DRAFT':
        style = 'bg-slate-100 text-slate-700 border-slate-200';
        label = 'Bản nháp';
        IconComponent = FileEdit;
        break;
      case 'PENDING_APPROVAL':
        style = 'bg-amber-50 text-amber-700 border-amber-200';
        label = 'Chờ phê duyệt';
        IconComponent = Clock;
        break;
      case 'APPROVED':
        style = 'bg-teal-50 text-teal-700 border-teal-200';
        label = 'Đã phê duyệt';
        IconComponent = CheckCircle2;
        break;
      case 'REJECTED':
        style = 'bg-rose-50 text-rose-700 border-rose-200';
        label = 'Bị từ chối';
        IconComponent = AlertTriangle;
        break;
      case 'PUBLISHED':
        style = 'bg-blue-50 text-blue-700 border-blue-200';
        label = 'Đã xuất bản';
        IconComponent = Send;
        break;
      default:
        label = value;
    }
  }

  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      <span>{label}</span>
    </span>
  );
};
