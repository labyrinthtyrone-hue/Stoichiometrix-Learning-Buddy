import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ChatWindow from './components/ChatWindow';
import LandingPage from './components/LandingPage';
import { User, Message, ProgressState, FlashcardDeck } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[] | undefined>(undefined);
  const [progress, setProgress] = useState<ProgressState>({});
  const [flashcardDecks, setFlashcardDecks] = useState<{ [topic: string]: FlashcardDeck }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLaunched, setIsChatLaunched] = useState(false);

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('stoichiometrix-session');
      if (savedSession) {
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
      localStorage.removeItem('stoichiometrix-session');
    } finally {
      setIsLoading(false);
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
    setIsChatLaunched(false);
  };
  
  if (isLoading) {
    return null;
  }

  return (
    <>
      {!isChatLaunched ? (
        <LandingPage onLaunch={() => setIsChatLaunched(true)} />
      ) : (
        <div className="w-screen h-screen sm:p-8 flex items-center justify-center">
            <div className="w-full h-full max-w-lg mx-auto flex flex-col">
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
                  onClose={() => setIsChatLaunched(false)}
                />
              )}
            </div>
        </div>
      )}
    </>
  );
};

export default App;