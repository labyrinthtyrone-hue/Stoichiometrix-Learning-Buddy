import { GoogleGenAI, Chat, GenerateContentResponse, Type, Content } from "@google/genai";
import { User, ChatSession, QuizData, QuizQuestion, PracticeProblemData, Message, MessageSender, Flashcard } from '@/types';

// Per guidelines, API key must be from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Per guidelines, use gemini-2.5-flash for basic text tasks
const model = 'gemini-2.5-flash';

// Per guidelines, define a response schema for JSON output
const quizSchema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        description: "An array of quiz questions.",
        items: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "The question text."
            },
            options: {
              type: Type.ARRAY,
              description: "An array of 4 multiple-choice options.",
              items: { type: Type.STRING }
            },
            answer: {
              type: Type.STRING,
              description: "The correct answer, which must be one of the options."
            }
          },
          required: ["question", "options", "answer"]
        }
      }
    },
    required: ["questions"]
};

const practiceProblemSchema = {
    type: Type.OBJECT,
    properties: {
        question: {
            type: Type.STRING,
            description: "A word problem related to a specific stoichiometry topic."
        },
        answer: {
            type: Type.STRING,
            description: "The final numerical answer, including units. Example: '58.44 g/mol' or '2.5 moles'."
        },
        solution: {
            type: Type.STRING,
            description: "A detailed, step-by-step explanation of how to solve the problem."
        }
    },
    required: ["question", "answer", "solution"]
};

const flashcardSchema = {
    type: Type.OBJECT,
    properties: {
        flashcards: {
            type: Type.ARRAY,
            description: "An array of flashcards.",
            items: {
                type: Type.OBJECT,
                properties: {
                    term: {
                        type: Type.STRING,
                        description: "The key term, concept, or formula name (the 'front' of the card)."
                    },
                    definition: {
                        type: Type.STRING,
                        description: "The definition, explanation, or formula (the 'back' of the card)."
                    }
                },
                required: ["term", "definition"]
            }
        }
    },
    required: ["flashcards"]
};


export const createChatSession = async (user: User, history: Message[] = []): Promise<ChatSession> => {
  const systemInstruction = `You are Stoichiometrix, an expert AI tutor specializing in high school chemistry, with a focus on stoichiometry. Your user is ${user.nickname}, who is ${user.age} years old.
  - Your primary goal is to teach stoichiometry concepts in an engaging, encouraging, and easy-to-understand manner.
  - Adapt your explanations to be suitable for a ${user.age}-year-old. Use analogies and real-world examples.
  - Be friendly and personable. Address the user by their nickname, ${user.nickname}.
  - Strict Topic Limitation: Your knowledge and purpose are strictly limited to stoichiometry and closely related high school chemistry topics (e.g., chemical reactions, molar mass, the mole concept). If ${user.nickname} asks a question outside of this domain (e.g., about history, art, general math, or personal opinions), you MUST politely decline to answer and gently redirect them back to chemistry. For example: "That's an interesting question, ${user.nickname}, but my expertise is focused on chemistry. Shall we get back to stoichiometry? I can help with balancing equations or calculating theoretical yield." Do not attempt to answer off-topic questions.
  - Error Correction: When ${user.nickname} makes a mistake while solving a problem, do not just say they are wrong. Instead, pinpoint the specific step or calculation that is incorrect. Clearly explain *why* it's a mistake and gently guide them toward the correct method. For example, say "That's a good try, ${user.nickname}! It looks like you might have used the molar mass for oxygen atoms (O) instead of oxygen gas (O2). Remember, oxygen is diatomic..."
  - Practice Problem Feedback: When the user answers a practice problem incorrectly, you will receive the original problem, the correct solution, the correct answer, and the user's incorrect answer. Your task is to analyze their answer, identify their likely mistake, and provide a clear, step-by-step explanation guiding them to the correct solution. Be encouraging and focus on the learning process.
  - Quiz Feedback: When the user finishes a quiz and you receive their detailed results, provide a summary of their performance. For EACH question they answered incorrectly, provide a clear explanation for why their chosen answer was wrong and why the correct answer is right. Be encouraging and suggest topics to review based on their mistakes.
  - Data Visualizations: For concepts that involve comparisons or sequential steps, you can generate a visualization.
    - For comparisons (e.g., theoretical vs. actual yield), generate a bar chart.
    - For step-by-step processes (e.g., mole conversion steps), generate a flow diagram.
    - To do this, embed a special JSON block in your response, wrapped like this: %%VIZ_JSON%%{...}%%VIZ_JSON%%.
    - The JSON must have a 'type' ('barChart' or 'flowDiagram') and a 'data' object.
    - Bar Chart JSON format: { "type": "barChart", "title": "Chart Title", "data": [{ "label": "Label A", "value": 10, "color": "#a78bfa" }, { "label": "Label B", "value": 8, "color": "#67e8f9" }] }
    - Flow Diagram JSON format: { "type": "flowDiagram", "title": "Conversion Steps", "steps": ["Start with Grams", "Use Molar Mass", "Get Moles"] }
    - IMPORTANT: The main text of your response should still explain the concept clearly. The JSON is for visual enhancement only.
  - NEVER wrap your JSON quiz response in markdown.
  - You can balance chemical equations. When the user asks to balance an equation, explain the result clearly.
  - Keep your responses concise and focused.`;

  const geminiHistory: Content[] = history
    .filter(m => m.sender === MessageSender.USER || m.sender === MessageSender.BOT)
    .map(m => ({
        role: m.sender === MessageSender.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));

  const chat = ai.chats.create({
    model: model,
    history: geminiHistory,
    config: {
      systemInstruction: systemInstruction,
    },
  });

  const sendMessage = async (message: string): Promise<string> => {
    try {
      const result: GenerateContentResponse = await chat.sendMessage({ message });
      return result.text;
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      return "Sorry, I encountered an error. Please try again.";
    }
  };

  return { chat, sendMessage };
};


export const generateQuiz = async (difficulty: string, count: string = '5'): Promise<QuizData | null> => {
    try {
        const prompt = `Generate a ${difficulty} quiz with ${count} multiple-choice questions about stoichiometry. Each question must have exactly 4 options.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const quiz = JSON.parse(jsonText) as { questions: QuizQuestion[] };
        
        if (quiz.questions && quiz.questions.length > 0) {
            return {
                questions: quiz.questions,
                currentQuestionIndex: 0,
                userAnswers: [],
                isFinished: false,
            };
        }
        return null;
    } catch (error) {
        console.error("Error generating quiz:", error);
        return null;
    }
};

export const generatePracticeProblem = async (topic: string, user: User): Promise<Omit<PracticeProblemData, 'isComplete'> | null> => {
    try {
        const prompt = `Generate a 'normal' difficulty stoichiometry practice problem about "${topic}" suitable for a ${user.age}-year-old. The problem should require a calculation.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: practiceProblemSchema,
            },
        });

        const jsonText = response.text.trim();
        const problem = JSON.parse(jsonText) as { question: string; answer: string; solution: string; };
        
        if (problem.question && problem.answer && problem.solution) {
            return problem;
        }
        return null;
    } catch (error) {
        console.error("Error generating practice problem:", error);
        return null;
    }
};

export const generateFlashcards = async (topic: string, count: string): Promise<Flashcard[] | null> => {
    try {
        const prompt = `Generate ${count} flashcards for the stoichiometry topic: "${topic}". For each card, provide a key 'term' and a concise 'definition'. The term could be a concept, formula, or vocabulary word. The definition should be clear and for a high school student to understand.`;
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: flashcardSchema,
            },
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText) as { flashcards: Flashcard[] };
        
        if (data.flashcards && data.flashcards.length > 0) {
            return data.flashcards;
        }
        return null;
    } catch (error) {
        console.error("Error generating flashcards:", error);
        return null;
    }
};

export const balanceEquation = async (reactants: string, products: string): Promise<string> => {
    try {
        const prompt = `Balance the chemical equation: ${reactants} -> ${products}. Explain the steps to balance it clearly.`;
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error balancing equation:", error);
        return "Sorry, I couldn't balance that equation. Please check the chemical formulas.";
    }
};

export const getConceptualExplanation = async (topic: string, user: User): Promise<string> => {
    try {
        const prompt = `As an expert chemistry tutor, explain the concept of "${topic}" to ${user.nickname}, who is ${user.age} years old. 
        Keep the explanation clear, concise, and easy to understand. 
        Start with a simple definition, then provide a relatable analogy or real-world example.
        Do not ask any follow-up questions, just provide the explanation.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting conceptual explanation:", error);
        return `Sorry, I had trouble explaining "${topic}". Please try again.`;
    }
};