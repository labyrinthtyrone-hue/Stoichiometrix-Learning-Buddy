import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ChatWindow from './components/ChatWindow';
import { User, Message, ProgressState, FlashcardDeck } from './types';
import { StoichiometryIcon, CloseIcon } from './components/IconComponents';

const getInitialChatOpenState = (): boolean => {
  // Always start with the chat window closed.
  // The user must click the FAB or the launch button to open it.
  return false;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[] | undefined>(undefined);
  const [progress, setProgress] = useState<ProgressState>({});
  const [flashcardDecks, setFlashcardDecks] = useState<{ [topic: string]: FlashcardDeck }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(getInitialChatOpenState());

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('stoichiometrix-session');
      if (savedSession) {
        const { user: savedUser, messages: savedMessages } = JSON.parse(savedSession);
        if (savedUser && savedMessages) {
          setUser(savedUser);
          setInitialMessages(savedMessages);

          const savedProgress = localStorage.getItem(`stoichiometrix-progress-${savedUser.nickname}`);
          if (savedProgress) {
            setProgress(JSON.parse(savedProgress));
          }

          const savedFlashcards = localStorage.getItem(`stoichiometrix-flashcards-${savedUser.nickname}`);
          if (savedFlashcards) {
            setFlashcardDecks(JSON.parse(savedFlashcards));
          }
        }
      }
    } catch (error) {
      console.error("Failed to load session from localStorage:", error);
      // Clear potentially corrupted storage
      localStorage.removeItem('stoichiometrix-session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const launchButton = document.getElementById('launch-chatbot-btn');
    if (launchButton) {
      const handleLaunch = () => {
        setIsChatOpen(true);
      };
      launchButton.addEventListener('click', handleLaunch);

      return () => {
        launchButton.removeEventListener('click', handleLaunch);
      };
    }
  }, []);

  const handleUserSetup = (nickname: string, age: number) => {
    const newUser = { nickname, age };
    setUser(newUser);
    localStorage.setItem('stoichiometrix-session', JSON.stringify({ user: newUser, messages: [] }));

    const existingProgress = localStorage.getItem(`stoichiometrix-progress-${nickname}`);
    if (existingProgress) {
        setProgress(JSON.parse(existingProgress));
    } else {
        setProgress({});
        localStorage.setItem(`stoichiometrix-progress-${nickname}`, JSON.stringify({}));
    }

    const existingFlashcards = localStorage.getItem(`stoichiometrix-flashcards-${nickname}`);
    if (existingFlashcards) {
        setFlashcardDecks(JSON.parse(existingFlashcards));
    } else {
        setFlashcardDecks({});
        localStorage.setItem(`stoichiometrix-flashcards-${nickname}`, JSON.stringify({}));
    }
  };

  const handleUpdateProgress = (topic: string, type: 'learned' | 'practiced') => {
    if (!user) return;
    
    const newProgress = { ...progress };
    if (!newProgress[topic]) {
      newProgress[topic] = {};
    }
    newProgress[topic][type] = true;
    
    setProgress(newProgress);
    localStorage.setItem(`stoichiometrix-progress-${user.nickname}`, JSON.stringify(newProgress));
  };

  const handleSaveFlashcards = (deck: FlashcardDeck) => {
    if (!user) return;
    
    const newDecks = { ...flashcardDecks, [deck.topic]: deck };
    setFlashcardDecks(newDecks);
    localStorage.setItem(`stoichiometrix-flashcards-${user.nickname}`, JSON.stringify(newDecks));
  };

  const handleClearSession = () => {
    if (user) {
        localStorage.removeItem(`stoichiometrix-progress-${user.nickname}`);
        localStorage.removeItem(`stoichiometrix-flashcards-${user.nickname}`);
    }
    localStorage.removeItem('stoichiometrix-session');
    setUser(null);
    setInitialMessages(undefined);
    setProgress({});
    setFlashcardDecks({});
    // When session is cleared, keep the chat window open to show the welcome screen.
    setIsChatOpen(true); 
  };
  
  if (isLoading) {
    return null; // Don't render anything until session is loaded
  }

  const toggleChat = () => setIsChatOpen(prev => !prev);

  return (
    <div className="chatbot-widget-container">
      {isChatOpen ? (
        <div className="chat-window-container">
          {!user ? (
            <WelcomeScreen onSetupComplete={handleUserSetup} />
          ) : (
            <ChatWindow 
              user={user} 
              initialMessages={initialMessages}
              onClearSession={handleClearSession} 
              progress={progress}
              onUpdateProgress={handleUpdateProgress}
              onSaveFlashcards={handleSaveFlashcards}
              savedFlashcardDecks={flashcardDecks}
              onClose={toggleChat}
            />
          )}
        </div>
      ) : (
         <button onClick={toggleChat} className="chat-fab" aria-label="Open chat">
          <StoichiometryIcon className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};

export default App;