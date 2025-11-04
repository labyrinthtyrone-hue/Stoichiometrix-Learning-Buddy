import React, { useState } from 'react';
import { QuizDifficulty } from '../types';

interface QuizSetupProps {
  onStart: (difficulty: QuizDifficulty, count: number) => void;
  onClose: () => void;
}

const QuizSetup: React.FC<QuizSetupProps> = ({ onStart, onClose }) => {
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(QuizDifficulty.NORMAL);
  const [count, setCount] = useState('5');
  const [error, setError] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const numCount = parseInt(count, 10);
    if (isNaN(numCount) || numCount < 1 || numCount > 10) {
      setError('Please enter a number between 1 and 10.');
      return;
    }
    setError('');
    onStart(difficulty, numCount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4 border-2 border-black">
        <h2 className="text-xl font-bold mb-6 text-slate-800">Setup Your Quiz</h2>
        <form onSubmit={handleStart}>
          <div className="mb-4">
            <label htmlFor="difficulty" className="block text-slate-700 text-sm font-bold mb-2">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
              className="shadow-inner appearance-none border-2 border-black rounded w-full py-2 px-3 bg-white text-black leading-tight focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              {Object.values(QuizDifficulty).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="count" className="block text-slate-700 text-sm font-bold mb-2">
              Number of Questions
            </label>
            <input
              id="count"
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="shadow-inner appearance-none border-2 border-black rounded w-full py-2 px-3 bg-white text-black leading-tight focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="e.g., 5"
              min="1"
              max="10"
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300"
            >
              Start Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizSetup;
