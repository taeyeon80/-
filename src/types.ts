import type { Timestamp } from 'firebase/firestore';

export interface ImprovementNeeds {
  system: number; // 1-4
  staffing: number; // 1-4
  procedure: number; // 1-4
  responseEnvironment: number; // 1-4
}

export interface SurveyResponsePayload {
  workloadLevel: string;
  phoneInquiryLevel: string;
  phoneEnvironmentLevel: string;
  delayFactors: string[];
  delayFactorEtc?: string;
  improvementNeeds: ImprovementNeeds;
  suggestion?: string;
  submittedAt: any; // Firestore serverTimestamp or Date/Timestamp
  surveyVersion: string;
}

export interface SurveyResponseItem extends SurveyResponsePayload {
  id: string;
  submittedAtFormatted?: string;
}

export const WORKLOAD_OPTIONS = [
  '매우높음',
  '높음',
  '보통',
  '낮음',
  '매우낮음',
] as const;

export const PHONE_INQUIRY_OPTIONS = [
  '매우 과중함',
  '약간 과중함',
  '보통',
  '약간 여유 있음',
  '매우 여유 있음',
] as const;

export const PHONE_ENVIRONMENT_OPTIONS = [
  '매우 미흡함',
  '미흡함',
  '보통',
  '적정함',
  '매우 적정함',
] as const;

export const DELAY_FACTOR_OPTIONS = [
  '가. 시스템 처리 속도, 오류',
  '나. 과도한 제출 서류 및 절차',
  '다. 인력 부족으로 인한 업무량 과다',
  '라. 기타',
] as const;

export const MATRIX_LEVELS = [
  { label: '매우필요', score: 4 },
  { label: '필요함', score: 3 },
  { label: '보통', score: 2 },
  { label: '필요없음', score: 1 },
] as const;

export const MATRIX_ROWS = [
  {
    key: 'system' as const,
    num: '가.',
    title: '온라인/전산 시스템 개선',
    desc: '(자동화, 접수 단순화)',
  },
  {
    key: 'staffing' as const,
    num: '나.',
    title: '인력 확충',
    desc: '(시도회 인력 보강)',
  },
  {
    key: 'procedure' as const,
    num: '다.',
    title: '제도 및 절차간소화',
    desc: '(제출서류 축소)',
  },
  {
    key: 'responseEnvironment' as const,
    num: '라.',
    title: '응대 환경 개선',
    desc: '(악성 민원 대응 및 보호)',
  },
] as const;

// Score conversion helpers for KPIs
export const WORKLOAD_SCORE_MAP: Record<string, number> = {
  '매우높음': 5,
  '높음': 4,
  '보통': 3,
  '낮음': 2,
  '매우낮음': 1,
};

export const PHONE_INQUIRY_SCORE_MAP: Record<string, number> = {
  '매우 과중함': 5,
  '약간 과중함': 4,
  '보통': 3,
  '약간 여유 있음': 2,
  '매우 여유 있음': 1,
};

export const PHONE_ENV_SCORE_MAP: Record<string, number> = {
  '매우 미흡함': 1,
  '미흡함': 2,
  '보통': 3,
  '적정함': 4,
  '매우 적정함': 5,
};
