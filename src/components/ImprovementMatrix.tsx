import React from 'react';
import { MATRIX_LEVELS, MATRIX_ROWS, type ImprovementNeeds } from '../types';

interface ImprovementMatrixProps {
  number: number;
  value: Partial<ImprovementNeeds>;
  onChange: (key: keyof ImprovementNeeds, score: number) => void;
  required?: boolean;
}

export const ImprovementMatrix: React.FC<ImprovementMatrixProps> = ({
  number,
  value,
  onChange,
  required = true,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7 mb-6 transition-all duration-200 hover:border-slate-300">
      <div className="flex items-start gap-3 mb-2">
        <span className="inline-flex items-center justify-center bg-[#1B2A4A] text-white text-xs sm:text-sm font-bold px-2.5 py-1 rounded-md shrink-0 mt-0.5">
          문항 {number}
        </span>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold text-[#1B2A4A] leading-snug">
            원활한 업무 처리를 위해 아래 각 항목별 개선이 얼마나 필요하다고 생각하십니까?
            {required && (
              <span className="ml-1.5 text-xs font-semibold text-[#FF6B35] bg-[#FF6B35]/10 px-1.5 py-0.5 rounded">
                전 항목 필수
              </span>
            )}
          </h3>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-5 ml-10">
        각 항목(행)마다 가장 적절하다고 생각되는 수준 하나를 선택해 주십시오.
      </p>

      {/* PC & Tablet Table View */}
      <div className="overflow-x-auto rounded-lg border border-slate-300">
        <table className="w-full border-collapse text-left min-w-[580px]">
          <thead>
            <tr className="bg-[#1B2A4A] text-white text-xs sm:text-sm">
              <th scope="col" className="py-3 px-4 font-bold text-center w-5/12 border-r border-slate-700/50">
                구분
              </th>
              {MATRIX_LEVELS.map((lvl) => (
                <th
                  key={lvl.score}
                  scope="col"
                  className="py-3 px-2 font-bold text-center w-[14.5%] border-r last:border-r-0 border-slate-700/50"
                >
                  {lvl.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {MATRIX_ROWS.map((row) => {
              const currentScore = value[row.key];
              const isRowComplete = currentScore !== undefined;

              return (
                <tr
                  key={row.key}
                  className={`transition-colors duration-150 ${
                    isRowComplete ? 'bg-white hover:bg-slate-50/80' : 'bg-amber-50/20 hover:bg-amber-50/40'
                  }`}
                >
                  {/* Category Title & Subtext */}
                  <td className="py-3.5 px-4 border-r border-slate-200">
                    <div className="font-semibold text-slate-900 leading-snug">
                      {row.num} {row.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {row.desc}
                    </div>
                  </td>

                  {/* 4 Score Radios */}
                  {MATRIX_LEVELS.map((lvl) => {
                    const isChecked = currentScore === lvl.score;
                    const radioId = `matrix-${row.key}-${lvl.score}`;

                    return (
                      <td
                        key={lvl.score}
                        onClick={() => onChange(row.key, lvl.score)}
                        className={`py-3 px-2 text-center border-r last:border-r-0 border-slate-200 cursor-pointer select-none transition-colors duration-100 ${
                          isChecked ? 'bg-[#FF6B35]/10 font-bold text-[#FF6B35]' : 'hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <input
                            type="radio"
                            id={radioId}
                            name={`matrix-${row.key}`}
                            value={lvl.score}
                            checked={isChecked}
                            onChange={() => onChange(row.key, lvl.score)}
                            className="w-4 h-4 text-[#FF6B35] border-slate-300 focus:ring-[#FF6B35] accent-[#FF6B35] cursor-pointer"
                          />
                          <span className="text-[11px] text-slate-500 sm:hidden">
                            {lvl.label}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Progress status for Matrix */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          선택 완료: {Object.keys(value).length} / {MATRIX_ROWS.length} 항목
        </span>
        {Object.keys(value).length === MATRIX_ROWS.length ? (
          <span className="text-emerald-600 font-semibold">✓ 4개 항목 모두 선택 완료</span>
        ) : (
          <span className="text-amber-600">모든 행의 개선 필요도를 선택해 주세요.</span>
        )}
      </div>
    </div>
  );
};

export default ImprovementMatrix;
