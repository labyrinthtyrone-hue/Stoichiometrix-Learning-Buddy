import React from 'react';
import { ProgressState } from '@/types';
import { CheckIcon } from '@/components/IconComponents';

interface PracticeSetupProps {
  onStart: (topic: string) => void;
  onClose: () => void;
  progress: ProgressState;
}

const TOPICS = [
  "Mole Conversions",
  "Molar Mass Calculations",
  "Limiting Reactants",
  "Percent Yield",
  "Solution Stoichiometry",
  "Gas Stoichiometry",
];

const PracticeSetup: React.FC<PracticeSetupProps> = ({ onStart, onClose, progress }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4 border-2 border-black">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Practice a Concept</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 text-2xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Choose a topic to get a practice problem with instant feedback.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOPICS.map((topic) => {
             const isPracticed = progress[topic]?.practiced;
             return (
               <button
                 key={topic}
                 onClick={() => onStart(topic)}
                 className={`w-full text-left p-3 rounded-lg transition-all duration-300 text-sm font-semibold border-2 border-black transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-violet-400 flex items-center justify-between ${
                    isPracticed ? 'bg-cyan-200 hover:bg-cyan-300' : 'bg-slate-100 hover:bg-slate-200'
                 }`}
               >
                 <span>{topic}</span>
                 {isPracticed && <CheckIcon className="w-5 h-5 text-cyan-700" />}
               </button>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default PracticeSetup;