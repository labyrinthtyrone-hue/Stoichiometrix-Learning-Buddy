import { Chat, GenerateContentResponse } from "@google/genai";

export interface User {
  nickname: string;
  age: number;
}

export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system',
}

export interface BarChartData {
  type: 'barChart';
  title: string;
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
}

export interface FlowDiagramData {
    type: 'flowDiagram';
    title: string;
    steps: string[];
}

export type VisualizationData = BarChartData | FlowDiagramData;

export interface PracticeProblemData {
  question: string;
  answer: string;
  solution: string;
  isComplete: boolean;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  quiz?: QuizData;
  visualizationData?: VisualizationData;
  practiceProblem?: PracticeProblemData;
  groundingChunks?: GroundingChunk[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface QuizData {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: string[];
  isFinished: boolean;
}

export enum QuizDifficulty {
    EASY = 'Easy',
    NORMAL = 'Normal',
    HARD = 'Hard',
    EXTREME = 'Extreme'
}

export type ProgressState = {
  [topic: string]: {
    learned?: boolean;
    practiced?: boolean;
  };
};

export interface Flashcard {
  term: string;
  definition: string;
}

export interface FlashcardDeck {
  topic: string;
  cards: Flashcard[];
}

export interface ChatSession {
    chat: Chat;
    sendMessage: (message: string) => Promise<GenerateContentResponse>;
}