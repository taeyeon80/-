import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, BarChart3, FileText, QrCode } from 'lucide-react';
import { QRCodeModal } from './QRCodeModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [isQrOpen, setIsQrOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Association Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#1B2A4A] flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm group-hover:bg-[#152038] transition-colors">
              KEEA
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">
                  한국전기기술인협회
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-medium rounded border border-emerald-200/60 hidden sm:inline">
                  익명보장
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-[#1B2A4A] leading-tight">
                직원 익명 설문조사
              </h1>
            </div>
          </Link>

          {/* Right Nav Links */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile QR Code Button */}
            <button
              type="button"
              onClick={() => setIsQrOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="모바일 참여 QR코드 보기"
            >
              <QrCode className="w-4 h-4 text-[#FF6B35]" />
              <span className="hidden xs:inline">모바일 QR</span>
            </button>

            <Link
              to="/"
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                !isAdmin
                  ? 'bg-[#1B2A4A]/10 text-[#1B2A4A]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">설문조사</span>
            </Link>

            <Link
              to="/admin"
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isAdmin
                  ? 'bg-[#1B2A4A] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>관리자</span>
            </Link>
          </div>
        </div>
      </header>

      <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </>
  );
};

export default Navbar;
