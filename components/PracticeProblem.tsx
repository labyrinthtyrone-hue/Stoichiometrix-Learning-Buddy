import React, { useState, useEffect } from 'react';
import { PracticeProblemData } from '@/types';

interface PracticeProblemProps {
  problemData: PracticeProblemData;
  onAnswer: (answer: string) => void;
}

const PracticeProblem: React.FC<PracticeProblemProps> = ({ problemData, onAnswer }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer.trim() && !problemData.isComplete) {
      onAnswer(userAnswer);
    }
  };

  useEffect(() => {
    if (problemData.isComplete && !problemData.isCorrect) {
      setShowSolution(true);
    }
  }, [problemData.isComplete, problemData.isCorrect]);

  return (
    <div className="mt-3 p-3 bg-slate-200 rounded-lg border-2 border-black">
      <p className="font-semibold mb-3 text-slate-800">{problemData.question}</p>
      
      {!problemData.isComplete ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="shadow-inner appearance-none border-2 border-black rounded-md w-full py-2 px-3 bg-white text-black leading-tight focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Your answer..."
          />
          <button
            type="submit"
            className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-300"
          >
            Submit
          </button>
        </form>
      ) : (
        <div className="p-2 rounded-md border-2 border-black bg-white">
            <p className="text-sm text-slate-600">
                Your answer:
                <span className={`font-bold ml-2 ${problemData.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {problemData.userAnswer}
                </span>
            </p>
        </div>
      )}

      {!showSolution && (
          <div className="text-center mt-3">
              <button 
                onClick={() => setShowSolution(true)}
                className="text-sm text-violet-600 hover:text-violet-800 font-semibold underline"
              >
                  Show Solution
              </button>
          </div>
      )}

      {showSolution && (
          <div className="mt-3 p-3 bg-slate-100 rounded-md border-2 border-slate-300">
              <h4 className="font-bold text-slate-800 mb-2">Solution Steps:</h4>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{problemData.solution}</p>
          </div>
      )}
    </div>
  );
};

export default PracticeProblem;