import React, { useState, useEffect, useRef } from 'react';
import { User, Message, MessageSender, QuizDifficulty, QuizData, ChatSession, QuizQuestion, VisualizationData, PracticeProblemData, ProgressState, FlashcardDeck } from '../types';
import { createChatSession, generateQuiz, balanceEquation, getConceptualExplanation, generatePracticeProblem, generateFlashcards } from '../services/geminiService';
import MessageComponent from './Message';
import { BalanceIcon, SendIcon, StoichiometryIcon, QuizIcon, BookIcon, PracticeIcon, RefreshIcon, FlashcardIcon, HomeIcon } from './IconComponents';
import EquationBalancer from './EquationBalancer';
import QuizProgressBar from './QuizProgressBar';
import QuizSetup from './QuizSetup';
import ConceptExplainer from './ConceptExplainer';
import PracticeSetup from './PracticeSetup';
import FlashcardSetup from './FlashcardSetup';
import FlashcardViewer from './FlashcardViewer';


interface ChatWindowProps {
  user: User;
  initialMessages?: Message[];
  onClearSession: () => void;
  progress: ProgressState;
  onUpdateProgress: (topic: string, type: 'learned' | 'practiced') => void;
  onSaveFlashcards: (deck: FlashcardDeck) => void;
  savedFlashcardDecks: { [topic: string]: FlashcardDeck };
  onClose: () => void;
}

const cleanResponse = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\*/g, '') // Remove asterisks for bold/italics
    .replace(/\$/g, '') // Remove dollar signs for math mode
    .replace(/\\text\{([^}]+)\}/g, '$1') // Handle \text{...}
    .replace(/\\mathbf\{([^}]+)\}/g, '$1') // Handle \mathbf{...}
    .replace(/_\{([^}]+)\}/g, '$1') // Handle _{...} subscripts
    .replace(/_(\d+)/g, '$1') // Handle simple subscripts like H_2
    .replace(/\^\{([^}]+)\}/g, '$1') // Handle ^{...} superscripts
    .replace(/\^([\d+-]+)/g, '$1') // Handle simple superscripts like ^2+
    .replace(/\\rightarrow/g, '→'); // Handle \rightarrow arrow
};


const ChatWindow: React.FC<ChatWindowProps> = ({ user, initialMessages, onClearSession, progress, onUpdateProgress, onSaveFlashcards, savedFlashcardDecks, onClose }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [isBalancerOpen, setIsBalancerOpen] = useState(false);
  const [isQuizSetupOpen, setIsQuizSetupOpen] = useState(false);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [isPracticeSetupOpen, setIsPracticeSetupOpen] = useState(false);
  const [isFlashcardSetupOpen, setIsFlashcardSetupOpen] = useState(false);
  const [activeFlashcardDeck, setActiveFlashcardDeck] = useState<FlashcardDeck | null>(null);


  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect for saving to localStorage
  useEffect(() => {
    // Don't save if it's the initial empty array before hydration
    if (messages.length > 0 || (initialMessages && initialMessages.length === 0)) {
        try {
            localStorage.setItem('stoichiometrix-session', JSON.stringify({ user, messages }));
        } catch (error) {
            console.error("Failed to save session to localStorage:", error);
        }
    }
  }, [messages, user, initialMessages]);


  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      try {
        const session = await createChatSession(user, messages);
        setChatSession(session);
        
        // Only send a welcome message if there's no history
        if (messages.length === 0) {
          const welcomeMessage = await session.sendMessage(`Hello, future chemist! I'm your personal stoichiometry chatbot. I'm here to help you master challenging topics like mole conversions and balancing equations.`);
          setMessages([{
            id: crypto.randomUUID(),
            text: cleanResponse(welcomeMessage),
            sender: MessageSender.BOT
          }]);
        }
      } catch (error) {
        console.error("Chat initialization failed:", error);
        addMessage("Sorry, I'm having trouble connecting right now. Please try again in a moment.", MessageSender.BOT);
      } finally {
        setIsLoading(false);
      }
    };
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only re-init if the user changes (e.g. new session)

  const addMessage = (text: string, sender: MessageSender, options: Partial<Message> = {}) => {
    const newMessage: Message = { 
        id: crypto.randomUUID(), 
        text, 
        sender, 
        ...options 
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async (messageText: string = input, displayText?: string) => {
    if (!messageText.trim() || !chatSession || isLoading) return;

    addMessage(displayText ?? messageText, MessageSender.USER);
    setInput('');
    setIsLoading(true);
    
    const thinkingMessageId = crypto.randomUUID();
    addMessage('...', MessageSender.BOT, { id: thinkingMessageId });

    try {
      let responseText = await chatSession.sendMessage(messageText);
      
      let quiz: { questions: QuizQuestion[] } | null = null;
      let vizData: VisualizationData | null = null;
      
      const vizJsonMatch = responseText.match(/%%VIZ_JSON%%([\s\S]*)%%VIZ_JSON%%/);
      if (vizJsonMatch && vizJsonMatch[1]) {
        try {
          vizData = JSON.parse(vizJsonMatch[1].trim());
          responseText = responseText.replace(vizJsonMatch[0], '').trim();
        } catch (e) {
          console.warn('Failed to parse visualization JSON:', e);
        }
      }

      const quizJsonMatch = responseText.match(/```json([\s\S]*)```/);
      if (quizJsonMatch && quizJsonMatch[1]) {
        try {
            quiz = JSON.parse(quizJsonMatch[1].trim());
        } catch (e) {
            console.warn('Failed to parse JSON from markdown block:', e);
        }
      } else {
        try {
            const trimmedResponse = responseText.trim();
            if (trimmedResponse.startsWith('{') || trimmedResponse.startsWith('[')) {
              quiz = JSON.parse(trimmedResponse);
            }
        } catch (e) {
            // Not a raw JSON response.
        }
      }

      if (quiz && quiz.questions && quiz.questions.length > 0) {
            const quizData: QuizData = {
                questions: quiz.questions,
                currentQuestionIndex: 0,
                userAnswers: [],
                isFinished: false,
            };
            setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId)); // Remove "..."
            addMessage(`Starting your quiz now. Good luck!`, MessageSender.BOT, { quiz: quizData });
            return; 
      }
      
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessageId ? { ...msg, text: cleanResponse(responseText), visualizationData: vizData ?? undefined } : msg
      ));
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessageId ? { ...msg, text: "Sorry, I'm having trouble connecting." } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizRequest = async (difficulty: QuizDifficulty, count: number) => {
    setIsQuizSetupOpen(false);
    addMessage(`Generating your ${difficulty} quiz with ${count} questions...`, MessageSender.SYSTEM);
    setIsLoading(true);
    
    const quizData = await generateQuiz(difficulty, `${count}`);
    if (quizData) {
      addMessage(
        `Here is your ${difficulty} quiz! Good luck, ${user.nickname}!`,
        MessageSender.BOT,
        { quiz: quizData }
      );
    } else {
      addMessage("Sorry, I couldn't create a quiz right now. Please try again later.", MessageSender.BOT);
    }
    setIsLoading(false);
  };
  
  const handleQuizAnswer = (messageId: string, answer: string) => {
    setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const msgIndex = newMessages.findIndex(m => m.id === messageId);
        if (msgIndex === -1 || !newMessages[msgIndex].quiz) return prevMessages;

        const quizData = newMessages[msgIndex].quiz!;
        const newAnswers = [...quizData.userAnswers, answer];
        const nextQuestionIndex = quizData.currentQuestionIndex + 1;
        const isFinished = nextQuestionIndex >= quizData.questions.length;

        const updatedQuizData: QuizData = {
          ...quizData,
          userAnswers: newAnswers,
          currentQuestionIndex: nextQuestionIndex,
          isFinished: isFinished,
        };

        newMessages[msgIndex] = { ...newMessages[msgIndex], quiz: updatedQuizData };
        
        if (isFinished) {
          const correctAnswers = quizData.questions.filter((q, i) => q.answer === newAnswers[i]).length;
          const totalQuestions = quizData.questions.length;

          const detailedResults = quizData.questions.map((q, i) => ({
            question: q.question,
            userAnswer: newAnswers[i],
            correctAnswer: q.answer,
          }));

          const promptForAI = `I've just finished a quiz with a score of ${correctAnswers} out of ${totalQuestions}. Here are my detailed results: ${JSON.stringify(detailedResults)}. Please provide personalized feedback for ${user.nickname}. For each incorrect answer, explain why my chosen option was wrong and what makes the correct answer right. Frame your feedback in an encouraging and educational tone.`;
          const displayMessage = `Quiz complete! I scored ${correctAnswers} out of ${totalQuestions}. Let's review my answers.`;

          handleSendMessage(promptForAI, displayMessage);
        }

        return newMessages;
    });
  };
  
  const handleBalanceEquation = async (reactants: string, products: string) => {
    setIsBalancerOpen(false);
    const userMessage = `Please balance this equation for me: ${reactants} → ${products}`;
    addMessage(userMessage, MessageSender.USER);
    setIsLoading(true);

    const thinkingMessageId = crypto.randomUUID();
    addMessage('...', MessageSender.BOT, { id: thinkingMessageId });

    try {
      const balancedEquation = await balanceEquation(reactants, products);
      setMessages(prev => prev.map(msg =>
        msg.id === thinkingMessageId ? { ...msg, text: cleanResponse(balancedEquation) } : msg
      ));
    } catch (error) {
      console.error("Failed to balance equation:", error);
      setMessages(prev => prev.map(msg =>
        msg.id === thinkingMessageId ? { ...msg, text: "Sorry, I couldn't balance that equation. Please check the formulas and try again." } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConceptRequest = async (topic: string) => {
    setIsExplainerOpen(false);
    const userMessage = `Can you please explain "${topic}"?`;
    handleSendMessage(userMessage);
    onUpdateProgress(topic, 'learned');
  };
  
  const handlePracticeRequest = async (topic: string) => {
    setIsPracticeSetupOpen(false);
    addMessage(`Okay, generating a practice problem about ${topic}...`, MessageSender.SYSTEM);
    onUpdateProgress(topic, 'practiced');
    setIsLoading(true);

    const problemData = await generatePracticeProblem(topic, user);
    
    if (problemData) {
        const fullProblemData: PracticeProblemData = {
            ...problemData,
            isComplete: false,
        };
        addMessage(
            `Here's a problem for you, ${user.nickname}:`,
            MessageSender.BOT,
            { practiceProblem: fullProblemData }
        );
    } else {
        addMessage("Sorry, I couldn't generate a practice problem right now. Please try again.", MessageSender.BOT);
    }
    setIsLoading(false);
  };

  const handlePracticeAnswer = (messageId: string, userAnswer: string) => {
    setMessages(prev => {
        const newMessages = [...prev];
        const msgIndex = newMessages.findIndex(m => m.id === messageId);
        if (msgIndex === -1 || !newMessages[msgIndex].practiceProblem) return prev;

        const problemData = newMessages[msgIndex].practiceProblem!;
        const sanitize = (str: string) => str.replace(/[^0-9.]/g, '');
        const isCorrect = sanitize(userAnswer) === sanitize(problemData.answer);

        const updatedProblem: PracticeProblemData = {
            ...problemData,
            isComplete: true,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
        };
        
        newMessages[msgIndex] = { ...newMessages[msgIndex], practiceProblem: updatedProblem };
        
        if (isCorrect) {
            addMessage(`That's correct! Nicely done, ${user.nickname}!`, MessageSender.BOT);
        } else {
            const promptForAI = `My user, ${user.nickname}, tried to solve a practice problem.
            Problem: "${problemData.question}"
            Correct Answer: "${problemData.answer}"
            Correct Solution Steps: "${problemData.solution}"
            User's Incorrect Answer: "${userAnswer}"
            Please analyze their incorrect answer. Explain their likely mistake in a helpful and encouraging way, guiding them through the correct solution steps.`;

            handleSendMessage(promptForAI, `Let's take a look at your answer.`);
        }
        return newMessages;
    });
  };

  const handleFlashcardRequest = async (topic: string, count: number, useSaved: boolean) => {
    setIsFlashcardSetupOpen(false);

    if (useSaved && savedFlashcardDecks[topic]) {
        setActiveFlashcardDeck(savedFlashcardDecks[topic]);
        return;
    }

    addMessage(`Generating ${count} flashcards for "${topic}"...`, MessageSender.SYSTEM);
    setIsLoading(true);

    const cards = await generateFlashcards(topic, `${count}`);
    if (cards) {
        const newDeck: FlashcardDeck = { topic, cards };
        onSaveFlashcards(newDeck);
        setActiveFlashcardDeck(newDeck);
        addMessage(`Your flashcards are ready!`, MessageSender.BOT);
    } else {
        addMessage("Sorry, I couldn't generate flashcards right now. Please try again.", MessageSender.BOT);
    }
    setIsLoading(false);
  };

  const activeQuiz = messages.slice().reverse().find(m => m.quiz && !m.quiz.isFinished)?.quiz;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border-2 border-black">
      <header className="flex items-center justify-between p-3 border-b-2 border-black bg-cyan-300 rounded-t-xl">
        <div className="flex items-center">
            <StoichiometryIcon className="w-8 h-8 mr-3 text-black" />
            <h2 className="text-xl font-bold text-black">STOICHIOMETRIX</h2>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2 border-2 border-green-700"></span>
                <span className="font-semibold text-green-800 hidden sm:inline">Online</span>
            </div>
            <button
              onClick={onClearSession}
              className="p-2 text-black bg-white rounded-full hover:bg-slate-100 transition-colors border-2 border-black"
              aria-label="Start new session"
            >
              <RefreshIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-black bg-white rounded-full hover:bg-slate-100 transition-colors border-2 border-black"
              aria-label="Back to home"
            >
              <HomeIcon className="w-5 h-5" />
            </button>
        </div>
      </header>
      
      {activeQuiz && (
        <QuizProgressBar current={activeQuiz.currentQuestionIndex} total={activeQuiz.questions.length} />
      )}

      {isQuizSetupOpen && (
        <QuizSetup 
          onStart={handleQuizRequest}
          onClose={() => setIsQuizSetupOpen(false)}
        />
      )}
      
      {isBalancerOpen && (
        <EquationBalancer 
          onBalance={handleBalanceEquation}
          onClose={() => setIsBalancerOpen(false)}
        />
      )}

      {isExplainerOpen && (
        <ConceptExplainer 
          onExplain={handleConceptRequest}
          onClose={() => setIsExplainerOpen(false)}
          progress={progress}
        />
      )}

      {isPracticeSetupOpen && (
        <PracticeSetup
            onStart={handlePracticeRequest}
            onClose={() => setIsPracticeSetupOpen(false)}
            progress={progress}
        />
      )}

      {isFlashcardSetupOpen && (
        <FlashcardSetup
            onStart={handleFlashcardRequest}
            onClose={() => setIsFlashcardSetupOpen(false)}
            savedDecks={savedFlashcardDecks}
        />
      )}

      {activeFlashcardDeck && (
        <FlashcardViewer
            deck={activeFlashcardDeck}
            onClose={() => setActiveFlashcardDeck(null)}
        />
      )}

      <div className="flex-1 p-4 overflow-y-auto bg-cyan-100 custom-scrollbar">
        {messages.map((msg) => (
          <MessageComponent 
            key={msg.id} 
            message={msg}
            onQuizAnswer={handleQuizAnswer}
            onPracticeAnswer={handlePracticeAnswer}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t-2 border-black bg-white rounded-b-xl">
        <form
          className="flex items-center gap-1 sm:gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <button
            type="button"
            onClick={() => setIsExplainerOpen(true)}
            disabled={isLoading}
            className="p-2.5 bg-white rounded-full text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 border-black flex-shrink-0"
            aria-label="Explain a concept"
          >
            <BookIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsPracticeSetupOpen(true)}
            disabled={isLoading}
            className="p-2.5 bg-white rounded-full text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 border-black flex-shrink-0"
            aria-label="Start a practice problem"
          >
            <PracticeIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsFlashcardSetupOpen(true)}
            disabled={isLoading}
            className="p-2.5 bg-white rounded-full text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 border-black flex-shrink-0"
            aria-label="Study flashcards"
          >
            <FlashcardIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsQuizSetupOpen(true)}
            disabled={isLoading}
            className="p-2.5 bg-white rounded-full text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 border-black flex-shrink-0"
            aria-label="Start a quiz"
          >
            <QuizIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsBalancerOpen(true)}
            disabled={isLoading}
            className="p-2.5 bg-white rounded-full text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 border-black flex-shrink-0"
            aria-label="Open equation balancer"
          >
            <BalanceIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "Thinking..." : "Type your message..."}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400 text-black placeholder-slate-500 border-2 border-black"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-white rounded-full text-black hover:bg-slate-100 disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors border-2 border-black"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;