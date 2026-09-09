import React from 'react';
import { QuizResultResponse } from '../types';
import { Trophy, XCircle, CheckCircle, ArrowRight, Target, HelpCircle, Check, X, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  result: QuizResultResponse;
  onClose: () => void;
  onNavigatePathway?: () => void;
}

export const AssessmentResultModal: React.FC<Props> = ({ result, onClose, onNavigatePathway }) => {
  const isPass = result.score_percentage >= 70;
  const { t, i18n } = useTranslation();
  const isHi = i18n?.language?.startsWith('hi') ?? false;

  const correctCount = result.results.filter(r => r.is_correct).length;
  const totalCount = result.results.length;

  const handlePathwayClick = () => {
    onClose();
    if (onNavigatePathway) {
      onNavigatePathway();
    } else {
      window.dispatchEvent(new CustomEvent('change-app-tab', { detail: 'pathway' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Top Decorative Indicator */}
        <div className={`h-2.5 w-full ${isPass ? 'bg-emerald-500' : 'bg-amber-500'}`} />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <Trophy size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {result.is_diagnostic 
                  ? (isHi ? 'प्रारंभिक आधारभूत मूल्यांकन संपन्न' : 'Baseline Competency Diagnostic Completed!') 
                  : (isHi ? 'मूल्यांकन परिणाम व विस्तृत समीक्षा' : 'Assessment Results & Answer Breakdown')}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isPass 
                  ? (isHi ? 'बधाई! आपने आवश्यक प्रवीणता बेंचमार्क प्राप्त कर लिया है।' : 'Congratulations! You achieved the role proficiency benchmark.')
                  : (isHi ? 'कौशल अंतराल दर्ज किए गए। व्यक्तिगत शिक्षण पथ अनुशंसित।' : 'Competency gaps mapped. Personalized learning pathway updated.')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Score & KPI Summary */}
        <div className="p-6 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isHi ? 'अंतिम स्कोर' : 'Score Percentage'}
            </span>
            <div className={`text-3xl font-black mt-1 ${isPass ? 'text-emerald-600' : 'text-amber-600'}`}>
              {result.score_percentage.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isHi ? 'सटीकता अनुपात' : 'Correct Answers'}
            </span>
            <div className="text-3xl font-black text-gray-800 mt-1">
              {correctCount} / {totalCount}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center flex flex-col justify-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isHi ? 'दक्षता स्थिति' : 'Proficiency Status'}
            </span>
            <div className="mt-1">
              {isPass ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle size={14} className="mr-1" /> {isHi ? 'उत्तीर्ण (दक्ष)' : 'Proficient (Passed)'}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  <Target size={14} className="mr-1" /> {isHi ? 'सुधार अपेक्षित' : 'Needs Development'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <BookOpen size={16} className="text-blue-600" />
              {isHi ? 'विस्तृत प्रश्न समीक्षा एवं समाधान' : 'Detailed Question-by-Question Solution Review'}
            </h3>
            <span className="text-xs text-gray-500">
              {totalCount - correctCount} {isHi ? 'त्रुटि पहचानी गई' : 'deficits identified'}
            </span>
          </div>

          {result.results.map((res, i) => {
            const questionTitle = (isHi && res.question_text_hi) ? res.question_text_hi : (res.question_text || `Question ${i + 1}`);
            const options = (isHi && res.options_hi && res.options_hi.length > 0) ? res.options_hi : (res.options || []);
            const explanation = (isHi && res.explanation_hi) ? res.explanation_hi : (res.explanation || 'Official statistics standard protocol defines this methodology.');

            return (
              <div 
                key={res.question_id || i} 
                className={`p-5 rounded-2xl border transition shadow-sm ${
                  res.is_correct 
                    ? 'bg-white border-emerald-200 hover:border-emerald-300' 
                    : 'bg-white border-rose-200 hover:border-rose-300'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2.5">
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      res.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {i + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-gray-900 leading-snug">
                      {questionTitle}
                    </h4>
                  </div>
                  {res.is_correct ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      <Check size={12} className="mr-1" /> {isHi ? 'सही' : 'Correct'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 shrink-0">
                      <X size={12} className="mr-1" /> {isHi ? 'गलत' : 'Incorrect'}
                    </span>
                  )}
                </div>

                {/* Options List */}
                {options.length > 0 && (
                  <div className="space-y-2 mt-3 mb-3 pl-8">
                    {options.map((opt, optIdx) => {
                      const isUserChoice = optIdx === res.selected_option_index;
                      const isCorrectChoice = optIdx === res.correct_option_index;

                      let style = "border-gray-200 bg-gray-50 text-gray-600";
                      let icon = null;

                      if (isCorrectChoice) {
                        style = "border-emerald-300 bg-emerald-50/80 text-emerald-900 font-semibold";
                        icon = <Check size={14} className="text-emerald-700 shrink-0" />;
                      } else if (isUserChoice && !res.is_correct) {
                        style = "border-rose-300 bg-rose-50/80 text-rose-900 line-through";
                        icon = <X size={14} className="text-rose-700 shrink-0" />;
                      }

                      return (
                        <div key={optIdx} className={`p-2.5 text-xs rounded-xl border flex items-center justify-between ${style}`}>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[11px] opacity-70">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{opt}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {isUserChoice && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/80 text-gray-700">
                                {isHi ? 'आपका चयन' : 'Your Pick'}
                              </span>
                            )}
                            {icon}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Identified Skill Deficit Tag & Pedagogical Explanation */}
                <div className="pl-8 pt-2 space-y-2">
                  {!res.is_correct && res.competency_tag && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                      <Target size={13} className="text-amber-600" />
                      <span>{isHi ? 'पहचाना गया कौशल अंतर' : 'Targeted Competency Gap'}: {res.competency_tag}</span>
                    </div>
                  )}
                  
                  <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900">
                    <p className="font-bold text-blue-950 flex items-center gap-1 mb-1">
                      <HelpCircle size={14} className="text-blue-600" />
                      {isHi ? 'विस्तृत समाधान व व्याख्या:' : 'Solution & Pedagogical Explanation:'}
                    </p>
                    <p className="text-blue-800 leading-relaxed">{explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div className="p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-3">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs transition"
          >
            {isHi ? 'समीक्षा बंद करें' : 'Close Review'}
          </button>
          <button 
            onClick={handlePathwayClick}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition hover:shadow"
          >
            <span>{isHi ? 'अनुशंसित शिक्षण मार्ग देखें' : 'View AI-Recommended Course Pathway'}</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};
