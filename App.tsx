import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ChatWindow from './components/ChatWindow';
import { User, Message, ProgressState, FlashcardDeck } from './types';
import { StoichiometryIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[] | undefined>(undefined);
  const [progress, setProgress] = useState<ProgressState>({});
  const [flashcardDecks, setFlashcardDecks] = useState<{ [topic: string]: FlashcardDeck }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLaunched, setIsChatLaunched] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('stoichiometrix-session');
      if (savedSession) {
        // If a session exists, the widget has been used before.
        // Show the FAB for returning users.
        setIsChatLaunched(true);

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
    const handleLaunch = () => {
      setIsChatLaunched(true);
      setIsChatOpen(true);
    };
    
    // Listen for the custom event dispatched by the button in index.html
    document.addEventListener('launch-chat', handleLaunch);

    return () => {
      document.removeEventListener('launch-chat', handleLaunch);
    };
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
  
  const toggleChat = () => setIsChatOpen(prev => !prev);

  if (isLoading) {
    return null; // Don't render anything until session is loaded
  }

  // If the chat has not been launched via the main button (and no session exists),
  // render nothing. The component is effectively invisible until the user acts.
  if (!isChatLaunched) {
    return null;
  }

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
