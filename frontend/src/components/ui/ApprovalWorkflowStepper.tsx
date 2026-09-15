import React from 'react';
import { ApprovalStatus } from '../../types';
import { Check, Clock, FileEdit, XCircle, Send, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ApprovalWorkflowStepperProps {
  status: ApprovalStatus;
  rejectionReason?: string;
  onResubmit?: () => void;
  onEdit?: () => void;
  mode?: 'horizontal' | 'detailed';
}

export const ApprovalWorkflowStepper: React.FC<ApprovalWorkflowStepperProps> = ({
  status,
  rejectionReason,
  onResubmit,
  onEdit,
  mode = 'horizontal',
}) => {
  // Exact approval lifecycle steps matching backend enums
  const steps = [
    { key: 'DRAFT', label: 'Bản nháp', subtext: 'Giảng viên đã khởi tạo' },
    { key: 'PENDING_APPROVAL', label: 'Đã gửi phê duyệt', subtext: 'Đang chờ Quản trị viên thẩm định' },
    { key: 'APPROVED', label: 'Đã phê duyệt', subtext: 'Đã thông qua chất lượng' },
    { key: 'PUBLISHED', label: 'Đã xuất bản', subtext: 'Hiển thị trên thư viện trường' },
  ];

  const getStepIndex = (st: ApprovalStatus) => {
    switch (st) {
      case 'DRAFT':
        return 0;
      case 'PENDING_APPROVAL':
        return 1;
      case 'APPROVED':
        return 2;
      case 'PUBLISHED':
        return 3;
      case 'REJECTED':
        return 1; // Rejected during approval phase
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  // If status is REJECTED, show special rejection workflow timeline
  if (status === 'REJECTED') {
    return (
      <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-5 mb-6 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-extrabold text-rose-900 text-sm">Quy trình phê duyệt học liệu: BỊ TỪ CHỐI (Rejected)</h4>
                <span className="px-2 py-0.5 bg-rose-200 text-rose-800 text-[10px] font-bold rounded uppercase">
                  Cần chỉnh sửa & nộp lại
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed font-medium">
                <strong>Lý do từ Quản trị viên:</strong> {rejectionReason || 'Vui lòng kiểm tra lại quy chuẩn tài liệu và thông tin môn học trước khi gửi lại.'}
              </p>
            </div>
          </div>

          {(onEdit || onResubmit) && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs rounded-xl transition-all"
                >
                  Chỉnh sửa học liệu
                </button>
              )}
              {onResubmit && (
                <button
                  onClick={onResubmit}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi duyệt lại</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Detailed Timeline for Rejection Flow */}
        <div className="mt-4 pt-4 border-t border-rose-200/80 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">✓</span>
            <span>1. Khởi tạo bản nháp</span>
          </div>
          <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">✓</span>
            <span>2. Đã gửi phê duyệt</span>
          </div>
          <div className="flex items-center space-x-2 text-rose-800 font-bold bg-rose-200/70 p-1.5 rounded-lg border border-rose-300">
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black">✕</span>
            <span>3. Quản trị từ chối</span>
          </div>
          <div className="flex items-center space-x-2 text-rose-500 font-medium">
            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-400 flex items-center justify-center text-[10px] font-black">○</span>
            <span>4. Chỉnh sửa & Nộp lại</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 mb-6 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Quy Trình Phê Duyệt Học Liệu (Academic Workflow)
          </h4>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Trạng thái hiện tại: <strong className="text-blue-600 font-extrabold">{steps[currentIndex]?.label}</strong>
        </span>
      </div>

      {/* Stepper Steps Bar */}
      <div className="relative flex items-center justify-between px-2">
        {/* Connecting line */}
        <div className="absolute top-4 left-8 right-8 h-1 bg-slate-100 -z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          let stepMarker = <span className="text-[11px] font-bold">○</span>;
          if (isDone) {
            stepMarker = <span className="text-[11px] font-black">✓</span>;
          } else if (isCurrent) {
            stepMarker = <span className="text-[11px] font-black">●</span>;
          }

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center text-center max-w-[140px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                  isDone
                    ? 'bg-blue-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {stepMarker}
              </div>

              <span
                className={`text-xs font-bold mt-2 leading-tight ${
                  isCurrent ? 'text-blue-700' : isDone ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 hidden sm:inline-block">
                {step.subtext}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
