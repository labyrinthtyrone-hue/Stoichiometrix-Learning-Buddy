import React from 'react';
import { BookIcon, PracticeIcon, QuizIcon, BalanceIcon, FlashcardIcon, UserIcon } from './IconComponents';

interface LandingPageProps {
  onLaunch: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  return (
    <div className="container mx-auto p-6 md:p-8">
      <header className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent leading-tight">
          Stuck on Stoichiometry?
        </h1>
        <p className="text-xl text-slate-600 mt-4 max-w-2xl mx-auto">
          Meet <span className="font-bold text-violet-500">Stoichiometrix</span>, your personal AI tutor designed to make chemistry clear, engaging, and fun.
        </p>
      </header>
      
      <main>
        {/* What is Stoichiometrix? Section */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">What is Stoichiometrix?</h2>
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-slate-200 text-center border-t-4 border-violet-400">
            <p className="text-slate-700 leading-relaxed text-lg">
              Stoichiometrix is an intelligent chatbot created to help you conquer the challenges of high school chemistry. It's more than just a calculator; it's a patient and interactive learning partner that provides personalized guidance, step-by-step explanations, and instant feedback, 24/7.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">Everything You Need to Succeed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Feature Card: Explanations */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-slate-200 flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="bg-cyan-100 p-3 rounded-full mb-4">
                 <BookIcon className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-slate-800">Conceptual Explanations</h3>
              <p className="text-slate-600 text-sm">Get clear, easy-to-understand explanations for complex topics like the mole concept, limiting reactants, and more.</p>
            </div>
            
            {/* Feature Card: Practice Problems */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-slate-200 flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="bg-violet-100 p-3 rounded-full mb-4">
                <PracticeIcon className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-slate-800">Practice Problems</h3>
              <p className="text-slate-600 text-sm">Solve a variety of problems and get instant feedback with detailed, step-by-step solutions to guide you.</p>
            </div>
            
            {/* Feature Card: Quizzes */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-slate-200 flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <QuizIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-slate-800">Interactive Quizzes</h3>
              <p className="text-slate-600 text-sm">Test your knowledge with quizzes on different topics and difficulty levels to track your progress.</p>
            </div>

            {/* Feature Card: Balancer */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-slate-200 flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                 <BalanceIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-slate-800">Equation Balancer</h3>
              <p className="text-slate-600 text-sm">Input any chemical equation and get the balanced result in seconds, along with an explanation of how it's done.</p>
            </div>

            {/* Feature Card: Flashcards */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-slate-200 flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="bg-yellow-100 p-3 rounded-full mb-4">
                 <FlashcardIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-slate-800">Flashcard Decks</h3>
              <p className="text-slate-600 text-sm">Generate and study flashcards for key terms, definitions, and formulas to reinforce your memory.</p>
            </div>

             {/* Feature Card: Personalized */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-slate-200 flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="bg-indigo-100 p-3 rounded-full mb-4">
                <UserIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-slate-800">Personalized Learning</h3>
              <p className="text-slate-600 text-sm">The chatbot adapts its teaching style based on your age and progress, providing a truly customized learning experience.</p>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="text-center bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white p-10 rounded-lg shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Master Stoichiometry?</h2>
          <p className="text-lg mb-6 max-w-xl mx-auto">
            Click the button below to launch your personal AI tutor and start your first lesson with Stoichiometrix now!
          </p>
          <button onClick={onLaunch} className="bg-white text-violet-600 font-bold py-4 px-8 rounded-full text-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-lg">
            Launch Stoichiometrix Tutor
          </button>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
