import React, { useState, useEffect } from 'react';
import { Message, MessageSender, QuizQuestion } from '../types';
import DataVisualizer from './DataVisualizer';
import PracticeProblem from './PracticeProblem';

interface MessageComponentProps {
  message: Message;
  onQuizAnswer: (messageId: string, answer: string) => void;
  onPracticeAnswer: (messageId: string, answer: string) => void;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message, onQuizAnswer, onPracticeAnswer }) => {
  const isUser = message.sender === MessageSender.USER;
  const isSystem = message.sender === MessageSender.SYSTEM;

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentQuizQuestion: QuizQuestion | undefined = message.quiz && !message.quiz.isFinished 
    ? message.quiz.questions[message.quiz.currentQuestionIndex] 
    : undefined;

  useEffect(() => {
    setSelectedOption(null);
  }, [currentQuizQuestion]);

  const handleOptionClick = (option: string) => {
    if (!selectedOption) {
      setSelectedOption(option);
      setTimeout(() => {
        onQuizAnswer(message.id, option);
      }, 1000);
    }
  };

  if (isSystem) {
    return (
      <div className="text-center my-2">
        <span className="px-3 py-1 text-xs bg-slate-300 text-slate-600 rounded-full">{message.text}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-md lg:max-w-xl px-4 py-3 rounded-2xl text-black ${isUser ? 'bg-violet-400 text-white chat-bubble-user' : 'bg-slate-100 chat-bubble-bot'}`}
      >
        {message.text === '...' ? (
            <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"></span>
            </div>
        ) : (
            <p className="whitespace-pre-wrap">{message.text}</p>
        )}

        {message.visualizationData && (
          <DataVisualizer data={message.visualizationData} />
        )}
        
        {message.practiceProblem && (
          <PracticeProblem 
            problemData={message.practiceProblem}
            onAnswer={(answer) => onPracticeAnswer(message.id, answer)}
          />
        )}


        {currentQuizQuestion && (
            <div className="mt-3">
                <p className="font-bold mb-3">{currentQuizQuestion.question}</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentQuizQuestion.options.map((option, index) => {
                    const isCorrect = option === currentQuizQuestion.answer;
                    let buttonClass = "w-full text-left p-2.5 rounded-lg transition-all duration-300 text-sm font-semibold border-2 border-black ";
                    if (selectedOption) {
                        if (option === selectedOption) {
                        buttonClass += isCorrect ? 'bg-green-400' : 'bg-red-400';
                        } else if (isCorrect) {
                        buttonClass += 'bg-green-400';
                        } else {
                        buttonClass += 'bg-slate-300 opacity-60';
                        }
                    } else {
                        buttonClass += 'bg-slate-300 hover:bg-slate-400 transform hover:-translate-y-0.5';
                    }
                    
                    return (
                        <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        disabled={!!selectedOption}
                        className={buttonClass}
                        >
                        {option}
                        </button>
                    );
                    })}
                </div>
            </div>
        )}

        {message.groundingChunks && message.groundingChunks.length > 0 && message.groundingChunks.some(c => c.web) && (
          <div className="mt-3 pt-3 border-t border-black/20">
            <h4 className="text-xs font-bold mb-1 text-slate-500">Sources:</h4>
            <ul className="list-none p-0 m-0 space-y-1">
              {message.groundingChunks.map((chunk, index) => (
                chunk.web && (
                  <li key={index} className="text-xs">
                    <a 
                      href={chunk.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-violet-600 hover:text-violet-800 underline break-all"
                    >
                      {`${chunk.web.title || chunk.web.uri}`}
                    </a>
                  </li>
                )
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageComponent;