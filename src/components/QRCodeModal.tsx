import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Printer,
  X,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Edit2,
  RefreshCw,
} from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Default public cloud URLs provided by environment
const DEFAULT_PUBLIC_URL =
  'https://ais-pre-xhllhkrokk3yjz4he5yrfn-204250676737.asia-east1.run.app';

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Determine smart default URL:
  // If running on localhost or 127.0.0.1, mobile cannot connect to localhost, so default to the public URL!
  const getInitialUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return DEFAULT_PUBLIC_URL;
      }
      return `${window.location.origin}/`;
    }
    return DEFAULT_PUBLIC_URL;
  };

  const [surveyUrl, setSurveyUrl] = useState<string>(getInitialUrl);
  const [showCenterLogo, setShowCenterLogo] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setSurveyUrl(getInitialUrl());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const el = document.createElement('textarea');
      el.value = surveyUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPNG = () => {
    const svg = document.getElementById('survey-qrcode-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 600;
    canvas.height = 600;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 50, 50, 500, 500);

        const a = document.createElement('a');
        a.download = 'KEEA_한국전기기술인협회_직원설문_QR.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#1B2A4A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                모바일 설문 참여 QR 코드
              </h3>
              <p className="text-xs text-slate-300">
                스마트폰 카메라로 스캔하여 즉시 설문 작성
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 text-center" ref={printRef}>
          {/* Printable container header (visible on print) */}
          <div className="hidden print:block mb-4 text-center">
            <h2 className="text-xl font-bold text-[#1B2A4A]">한국전기기술인협회</h2>
            <h3 className="text-lg font-semibold text-slate-800">직원 익명 설문조사 안내</h3>
            <p className="text-xs text-slate-500 mt-1">스마트폰 기본 카메라로 아래 QR코드를 스캔하세요.</p>
          </div>

          {/* QR Code Container */}
          <div className="inline-block p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm my-2">
            <QRCodeSVG
              id="survey-qrcode-svg"
              value={surveyUrl}
              size={210}
              level="H"
              includeMargin={true}
              imageSettings={
                showCenterLogo
                  ? {
                      src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="52" height="30" viewBox="0 0 52 30"><rect width="52" height="30" rx="7" fill="%231B2A4A" stroke="%23FFFFFF" stroke-width="2"/><text x="26" y="20" font-size="12" font-weight="900" font-family="sans-serif" text-anchor="middle" fill="white" letter-spacing="1">KEEA</text></svg>',
                      x: undefined,
                      y: undefined,
                      height: 30,
                      width: 52,
                      excavate: true,
                    }
                  : undefined
              }
            />
          </div>

          {/* Toggle for Logo (KEEA 로고 / 로고 없음) */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setShowCenterLogo(true)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                showCenterLogo
                  ? 'bg-[#1B2A4A] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              KEEA 로고 표시
            </button>
            <button
              type="button"
              onClick={() => setShowCenterLogo(false)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                !showCenterLogo
                  ? 'bg-[#1B2A4A] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              로고 제거 (기본 QR)
            </button>
          </div>

          {/* Device scanning instructions */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-medium mt-3 mb-4">
            <Smartphone className="w-4 h-4 text-[#FF6B35]" />
            <span>스마트폰 기본 카메라 앱 또는 카카오톡/네이버 렌즈로 스캔</span>
          </div>

          {/* Connected URL Box */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-left text-xs mb-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">QR 접속 연결 주소</span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-[11px] text-[#FF6B35] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditing ? '완료' : '주소 변경'}</span>
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-2 mt-1.5">
                <input
                  type="url"
                  value={surveyUrl}
                  onChange={(e) => setSurveyUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSurveyUrl(DEFAULT_PUBLIC_URL)}
                    className="px-2 py-1 text-[11px] bg-slate-200 hover:bg-slate-300 rounded text-slate-700"
                  >
                    클라우드 공용 주소로 초기화
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurveyUrl(window.location.origin + '/')}
                    className="px-2 py-1 text-[11px] bg-slate-200 hover:bg-slate-300 rounded text-slate-700"
                  >
                    현재 브라우저 주소
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 mt-1">
                <p className="font-mono text-slate-700 truncate select-all">
                  {surveyUrl}
                </p>
                <a
                  href={surveyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-slate-400 hover:text-slate-600 shrink-0"
                  title="새 창에서 열기"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">복사 완료</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>주소 복사</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadPNG}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#1B2A4A]" />
              <span>QR 저장</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-[#1B2A4A] hover:bg-[#152038] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄하기</span>
            </button>
          </div>

          {/* Security note */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>모바일에서도 별도 로그인 없이 완전 익명으로 참여 가능합니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
