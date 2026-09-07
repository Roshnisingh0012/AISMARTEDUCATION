import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  skillName: string;
  previousScore: number;
  newScore: number;
}

export const CompetencyProgressCard: React.FC<Props> = ({ skillName, previousScore, newScore }) => {
  const [animatedScore, setAnimatedScore] = useState(previousScore);
  const delta = newScore - previousScore;

  useEffect(() => {
    // Simple spring animation
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;
    const stepValue = delta / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedScore(newScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(prev => prev + stepValue);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [previousScore, newScore, delta]);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      <div className="relative z-10">
        <h4 className="text-indigo-100 font-medium uppercase tracking-wider text-sm mb-1">Competency Updated</h4>
        <h3 className="text-2xl font-bold mb-4">{skillName}</h3>
        
        <div className="flex items-end justify-between">
          <div>
            <div className="text-5xl font-black">{animatedScore.toFixed(1)}%</div>
            <div className="text-indigo-200 mt-1">New Weighted Score</div>
          </div>
          
          {delta > 0 && (
            <div className="bg-white/20 px-3 py-1.5 rounded-full flex items-center text-sm font-bold backdrop-blur-sm border border-white/30">
              <ArrowUpRight size={16} className="mr-1" />
              +{delta.toFixed(1)}% Growth
            </div>
          )}
        </div>
      </div>
      
      {/* Decorative background circle */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
    </div>
  );
};
