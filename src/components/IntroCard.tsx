import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export const IntroCard: React.FC = () => {
  return (
    <div className="w-full mb-8">
      {/* Official Greeting Box */}
      <div className="bg-white rounded-xl border-2 border-[#1B2A4A]/25 shadow-sm p-6 sm:p-8 relative overflow-hidden transition-all duration-200 hover:shadow-md">
        {/* Subtle accent bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A] to-[#FF6B35]" />

        <div className="flex items-center gap-2 mb-4 text-[#1B2A4A] font-semibold text-sm">
          <ShieldCheck className="w-5 h-5 text-[#FF6B35]" />
          <span>감사실 안내문</span>
        </div>

        <div className="text-slate-800 leading-relaxed space-y-4 text-[15px] sm:text-base font-normal">
          <p className="font-medium text-[#1B2A4A]">
            안녕하십니까, 한국전기기술인협회 감사 박환수·박병철입니다.
          </p>

          <p className="text-slate-700">
            감사실에서는 협회 업무 환경을 점검하고 더 나은 회원 서비스를 제공하기 위해 여러분의 의견을 수렴하고자 합니다. 바쁘시더라도 협회 발전과 서비스 개선을 위해 솔직하고 소중한 의견을 나누어 주시기 바랍니다.
          </p>

          <p className="text-slate-700">
            감사합니다.
          </p>

          <div className="pt-3 text-right">
            <p className="text-[#1B2A4A] text-sm sm:text-base tracking-wide font-normal">
              [한국전기기술인협회 감사 <strong className="font-bold text-[#1B2A4A]">박환수 ‧ 박병철</strong> 드림]
            </p>
          </div>
        </div>
      </div>

      {/* Anonymity Notice below the card */}
      <div className="mt-3 px-2 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>본 설문은 익명으로 진행되며 개인을 식별할 수 있는 정보는 수집하지 않습니다.</span>
      </div>
    </div>
  );
};

export default IntroCard;
