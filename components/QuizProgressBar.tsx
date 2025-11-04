import React from 'react';

interface QuizProgressBarProps {
  current: number;
  total: number;
}

const QuizProgressBar: React.FC<QuizProgressBarProps> = ({ current, total }) => {
  const progressPercentage = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="w-full px-4 pt-3 pb-2 border-b-2 border-black bg-white">
      <div className="flex justify-between items-center mb-1 text-sm font-semibold text-slate-600">
        <span>Question {current + 1} of {total}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 border-2 border-black">
        <div
          className="bg-violet-400 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuizProgressBar;
