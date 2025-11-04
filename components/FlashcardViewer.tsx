import React, { useState } from 'react';
import { FlashcardDeck } from '@/types';
import { ArrowIcon } from '@/components/IconComponents';

interface FlashcardViewerProps {
  deck: FlashcardDeck;
  onClose: () => void;
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ deck, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    if (currentIndex < deck.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex - 1), 150);
    }
  };

  const currentCard = deck.cards[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg border-2 border-black relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-slate-500 hover:text-slate-800 text-3xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-slate-800 text-center">{deck.topic}</h2>
        
        <div className="flashcard-container w-full h-64 sm:h-72 mb-4">
          <div 
            className={`flashcard w-full h-full ${isFlipped ? 'is-flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="flashcard-face flashcard-front bg-slate-100 rounded-lg border-2 border-black font-bold text-xl text-slate-800">
              {currentCard.term}
            </div>
            <div className="flashcard-face flashcard-back bg-cyan-200 rounded-lg border-2 border-black text-slate-700">
              {currentCard.definition}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3 bg-white rounded-full text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 border-black"
            aria-label="Previous card"
          >
            <ArrowIcon className="w-6 h-6 transform rotate-180" />
          </button>
          
          <span className="font-semibold text-slate-600">
            {currentIndex + 1} / {deck.cards.length}
          </span>
          
          <button
            onClick={handleNext}
            disabled={currentIndex === deck.cards.length - 1}
            className="p-3 bg-white rounded-full text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 border-black"
            aria-label="Next card"
          >
            <ArrowIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardViewer;