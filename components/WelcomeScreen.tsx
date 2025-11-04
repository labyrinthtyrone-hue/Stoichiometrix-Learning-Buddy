import React, { useState } from 'react';
import { StoichiometryIcon } from './IconComponents';

interface WelcomeScreenProps {
  onSetupComplete: (nickname: string, age: number) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSetupComplete }) => {
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    if (!nickname.trim()) {
      setError('Please enter a nickname.');
      return;
    }
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 100) {
      setError('Please enter a valid age (5-100).');
      return;
    }
    setError('');
    onSetupComplete(nickname, ageNum);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-2xl p-8 shadow-lg border-2 border-black">
      <div className="text-center">
        <StoichiometryIcon className="w-20 h-20 mx-auto mb-6 text-black" />
        <h2 className="text-4xl font-bold mb-3">Hello!</h2>
        <p className="text-slate-600 mb-8 max-w-xs">
          I am your Stoichiometry Buddy. To get started, what is your nickname and age?
        </p>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <div className="mb-4">
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="shadow-inner appearance-none border-2 border-black rounded-full w-full py-3 px-5 bg-white text-black leading-tight focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Nickname"
          />
        </div>
        <div className="mb-8">
          <input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="shadow-inner appearance-none border-2 border-black rounded-full w-full py-3 px-5 bg-white text-black leading-tight focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Age"
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="bg-violet-400 hover:bg-violet-500 text-white font-bold py-3 px-8 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Start Learning...
          </button>
        </div>
      </form>
    </div>
  );
};

export default WelcomeScreen;
