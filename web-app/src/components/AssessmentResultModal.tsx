import React from 'react';
import { QuizResultResponse } from '../types';
import { Trophy, XCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface Props {
  result: QuizResultResponse;
  onClose: () => void;
}

export const AssessmentResultModal: React.FC<Props> = ({ result, onClose }) => {
  const isPass = result.score_percentage >= 75; // Assuming 75% is standard benchmark

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Banner */}
        <div className={`absolute top-0 left-0 w-full h-2 ${isPass ? 'bg-green-500' : 'bg-orange-500'}`} />

        <div className="text-center mb-8 mt-4">
          <div className={`inline-block p-4 rounded-full mb-4 ${isPass ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Assessment Complete!</h2>
          <p className="text-gray-500 mt-2">Your proficiency has been evaluated and recorded.</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="text-center bg-gray-50 p-6 rounded-xl border border-gray-100 min-w-[200px]">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Final Score</span>
            <div className={`text-5xl font-black mt-2 ${isPass ? 'text-green-600' : 'text-orange-600'}`}>
              {result.score_percentage.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="space-y-4 max-h-[30vh] overflow-y-auto mb-8 pr-2">
          {result.results.map((res, i) => (
            <div key={res.question_id} className={`p-4 rounded-lg border ${res.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start">
                {res.is_correct ? <CheckCircle className="text-green-600 mt-0.5 mr-3 shrink-0" size={20} /> : <XCircle className="text-red-600 mt-0.5 mr-3 shrink-0" size={20} />}
                <div>
                  <p className="font-medium text-gray-900">Question {i + 1}</p>
                  {!res.is_correct && res.explanation && (
                    <p className="text-sm text-gray-600 mt-2 bg-white p-2 rounded border border-red-100 shadow-sm">
                      <strong className="text-gray-800">Explanation: </strong>
                      {res.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition"
          >
            Close Results
          </button>
          <button 
            onClick={() => window.location.href = '/learner/recommendations'}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center"
          >
            View Learning Pathway <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
