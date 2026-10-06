import React, { useState, useEffect, useCallback } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  handleFirestoreError,
  OperationType,
  type User,
} from '../firebaseConfig';
import { AdminDashboard } from '../components/AdminDashboard';
import { QRCodeModal } from '../components/QRCodeModal';
import type { SurveyResponseItem } from '../types';
import {
  ShieldAlert,
  Loader2,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Designated Audit Office Admin Password
const AUDIT_ADMIN_PASSWORD = 'keea2026';
const BOOTSTRAP_ADMIN_EMAIL = 'taeyeon80@nate.com';
const ADMIN_SESSION_KEY = 'keea_admin_session_auth';

export const AdminPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminDisplayName, setAdminDisplayName] = useState<string>('');
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(false);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);

  // Password Login State
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // QR Modal State
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);

  const [responses, setResponses] = useState<SurveyResponseItem[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Check saved session on load
  useEffect(() => {
    try {
      const savedSession = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (savedSession === AUDIT_ADMIN_PASSWORD) {
        setIsAdmin(true);
        setAdminDisplayName('감사실 관리자 (keea2026)');
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  // Monitor Google Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser?.email) {
        await verifyAdminPermission(currentUser.email);
      } else {
        // If not already verified via password session, set to false
        const savedSession = sessionStorage.getItem(ADMIN_SESSION_KEY);
        if (savedSession !== AUDIT_ADMIN_PASSWORD) {
          setIsAdmin(false);
          setResponses([]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Check if current Google user is in admins whitelist
  const verifyAdminPermission = async (email: string) => {
    setCheckingAdmin(true);
    setAdminCheckError(null);

    if (email === BOOTSTRAP_ADMIN_EMAIL) {
      setIsAdmin(true);
      setAdminDisplayName(email);
      setCheckingAdmin(false);
      return;
    }

    try {
      const adminDocRef = doc(db, 'admins', email);
      const adminSnap = await getDoc(adminDocRef);

      if (adminSnap.exists()) {
        setIsAdmin(true);
        setAdminDisplayName(email);
      } else {
        setIsAdmin(false);
        setAdminCheckError(
          `계정(${email})은 등록된 관리자 권한이 없습니다. 감사실 관리자 비밀번호(keea2026)로 로그인하시거나 계정 등록을 요청해 주세요.`
        );
        await signOut(auth);
      }
    } catch {
      if (email === BOOTSTRAP_ADMIN_EMAIL) {
        setIsAdmin(true);
        setAdminDisplayName(email);
      } else {
        setAdminCheckError('관리자 권한 확인 중 오류가 발생했습니다.');
        await signOut(auth);
      }
    } finally {
      setCheckingAdmin(false);
    }
  };

  // Password authentication handler
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setAdminCheckError(null);

    const trimmed = passwordInput.trim();
    if (trimmed === AUDIT_ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, AUDIT_ADMIN_PASSWORD);
      } catch {
        // Ignore
      }
      setIsAdmin(true);
      setAdminDisplayName('감사실 관리자 (keea2026)');
      setPasswordInput('');
    } else {
      setPasswordError('비밀번호가 일치하지 않습니다. 감사실 지정 비밀번호(keea2026)를 입력해주세요.');
    }
  };

  // Fetch responses once verified
  const fetchSurveyResponses = useCallback(async () => {
    if (!isAdmin) return;

    setDataLoading(true);
    setFetchError(null);

    try {
      const q = query(collection(db, 'responses'), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);

      const items: SurveyResponseItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        let submittedAtFormatted = '-';
        if (data.submittedAt) {
          try {
            const dateObj = data.submittedAt.toDate
              ? data.submittedAt.toDate()
              : new Date(data.submittedAt);
            if (!isNaN(dateObj.getTime())) {
              submittedAtFormatted = `${dateObj.getFullYear()}.${String(
                dateObj.getMonth() + 1
              ).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')} ${String(
                dateObj.getHours()
              ).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
            }
          } catch {
            submittedAtFormatted = '-';
          }
        }

        return {
          id: docSnap.id,
          workloadLevel: data.workloadLevel || '',
          phoneInquiryLevel: data.phoneInquiryLevel || '',
          phoneEnvironmentLevel: data.phoneEnvironmentLevel || '',
          delayFactors: data.delayFactors || [],
          delayFactorEtc: data.delayFactorEtc || '',
          improvementNeeds: data.improvementNeeds || {
            system: 0,
            staffing: 0,
            procedure: 0,
            responseEnvironment: 0,
          },
          suggestion: data.suggestion || '',
          submittedAt: data.submittedAt,
          submittedAtFormatted,
          surveyVersion: data.surveyVersion || 'v1.0',
        };
      });

      setResponses(items);
    } catch (err: unknown) {
      console.error('Failed to load survey responses:', err);
      try {
        handleFirestoreError(err, OperationType.LIST, 'responses');
      } catch {
        setFetchError('설문 데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      setDataLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchSurveyResponses();
    }
  }, [isAdmin, fetchSurveyResponses]);

  const handleGoogleSignIn = async () => {
    setAdminCheckError(null);
    setPasswordError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setAdminCheckError(`로그인 처리 중 문제가 발생했습니다: ${err.message}`);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      setAdminDisplayName('');
      setResponses([]);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-sm w-full">
          <Loader2 className="w-10 h-10 text-[#1B2A4A] animate-spin mx-auto mb-4" />
          <h3 className="font-bold text-[#1B2A4A] text-lg mb-1">관리자 인증 확인 중</h3>
          <p className="text-xs text-slate-500">
            Firebase 인증 및 권한을 검증하고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  // Not Admin: Show Password & Google Login Screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-md border-2 border-[#1B2A4A]/20 p-7 sm:p-9 text-center">
            {/* Header Badge */}
            <div className="w-16 h-14 rounded-2xl bg-[#1B2A4A] text-white flex items-center justify-center mx-auto mb-4 font-black text-lg shadow-md tracking-tight">
              KEEA
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#1B2A4A]/10 text-[#1B2A4A] mb-2">
              감사실 전용 관리자 인증
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-[#1B2A4A] mb-1.5 tracking-tight">
              협회 직원 설문 통계 관리자
            </h2>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              한국전기기술인협회 감사실 관리자 비밀번호를 입력해 주십시오.
            </p>

            {/* Error Message */}
            {(adminCheckError || passwordError) && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-left text-xs sm:text-sm text-red-700 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">인증 실패</p>
                  <p className="mt-0.5">{passwordError || adminCheckError}</p>
                </div>
              </div>
            )}

            {/* Method 1: Audit Office Admin Password Form (Primary) */}
            <form onSubmit={handlePasswordLogin} className="space-y-3.5 text-left mb-6">
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>감사실 관리자 비밀번호</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">
                    기본 비번: keea2026
                  </span>
                </label>

                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="비밀번호(keea2026)를 입력하세요"
                    className="w-full pl-3.5 pr-10 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] focus:bg-white text-slate-800 placeholder-slate-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#FF6B35] hover:bg-[#e85c28] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>감사실 관리자 로그인</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-2 items-center mb-5">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium">
                또는 Google 계정으로 로그인
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {/* Method 2: Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google 관리자 계정 로그인</span>
            </button>

            {/* Bottom Links: Survey & Mobile QR */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <Link
                to="/"
                className="hover:text-[#1B2A4A] flex items-center gap-1 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>설문조사 페이지로</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsQrOpen(true)}
                className="text-[#FF6B35] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>모바일 QR코드</span>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-slate-400">
            한국전기기술인협회 감사실 종합 통계 분석 시스템
          </div>
        </div>

        <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
      </div>
    );
  }

  // Authenticated Admin: Render Admin Dashboard
  return (
    <div>
      {fetchError && (
        <div className="bg-red-50 border-b border-red-200 py-2.5 px-4 text-center text-xs font-semibold text-red-700 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{fetchError}</span>
        </div>
      )}

      <AdminDashboard
        responses={responses}
        adminEmail={adminDisplayName || user?.email || '감사실 관리자'}
        onSignOut={handleSignOut}
        onRefresh={fetchSurveyResponses}
        loading={dataLoading}
      />
    </div>
  );
};

export default AdminPage;
