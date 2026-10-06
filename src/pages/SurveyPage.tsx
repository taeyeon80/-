import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { IntroCard } from '../components/IntroCard';
import {
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  TextareaQuestion,
} from '../components/SurveyQuestion';
import { ImprovementMatrix } from '../components/ImprovementMatrix';
import { CompletionView } from '../components/CompletionView';
import {
  WORKLOAD_OPTIONS,
  PHONE_INQUIRY_OPTIONS,
  PHONE_ENVIRONMENT_OPTIONS,
  DELAY_FACTOR_OPTIONS,
  type ImprovementNeeds,
} from '../types';
import {
  db,
  collection,
  addDoc,
  serverTimestamp,
  handleFirestoreError,
  OperationType,
} from '../firebaseConfig';
import {
  Send,
  AlertTriangle,
  Info,
  Loader2,
  CheckCircle,
  HelpCircle,
  QrCode,
} from 'lucide-react';
import { QRCodeModal } from '../components/QRCodeModal';

const STORAGE_KEY = 'keea_staff_survey_completed';
const STORAGE_TIME_KEY = 'keea_staff_survey_time';

export const SurveyPage: React.FC = () => {
  // Form State
  const [workloadLevel, setWorkloadLevel] = useState<string>('');
  const [phoneInquiryLevel, setPhoneInquiryLevel] = useState<string>('');
  const [phoneEnvironmentLevel, setPhoneEnvironmentLevel] = useState<string>('');
  const [delayFactors, setDelayFactors] = useState<string[]>([]);
  const [delayFactorEtc, setDelayFactorEtc] = useState<string>('');
  const [improvementNeeds, setImprovementNeeds] = useState<Partial<ImprovementNeeds>>({});
  const [suggestion, setSuggestion] = useState<string>('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState<boolean>(false);
  const [completedDateStr, setCompletedDateStr] = useState<string>('');
  const [showSurveyAnyway, setShowSurveyAnyway] = useState<boolean>(false);

  // Check LocalStorage on initial load
  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      const time = localStorage.getItem(STORAGE_TIME_KEY);
      if (completed === 'true') {
        setAlreadyCompleted(true);
        if (time) {
          const d = new Date(time);
          setCompletedDateStr(
            `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
              d.getDate()
            ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
              d.getMinutes()
            ).padStart(2, '0')}`
          );
        }
      }
    } catch {
      // Ignore localStorage errors (e.g. disabled in private browsing)
    }
  }, []);

  // Validation: Check if all required items are answered
  const isFormValid =
    workloadLevel !== '' &&
    phoneInquiryLevel !== '' &&
    phoneEnvironmentLevel !== '' &&
    delayFactors.length > 0 &&
    (!delayFactors.includes('라. 기타') || delayFactorEtc.trim().length > 0) &&
    typeof improvementNeeds.system === 'number' &&
    typeof improvementNeeds.staffing === 'number' &&
    typeof improvementNeeds.procedure === 'number' &&
    typeof improvementNeeds.responseEnvironment === 'number';

  // Handle matrix row changes
  const handleMatrixChange = (key: keyof ImprovementNeeds, score: number) => {
    setImprovementNeeds((prev) => ({
      ...prev,
      [key]: score,
    }));
  };

  // Submit Handler
  const handleSubmitConfirm = async () => {
    if (!isFormValid || isSubmitting) return;

    setShowConfirmModal(false);
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      workloadLevel,
      phoneInquiryLevel,
      phoneEnvironmentLevel,
      delayFactors,
      ...(delayFactorEtc.trim() ? { delayFactorEtc: delayFactorEtc.trim() } : {}),
      improvementNeeds: {
        system: improvementNeeds.system!,
        staffing: improvementNeeds.staffing!,
        procedure: improvementNeeds.procedure!,
        responseEnvironment: improvementNeeds.responseEnvironment!,
      },
      ...(suggestion.trim() ? { suggestion: suggestion.trim() } : {}),
      submittedAt: serverTimestamp(),
      surveyVersion: 'v1.0',
    };

    try {
      await addDoc(collection(db, 'responses'), payload);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
        localStorage.setItem(STORAGE_TIME_KEY, new Date().toISOString());
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }

      setIsCompleted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error('Survey submission error:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'responses');
      } catch (formattedErr) {
        setErrorMessage(
          '설문 저장 중 오류가 발생했습니다. 네트워크 연결을 확인하신 후 다시 시도해 주세요.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNew = () => {
    setIsCompleted(false);
    setWorkloadLevel('');
    setPhoneInquiryLevel('');
    setPhoneEnvironmentLevel('');
    setDelayFactors([]);
    setDelayFactorEtc('');
    setImprovementNeeds({});
    setSuggestion('');
    setShowSurveyAnyway(true);
    setAlreadyCompleted(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Duplicate Notice Banner (if previously submitted) */}
          {alreadyCompleted && !showSurveyAnyway && !isCompleted && (
            <div className="mb-6 p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-xl shadow-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm sm:text-base">
                    이미 설문에 참여하셨습니다.
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                    {completedDateStr ? `(참여 일시: ${completedDateStr}) ` : ''}
                    본 설문은 개인정보를 수집하지 않는 완전 익명 설문으로 재참여를 권장하지 않습니다. 새로 작성하시겠습니까?
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSurveyAnyway(true)}
                className="shrink-0 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
              >
                설문 다시 작성하기
              </button>
            </div>
          )}

          {/* If Survey Completed: Show Completion View */}
          {isCompleted ? (
            <CompletionView
              onReset={handleResetForNew}
              submittedAtFormatted={new Date().toLocaleString('ko-KR')}
            />
          ) : (
            <>
              {/* Document Container - A4 Official Document Styling */}
              <div className="bg-white/95 rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-10 mb-8 backdrop-blur-xs">
                {/* 1. Page Header Title */}
                <div className="border-b-2 border-[#1B2A4A] pb-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 tracking-wider">
                      한국전기기술인협회 감사실
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsQrOpen(true)}
                        className="text-xs px-2.5 py-1 rounded bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 text-[#FF6B35] font-bold border border-[#FF6B35]/30 flex items-center gap-1 transition-colors cursor-pointer"
                        title="스마트폰으로 설문 참여하기"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>스마트폰 QR 참여</span>
                      </button>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 hidden sm:inline">
                        완전 익명 보장
                      </span>
                    </div>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#1B2A4A] mt-1.5 flex items-center gap-2">
                    <span>○ 협회 직원 대상 설문내용</span>
                  </h1>
                </div>

                {/* 2. Official Greeting Card */}
                <IntroCard />

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 3. Survey Questions */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isFormValid) {
                      setShowConfirmModal(true);
                    }
                  }}
                  className="space-y-6"
                >
                  {/* 문항 1 */}
                  <SingleChoiceQuestion
                    number={1}
                    title="평소 민원 업무 및 회원 응대 과정에서 느끼는 업무 부담 수준은 어떠하십니까?"
                    options={WORKLOAD_OPTIONS}
                    value={workloadLevel}
                    onChange={setWorkloadLevel}
                    required={true}
                  />

                  {/* 문항 2 */}
                  <SingleChoiceQuestion
                    number={2}
                    title="현재 담당 업무 관련 전화 문의량 수준은 어떠하십니까?"
                    options={PHONE_INQUIRY_OPTIONS}
                    value={phoneInquiryLevel}
                    onChange={setPhoneInquiryLevel}
                    required={true}
                  />

                  {/* 문항 3 */}
                  <SingleChoiceQuestion
                    number={3}
                    title="현재 담당 업무 관련 전화 상담 환경(대기시간 등)의 적정성에 대해 어떻게 생각하십니까?"
                    options={PHONE_ENVIRONMENT_OPTIONS}
                    value={phoneEnvironmentLevel}
                    onChange={setPhoneEnvironmentLevel}
                    required={true}
                  />

                  {/* 문항 4 */}
                  <MultipleChoiceQuestion
                    number={4}
                    title="민원 응대 및 전화 상담시, 업무 처리를 지연시키는 주요 요인은 무엇이라고 생각하십니까?"
                    options={DELAY_FACTOR_OPTIONS}
                    selectedValues={delayFactors}
                    onChange={setDelayFactors}
                    etcValue={delayFactorEtc}
                    onEtcChange={setDelayFactorEtc}
                    required={true}
                  />

                  {/* 문항 5: Matrix Table */}
                  <ImprovementMatrix
                    number={5}
                    value={improvementNeeds}
                    onChange={handleMatrixChange}
                    required={true}
                  />

                  {/* 문항 6: Textarea */}
                  <TextareaQuestion
                    number={6}
                    title="협회 발전을 위한 건의 및 개선사항(자유 기술)"
                    value={suggestion}
                    onChange={setSuggestion}
                    maxLength={1000}
                  />

                  {/* Submit Button Section */}
                  <div className="pt-6 border-t border-slate-200">
                    {!isFormValid && (
                      <p className="text-center text-xs sm:text-sm text-slate-500 mb-3 flex items-center justify-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-amber-500" />
                        <span>필수 항목(문항 1~5)을 모두 입력하셔야 제출 버튼이 활성화됩니다.</span>
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                        isFormValid && !isSubmitting
                          ? 'bg-[#FF6B35] hover:bg-[#e85c28] text-white shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>제출 처리 중...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>설문 제출하기</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Bottom Copyright & Anonymity note */}
              <div className="text-center text-xs text-slate-500 pb-8 space-y-1">
                <p>한국전기기술인협회 감사실 ‧ 직원 의견 수렴 및 환경개선</p>
                <p className="text-slate-400">
                  본 시스템은 익명 처리되어 응답자의 신원이나 네트워크 정보를 저장하지 않습니다.
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
              작성하신 내용을 제출하시겠습니까?
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              제출 완료 후에는 답변 내용을 수정하거나 삭제할 수 없습니다. 작성을 완료하셨다면 아래의 확인 버튼을 눌러주십시오.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
              >
                다시 검토하기
              </button>

              <button
                type="button"
                onClick={handleSubmitConfirm}
                className="px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#e85c28] text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                최종 제출하기
              </button>
            </div>
          </div>
        </div>
      )}

      <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </div>
  );
};

export default SurveyPage;
