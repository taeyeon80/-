import React from 'react';
import { CheckCircle2, ShieldCheck, Home } from 'lucide-react';

interface CompletionViewProps {
  onReset: () => void;
  submittedAtFormatted?: string;
}

export const CompletionView: React.FC<CompletionViewProps> = ({ onReset, submittedAtFormatted }) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-[#1B2A4A]/20 shadow-md p-8 sm:p-12 text-center max-w-xl mx-auto my-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Big Check Icon */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-inner">
        <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-600 animate-pulse" />
      </div>

      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#1B2A4A]/10 text-[#1B2A4A] mb-3">
        설문 접수 완료
      </span>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B2A4A] mb-3 tracking-tight">
        설문에 참여해 주셔서 감사합니다.
      </h2>

      <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-6">
        소중한 의견은 협회 업무환경 및 회원 서비스 개선을 위한 자료로 활용됩니다.
      </p>

      {/* Anonymity Assurance Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 text-left text-xs sm:text-sm text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800">
            본 설문은 익명으로 안전하게 저장되었습니다.
          </p>
          <p className="text-slate-500 mt-0.5">
            이름, 사번, 연락처, IP 주소 등 개인 식별 정보는 일체 수집 및 보관되지 않으므로 안심하시기 바랍니다.
          </p>
          {submittedAtFormatted && (
            <p className="text-slate-400 text-xs mt-1">
              제출 일시: {submittedAtFormatted}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1B2A4A] hover:bg-[#152038] text-white font-semibold text-sm transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>처음 화면으로</span>
        </button>
      </div>
    </div>
  );
};

export default CompletionView;
