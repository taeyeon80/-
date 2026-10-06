import React from 'react';

interface SingleChoiceQuestionProps {
  number: number;
  title: string;
  options: readonly string[];
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}

export const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({
  number,
  title,
  options,
  value,
  onChange,
  required = true,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7 mb-6 transition-all duration-200 hover:border-slate-300">
      <div className="flex items-start gap-3 mb-4">
        <span className="inline-flex items-center justify-center bg-[#1B2A4A] text-white text-xs sm:text-sm font-bold px-2.5 py-1 rounded-md shrink-0 mt-0.5">
          문항 {number}
        </span>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold text-[#1B2A4A] leading-snug">
            {title}
            {required && (
              <span className="ml-1.5 text-xs font-semibold text-[#FF6B35] bg-[#FF6B35]/10 px-1.5 py-0.5 rounded">
                필수
              </span>
            )}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2">
        {options.map((option) => {
          const isSelected = value === option;
          const inputId = `q${number}-${option}`;
          return (
            <label
              key={option}
              htmlFor={inputId}
              className={`flex sm:flex-col items-center justify-start sm:justify-center p-3 sm:py-3.5 sm:px-2 rounded-lg border cursor-pointer transition-all duration-150 select-none text-sm font-medium ${
                isSelected
                  ? 'border-[#FF6B35] bg-[#FF6B35]/5 text-[#1B2A4A] font-semibold ring-1 ring-[#FF6B35]'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
              }`}
            >
              <input
                type="radio"
                id={inputId}
                name={`question-${number}`}
                value={option}
                checked={isSelected}
                onChange={() => onChange(option)}
                className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35] focus:ring-offset-1 border-slate-300 mr-3 sm:mr-0 sm:mb-2 accent-[#FF6B35]"
              />
              <span className="text-center">{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

interface MultipleChoiceQuestionProps {
  number: number;
  title: string;
  options: readonly string[];
  selectedValues: string[];
  onChange: (vals: string[]) => void;
  etcValue: string;
  onEtcChange: (text: string) => void;
  required?: boolean;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  number,
  title,
  options,
  selectedValues,
  onChange,
  etcValue,
  onEtcChange,
  required = true,
}) => {
  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const isEtcSelected = selectedValues.includes('라. 기타');

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7 mb-6 transition-all duration-200 hover:border-slate-300">
      <div className="flex items-start gap-3 mb-2">
        <span className="inline-flex items-center justify-center bg-[#1B2A4A] text-white text-xs sm:text-sm font-bold px-2.5 py-1 rounded-md shrink-0 mt-0.5">
          문항 {number}
        </span>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold text-[#1B2A4A] leading-snug">
            {title}
            {required && (
              <span className="ml-1.5 text-xs font-semibold text-[#FF6B35] bg-[#FF6B35]/10 px-1.5 py-0.5 rounded">
                필수 (복수선택 가능)
              </span>
            )}
          </h3>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4 ml-10">
        해당하는 항목을 모두 선택해 주시기 바랍니다. (최소 1개 이상)
      </p>

      <div className="space-y-2.5">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option);
          const inputId = `q${number}-${option}`;
          return (
            <div key={option} className="flex flex-col">
              <label
                htmlFor={inputId}
                className={`flex items-center p-3.5 rounded-lg border cursor-pointer transition-all duration-150 select-none text-sm font-medium ${
                  isSelected
                    ? 'border-[#FF6B35] bg-[#FF6B35]/5 text-[#1B2A4A] font-semibold ring-1 ring-[#FF6B35]'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  id={inputId}
                  checked={isSelected}
                  onChange={() => toggleOption(option)}
                  className="w-4 h-4 text-[#FF6B35] rounded focus:ring-[#FF6B35] focus:ring-offset-1 border-slate-300 mr-3 accent-[#FF6B35]"
                />
                <span className="flex-1">{option}</span>
              </label>

              {/* Textarea for "라. 기타" */}
              {option === '라. 기타' && isEtcSelected && (
                <div className="mt-2.5 pl-7 pr-1">
                  <input
                    type="text"
                    value={etcValue}
                    onChange={(e) => onEtcChange(e.target.value)}
                    placeholder="기타 업무 지연 요인을 입력해 주세요."
                    maxLength={500}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-slate-800 placeholder-slate-400"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TextareaQuestionProps {
  number: number;
  title: string;
  value: string;
  onChange: (val: string) => void;
  maxLength?: number;
}

export const TextareaQuestion: React.FC<TextareaQuestionProps> = ({
  number,
  title,
  value,
  onChange,
  maxLength = 1000,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7 mb-6 transition-all duration-200 hover:border-slate-300">
      <div className="flex items-start gap-3 mb-2">
        <span className="inline-flex items-center justify-center bg-[#1B2A4A] text-white text-xs sm:text-sm font-bold px-2.5 py-1 rounded-md shrink-0 mt-0.5">
          문항 {number}
        </span>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold text-[#1B2A4A] leading-snug">
            {title}
            <span className="ml-1.5 text-xs font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              선택 응답
            </span>
          </h3>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4 ml-10">
        협회 업무환경 개선과 회원 서비스 향상을 위한 건설적인 제안을 편안하게 작성해 주십시오.
      </p>

      <div className="relative">
        <textarea
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="협회 업무환경 및 회원 서비스 개선을 위한 의견을 자유롭게 작성해 주세요."
          maxLength={maxLength}
          className="w-full px-4 py-3 text-sm sm:text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-slate-800 placeholder-slate-400 resize-y"
        />
        <div className="flex justify-end mt-1.5 text-xs text-slate-500 font-mono">
          <span className={value.length >= maxLength ? 'text-red-500 font-bold' : ''}>
            {value.length.toLocaleString()}
          </span>
          <span className="mx-1">/</span>
          <span>{maxLength.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
