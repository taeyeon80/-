import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import type { SurveyResponseItem } from '../types';
import {
  WORKLOAD_OPTIONS,
  PHONE_INQUIRY_OPTIONS,
  PHONE_ENVIRONMENT_OPTIONS,
  DELAY_FACTOR_OPTIONS,
  MATRIX_ROWS,
} from '../types';

interface ChartsProps {
  responses: SurveyResponseItem[];
}

export const Charts: React.FC<ChartsProps> = ({ responses }) => {
  const total = responses.length;

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        집계할 설문 응답 데이터가 아직 없습니다.
      </div>
    );
  }

  // 1. Workload Level distribution
  const workloadCounts: Record<string, number> = {};
  WORKLOAD_OPTIONS.forEach((opt) => (workloadCounts[opt] = 0));
  responses.forEach((r) => {
    if (r.workloadLevel && workloadCounts[r.workloadLevel] !== undefined) {
      workloadCounts[r.workloadLevel]++;
    }
  });
  const workloadData = WORKLOAD_OPTIONS.map((opt) => ({
    name: opt,
    count: workloadCounts[opt],
    percentage: ((workloadCounts[opt] / total) * 100).toFixed(1),
  }));

  // 2. Phone Inquiry Level distribution
  const phoneInquiryCounts: Record<string, number> = {};
  PHONE_INQUIRY_OPTIONS.forEach((opt) => (phoneInquiryCounts[opt] = 0));
  responses.forEach((r) => {
    if (r.phoneInquiryLevel && phoneInquiryCounts[r.phoneInquiryLevel] !== undefined) {
      phoneInquiryCounts[r.phoneInquiryLevel]++;
    }
  });
  const phoneInquiryData = PHONE_INQUIRY_OPTIONS.map((opt) => ({
    name: opt,
    count: phoneInquiryCounts[opt],
    percentage: ((phoneInquiryCounts[opt] / total) * 100).toFixed(1),
  }));

  // 3. Phone Environment Level distribution
  const phoneEnvCounts: Record<string, number> = {};
  PHONE_ENVIRONMENT_OPTIONS.forEach((opt) => (phoneEnvCounts[opt] = 0));
  responses.forEach((r) => {
    if (r.phoneEnvironmentLevel && phoneEnvCounts[r.phoneEnvironmentLevel] !== undefined) {
      phoneEnvCounts[r.phoneEnvironmentLevel]++;
    }
  });
  const phoneEnvData = PHONE_ENVIRONMENT_OPTIONS.map((opt) => ({
    name: opt,
    count: phoneEnvCounts[opt],
    percentage: ((phoneEnvCounts[opt] / total) * 100).toFixed(1),
  }));

  // 4. Delay Factors distribution (multiple choices)
  const delayCounts: Record<string, number> = {};
  DELAY_FACTOR_OPTIONS.forEach((opt) => (delayCounts[opt] = 0));
  responses.forEach((r) => {
    if (Array.isArray(r.delayFactors)) {
      r.delayFactors.forEach((factor) => {
        if (delayCounts[factor] !== undefined) {
          delayCounts[factor]++;
        } else {
          delayCounts['라. 기타'] = (delayCounts['라. 기타'] || 0) + 1;
        }
      });
    }
  });
  const delayData = DELAY_FACTOR_OPTIONS.map((opt) => {
    const shortLabel = opt.replace(/^[가-라]\.\s*/, '');
    return {
      fullName: opt,
      name: shortLabel.length > 14 ? shortLabel.slice(0, 14) + '...' : shortLabel,
      count: delayCounts[opt] || 0,
      percentage: total > 0 ? (((delayCounts[opt] || 0) / total) * 100).toFixed(1) : '0',
    };
  });

  // 5. Improvement Needs (Average score out of 4)
  const improvementAverages = MATRIX_ROWS.map((row) => {
    let sum = 0;
    let validCount = 0;
    responses.forEach((r) => {
      const score = r.improvementNeeds?.[row.key];
      if (typeof score === 'number' && score >= 1 && score <= 4) {
        sum += score;
        validCount++;
      }
    });
    const avg = validCount > 0 ? parseFloat((sum / validCount).toFixed(2)) : 0;
    return {
      key: row.key,
      name: row.title,
      score: avg,
      max: 4.0,
      sub: row.desc,
    };
  });

  // Color schemes
  const NAVY = '#1B2A4A';
  const ORANGE = '#FF6B35';
  const SLATE = '#64748B';
  const LIGHT_BLUE = '#3B82F6';
  const TEAL = '#0D9488';
  const PIE_COLORS = ['#EF4444', '#F97316', '#EAB308', '#3B82F6', '#10B981'];

  return (
    <div className="space-y-8">
      {/* Grid of Chart 1 & Chart 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. 업무 부담 수준 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-[#1B2A4A] text-base">
                1. 업무 부담 수준 분포
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                민원 업무 및 회원 응대 시 체감 부담
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              단일선택
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}명`, '응답수']}
                  labelFormatter={(name) => `업무 부담: ${name}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill={NAVY} radius={[4, 4, 0, 0]}>
                  {workloadData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === '매우높음' ? ORANGE : entry.name === '높음' ? '#FFA07A' : NAVY}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. 전화 문의량 수준 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-[#1B2A4A] text-base">
                2. 전화 문의량 수준 분포
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                담당 업무 관련 인바운드 문의량 체감
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              단일선택
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phoneInquiryData} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}명`, '응답수']}
                  labelFormatter={(name) => `전화 문의량: ${name}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill={ORANGE} radius={[4, 4, 0, 0]}>
                  {phoneInquiryData.map((entry, index) => (
                    <Cell
                      key={`cell-inq-${index}`}
                      fill={entry.name.includes('과중') ? ORANGE : NAVY}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid of Chart 3 & Chart 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. 전화 상담 환경 적정성 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-[#1B2A4A] text-base">
                3. 전화 상담 환경(대기시간 등) 적정성
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                대기시간 및 상담 지원 환경 평가
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              단일선택
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phoneEnvData} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}명`, '응답수']}
                  labelFormatter={(name) => `상담 환경: ${name}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#4B5563" radius={[4, 4, 0, 0]}>
                  {phoneEnvData.map((entry, index) => (
                    <Cell
                      key={`cell-env-${index}`}
                      fill={entry.name.includes('미흡') ? '#DC2626' : entry.name === '보통' ? '#F59E0B' : '#10B981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. 업무 지연 주요 요인 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-[#1B2A4A] text-base">
                4. 업무 지연 주요 요인 집계
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                복수선택 응답 빈도 분석 (응답자 대비 선택 비율)
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              복수응답
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={delayData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 500 }}
                />
                <Tooltip
                  formatter={(val: any, _name: any, item: any) => [
                    `${val}회 선택 (${item.payload.percentage}% 직원)`,
                    '선택수',
                  ]}
                  labelFormatter={(_label, payload) => payload[0]?.payload?.fullName || ''}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill={NAVY} radius={[0, 4, 4, 0]}>
                  {delayData.map((_entry, index) => (
                    <Cell key={`cell-delay-${index}`} fill={index === 0 ? ORANGE : index === 2 ? '#B91C1C' : NAVY} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. 개선 필요도 (Horizontal Bar Chart & Score Matrix Summary) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-slate-100 pb-4 gap-2">
          <div>
            <h4 className="font-bold text-[#1B2A4A] text-lg">
              5. 업무환경 개선 필요도 종합 분석 (4.00 만점)
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              원활한 업무 처리를 위한 항목별 개선 우선순위 (매우필요: 4점, 필요함: 3점, 보통: 2점, 필요없음: 1점)
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded bg-[#1B2A4A]/10 text-[#1B2A4A]">
            Matrix Table 집계
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Horizontal Bar Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={improvementAverages}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}점 / 4.00점`, '평균 필요도']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                />
                <Bar dataKey="score" fill={ORANGE} radius={[0, 4, 4, 0]}>
                  {improvementAverages.map((entry, index) => (
                    <Cell
                      key={`cell-imp-${index}`}
                      fill={entry.score >= 3.5 ? ORANGE : entry.score >= 3.0 ? '#FFA07A' : NAVY}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Right: Progress Cards with Exact Scores */}
          <div className="space-y-4">
            {improvementAverages.map((item) => {
              const percentage = ((item.score / 4) * 100).toFixed(0);
              return (
                <div key={item.key} className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                      <span className="text-xs text-slate-500 ml-2">{item.sub}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-[#FF6B35]">{item.score}</span>
                      <span className="text-xs text-slate-400 font-medium"> / 4.00</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-[#1B2A4A] to-[#FF6B35] transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
