import React, { useState, useMemo } from 'react';
import {
  Users,
  Activity,
  PhoneCall,
  Headphones,
  Download,
  Search,
  RefreshCw,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import type { SurveyResponseItem } from '../types';
import {
  WORKLOAD_SCORE_MAP,
  PHONE_INQUIRY_SCORE_MAP,
  PHONE_ENV_SCORE_MAP,
  MATRIX_ROWS,
} from '../types';
import { Charts } from './Charts';
import { QRCodeModal } from './QRCodeModal';

interface AdminDashboardProps {
  responses: SurveyResponseItem[];
  adminEmail: string;
  onSignOut: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  responses,
  adminEmail,
  onSignOut,
  onRefresh,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const itemsPerPage = 20;

  // Calculate KPIs
  const totalCount = responses.length;

  const avgWorkload = useMemo(() => {
    if (totalCount === 0) return 0;
    const sum = responses.reduce((acc, r) => acc + (WORKLOAD_SCORE_MAP[r.workloadLevel] || 0), 0);
    return (sum / totalCount).toFixed(2);
  }, [responses, totalCount]);

  const avgPhoneInquiry = useMemo(() => {
    if (totalCount === 0) return 0;
    const sum = responses.reduce((acc, r) => acc + (PHONE_INQUIRY_SCORE_MAP[r.phoneInquiryLevel] || 0), 0);
    return (sum / totalCount).toFixed(2);
  }, [responses, totalCount]);

  const avgPhoneEnv = useMemo(() => {
    if (totalCount === 0) return 0;
    const sum = responses.reduce((acc, r) => acc + (PHONE_ENV_SCORE_MAP[r.phoneEnvironmentLevel] || 0), 0);
    return (sum / totalCount).toFixed(2);
  }, [responses, totalCount]);

  // Filter suggestions
  const suggestionsList = useMemo(() => {
    return responses
      .filter((r) => r.suggestion && r.suggestion.trim().length > 0)
      .filter((r) => {
        if (!searchTerm.trim()) return true;
        return r.suggestion?.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [responses, searchTerm]);

  // Pagination for full response table
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return responses.slice(start, start + itemsPerPage);
  }, [responses, currentPage]);

  // CSV Export with UTF-8 BOM
  const handleExportCSV = () => {
    if (responses.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    const headers = [
      '제출일시',
      '업무부담',
      '전화문의량',
      '전화상담환경',
      '업무지연요인',
      '기타지연요인',
      '온라인전산시스템개선',
      '인력확충',
      '제도및절차간소화',
      '응대환경개선',
      '건의사항',
    ];

    const csvRows = responses.map((r) => {
      const submitted = r.submittedAtFormatted || '';
      const workload = `"${(r.workloadLevel || '').replace(/"/g, '""')}"`;
      const phoneInq = `"${(r.phoneInquiryLevel || '').replace(/"/g, '""')}"`;
      const phoneEnv = `"${(r.phoneEnvironmentLevel || '').replace(/"/g, '""')}"`;
      const delayFactors = `"${(r.delayFactors || []).join('; ').replace(/"/g, '""')}"`;
      const delayEtc = `"${(r.delayFactorEtc || '').replace(/"/g, '""')}"`;
      const sysScore = r.improvementNeeds?.system ?? '';
      const staffScore = r.improvementNeeds?.staffing ?? '';
      const procScore = r.improvementNeeds?.procedure ?? '';
      const envScore = r.improvementNeeds?.responseEnvironment ?? '';
      const suggestion = `"${(r.suggestion || '').replace(/"/g, '""')}"`;

      return [
        submitted,
        workload,
        phoneInq,
        phoneEnv,
        delayFactors,
        delayEtc,
        sysScore,
        staffScore,
        procScore,
        envScore,
        suggestion,
      ].join(',');
    });

    // UTF-8 BOM \uFEFF ensures Excel properly opens Korean characters without garbling
    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `KEEA_직원설문_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-16">
      {/* Top Navigation Bar */}
      <header className="bg-[#1B2A4A] text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-9 px-1 rounded-lg bg-[#FF6B35] flex items-center justify-center font-black text-xs text-white shadow tracking-tighter">
              KEEA
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight">
                협회 직원 설문조사 관리자 대시보드
              </h1>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                한국전기기술인협회 익명 통계 및 종합 분석 시스템
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs text-slate-300">관리자 인증</span>
              <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                {adminEmail}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsQrOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="설문 배포용 QR코드 확인 및 인쇄"
            >
              <QrCode className="w-4 h-4 text-[#FF6B35]" />
              <span className="hidden sm:inline">배포용 QR코드</span>
            </button>

            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              title="데이터 새로고침"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-lg bg-[#FF6B35] hover:bg-[#e85c28] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>CSV 내보내기</span>
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="p-2 rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-colors cursor-pointer"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Cards Row */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Responses */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  총 응답자 수
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#1B2A4A]">
                    {totalCount.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-slate-500">명</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">
                  익명 응답 100% 반영
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#1B2A4A]/5 flex items-center justify-center text-[#1B2A4A]">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Average Workload */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  평균 업무부담 수준
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-[#FF6B35]">
                    {avgWorkload}
                  </span>
                  <span className="text-xs font-medium text-slate-400">/ 5.00</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {Number(avgWorkload) >= 4
                    ? '매우 과중 상태'
                    : Number(avgWorkload) >= 3
                    ? '보통 이상 수준'
                    : '여유 있는 편'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35]">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Phone Inquiry Level */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  평균 전화문의량
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-[#1B2A4A]">
                    {avgPhoneInquiry}
                  </span>
                  <span className="text-xs font-medium text-slate-400">/ 5.00</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {Number(avgPhoneInquiry) >= 4 ? '과중한 문의량 지속' : '일반 수준'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#1B2A4A]/5 flex items-center justify-center text-[#1B2A4A]">
                <PhoneCall className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Phone Environment Level */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  전화상담환경 적정성
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-slate-800">
                    {avgPhoneEnv}
                  </span>
                  <span className="text-xs font-medium text-slate-400">/ 5.00</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {Number(avgPhoneEnv) <= 2.5 ? '환경 개선 시급' : '적정 수준 유지'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Headphones className="w-6 h-6" />
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />
              설문 문항별 통계 그래프
            </h2>
            <span className="text-xs text-slate-500">
              실시간 자동 집계 (총 {totalCount}명 응답)
            </span>
          </div>

          <Charts responses={responses} />
        </section>

        {/* Section 6: Free Suggestions View */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#FF6B35]" />
                협회 발전을 위한 건의 및 개선사항
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                직원들이 자유롭게 기재한 의견 모음 (개인 식별정보 미포함, 총 {suggestionsList.length}건)
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="건의사항 검색..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:bg-white"
              />
            </div>
          </div>

          {/* Suggestions Cards Grid */}
          <div className="mt-5 space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {suggestionsList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                {searchTerm ? '검색된 건의사항이 없습니다.' : '등록된 자유 건의사항이 없습니다.'}
              </div>
            ) : (
              suggestionsList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-slate-50/70 hover:bg-slate-100/60 transition-colors p-4 rounded-xl border border-slate-200/80 text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1B2A4A] bg-[#1B2A4A]/5 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-slate-400" />
                      제출일시: {item.submittedAtFormatted || '최근'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      익명 의견 #{idx + 1}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {item.suggestion}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section: Full Responses Table */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-lg font-bold text-[#1B2A4A]">전체 응답 상세 목록</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                최신 제출순 정렬 (페이지당 20건 표시)
              </p>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              전체 {totalCount}건 중 {(currentPage - 1) * itemsPerPage + 1}~
              {Math.min(currentPage * itemsPerPage, totalCount)}건
            </span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-3 w-14 text-center">번호</th>
                  <th className="py-3 px-3 w-36">제출일시</th>
                  <th className="py-3 px-3 w-28">업무 부담</th>
                  <th className="py-3 px-3 w-28">전화 문의량</th>
                  <th className="py-3 px-3 w-28">전화 상담 환경</th>
                  <th className="py-3 px-3">주요 지연 요인</th>
                  <th className="py-3 px-3 w-56">건의사항</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedResponses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      수집된 설문 응답이 없습니다.
                    </td>
                  </tr>
                ) : (
                  paginatedResponses.map((r, index) => {
                    const rowNumber = totalCount - ((currentPage - 1) * itemsPerPage + index);
                    return (
                      <tr key={r.id || index} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-slate-400">
                          {rowNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-xs font-mono">
                          {r.submittedAtFormatted || '-'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                              r.workloadLevel === '매우높음'
                                ? 'bg-red-50 text-red-700'
                                : r.workloadLevel === '높음'
                                ? 'bg-orange-50 text-orange-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.workloadLevel}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs text-slate-700">
                            {r.phoneInquiryLevel}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs text-slate-700">
                            {r.phoneEnvironmentLevel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600">
                          <div className="space-y-0.5">
                            {(r.delayFactors || []).map((f, i) => (
                              <div key={i} className="truncate max-w-[240px]">
                                • {f}
                              </div>
                            ))}
                            {r.delayFactorEtc && (
                              <div className="text-amber-700 font-medium">
                                (기타: {r.delayFactorEtc})
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600">
                          <div className="truncate max-w-[200px]" title={r.suggestion || ''}>
                            {r.suggestion || <span className="text-slate-300">-</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                페이지 {currentPage} / {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-1.5 rounded border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-[#1B2A4A] text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1.5 rounded border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </div>
  );
};

export default AdminDashboard;
