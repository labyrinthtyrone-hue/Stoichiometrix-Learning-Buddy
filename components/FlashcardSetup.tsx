import React, { useState } from 'react';
import { FlashcardDeck } from '@/types';

interface FlashcardSetupProps {
  onStart: (topic: string, count: number, useSaved: boolean) => void;
  onClose: () => void;
  savedDecks: { [topic: string]: FlashcardDeck };
}

const TOPICS = [
  "Key Terms & Definitions",
  "Common Formulas",
  "The Mole Concept",
  "Molar Mass",
  "Limiting Reactants",
  "Percent Yield",
];

const FlashcardSetup: React.FC<FlashcardSetupProps> = ({ onStart, onClose, savedDecks }) => {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [count, setCount] = useState('10');
  const [error, setError] = useState('');

  const handleStart = (useSaved = false) => {
    const numCount = parseInt(count, 10);
    if (!useSaved && (isNaN(numCount) || numCount < 3 || numCount > 20)) {
      setError('Please enter a number between 3 and 20.');
      return;
    }
    setError('');
    onStart(topic, numCount, useSaved);
  };

  const topicHasSavedDeck = !!savedDecks[topic];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4 border-2 border-black">
        <h2 className="text-xl font-bold mb-6 text-slate-800">Study Flashcards</h2>
        
        <div className="mb-4">
          <label htmlFor="topic" className="block text-slate-700 text-sm font-bold mb-2">
            Topic
          </label>
          <select
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="shadow-inner appearance-none border-2 border-black rounded w-full py-2 px-3 bg-white text-black leading-tight focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="count" className="block text-slate-700 text-sm font-bold mb-2">
            Number of Cards (if generating new)
          </label>
          <input
            id="count"
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="shadow-inner appearance-none border-2 border-black rounded w-full py-2 px-3 bg-white text-black leading-tight focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="e.g., 10"
            min="3"
            max="20"
            disabled={topicHasSavedDeck}
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
          
          {topicHasSavedDeck ? (
            <button
              type="button"
              onClick={() => handleStart(true)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300"
            >
              Study Saved Deck ({savedDecks[topic].cards.length} cards)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleStart(false)}
              className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300"
            >
              Generate
            </button>
          )}
        </div>
        {topicHasSavedDeck && (
            <div className="text-center mt-4">
                <button
                    onClick={() => handleStart(false)}
                    className="text-sm text-violet-600 hover:text-violet-800 font-semibold underline"
                >
                    Or generate a new deck
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardSetup;