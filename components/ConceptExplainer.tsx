import React from 'react';
import { ProgressState } from '../types';
import { CheckIcon } from './IconComponents';

interface ConceptExplainerProps {
  onExplain: (topic: string) => void;
  onClose: () => void;
  progress: ProgressState;
}

const TOPICS = [
  "What is Stoichiometry?",
  "The Mole Concept",
  "Molar Mass",
  "Percent Composition",
  "Empirical & Molecular Formulas",
  "Limiting Reactants",
  "Theoretical Yield",
  "Reaction Kinetics",
  "Chemical Equilibrium",
  "Chemical Thermodynamics",
];

const ConceptExplainer: React.FC<ConceptExplainerProps> = ({ onExplain, onClose, progress }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4 border-2 border-black">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Explore a Concept</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 text-2xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Select a topic below, and I'll provide a clear explanation with examples.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOPICS.map((topic) => {
            const isLearned = progress[topic]?.learned;
            return (
                <button
                key={topic}
                onClick={() => onExplain(topic)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-300 text-sm font-semibold border-2 border-black transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-violet-400 flex items-center justify-between ${
                    isLearned ? 'bg-green-200 hover:bg-green-300' : 'bg-slate-100 hover:bg-slate-200'
                }`}
                >
                <span>{topic}</span>
                {isLearned && <CheckIcon className="w-5 h-5 text-green-700" />}
                </button>
            );
            })}
        </div>
      </div>
    </div>
  );
};

export default ConceptExplainer;
