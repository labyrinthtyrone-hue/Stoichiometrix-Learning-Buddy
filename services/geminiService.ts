import { GoogleGenAI, Chat, GenerateContentResponse, Type, Content } from "@google/genai";
import { User, ChatSession, QuizData, PracticeProblemData, Message, MessageSender, Flashcard } from '../types';

let ai: GoogleGenAI;

function getAi() {
    if (!ai) {
        // Per guidelines, API key must be from process.env.API_KEY
        // This will only be called when a function needs the AI service,
        // preventing a crash on app load if the key is missing.
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    }
    return ai;
}

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
  - Grounded Answers: For complex questions or topics related to current events or recent scientific discoveries, use your Google Search tool to find up-to-date, accurate information. When you use search, you MUST cite your sources.
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

  const geminiHistoryFromMessages: Content[] = history
    .filter(m => (m.sender === MessageSender.USER || m.sender === MessageSender.BOT) && typeof m.text === 'string')
    .map(m => ({
        role: m.sender === MessageSender.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));

  // Per Gemini API rules, the chat history must start with a 'user' role and alternate correctly.
  const sanitizedHistory: Content[] = [];
  const firstUserIndex = geminiHistoryFromMessages.findIndex(m => m.role === 'user');

  if (firstUserIndex !== -1) {
    // Start from the first user message.
    const historySlice = geminiHistoryFromMessages.slice(firstUserIndex);
    
    // Ensure the roles are alternating.
    if (historySlice.length > 0) {
      let expectedRole: 'user' | 'model' = 'user';
      for (const message of historySlice) {
        if (message.role === expectedRole) {
          sanitizedHistory.push(message);
          expectedRole = (expectedRole === 'user') ? 'model' : 'user';
        } else {
          // If alternation is broken, truncate the history at that point.
          break;
        }
      }
    }
  }

  // The Gemini API requires that the history provided to start a chat must end with a 'model' turn.
  // If the last message is from the user, it means the app was likely closed before the model could respond.
  // We remove the last user message to restore a valid chat state.
  if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === 'user') {
    sanitizedHistory.pop();
  }

  const chat: Chat = getAi().chats.create({
    model: model,
    history: sanitizedHistory,
    config: {
      systemInstruction: systemInstruction,
      tools: [{googleSearch: {}}],
    },
  });

  const sendMessage = async (message: string): Promise<GenerateContentResponse> => {
    const response = await chat.sendMessage({ message });
    return response;
  };

  return { chat, sendMessage };
};


export const generateQuiz = async (difficulty: string, count: string = '5'): Promise<QuizData | null> => {
    try {
        const systemInstruction = "You are an AI assistant that generates quizzes. Your exclusive focus is on stoichiometry for high school chemistry.";
        const prompt = `Generate a JSON object for a ${difficulty} quiz about stoichiometry with exactly ${count} multiple-choice questions. Each question must have 4 options. The JSON object must match this schema: ${JSON.stringify(quizSchema)}`;

        const response: GenerateContentResponse = await getAi().models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });

        const jsonText = response.text.trim();
        const quiz = JSON.parse(jsonText);
        
        if (quiz && quiz.questions && quiz.questions.length > 0) {
            return {
                questions: quiz.questions,
                currentQuestionIndex: 0,
                userAnswers: [],
                isFinished: false,
            };
        }
        return null;
    } catch (error) {
        console.error("Failed to generate quiz:", error);
        return null;
    }
};

export const balanceEquation = async (reactants: string, products: string): Promise<string> => {
    const prompt = `Balance the following chemical equation: ${reactants} -> ${products}. Provide only the balanced equation, and then on a new line, briefly explain the balancing process.`;
    const response = await getAi().models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
};

export const getConceptualExplanation = async (topic: string, user: User): Promise<string> => {
    const prompt = `My user, ${user.nickname} (${user.age} years old), wants to understand the concept of "${topic}" in stoichiometry. Explain it to them in a clear, simple, and encouraging way. Use an analogy if it helps.`;
    const response = await getAi().models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
};

export const generatePracticeProblem = async (topic: string, user: User): Promise<PracticeProblemData | null> => {
    try {
        const systemInstruction = `You are an AI assistant that generates stoichiometry practice problems for a ${user.age}-year-old user named ${user.nickname}.`;
        const prompt = `Generate a single word problem about "${topic}". The problem should be challenging but solvable for a high school student. Provide the question, the final numerical answer with units, and a detailed step-by-step solution. The JSON object must match this schema: ${JSON.stringify(practiceProblemSchema)}`;
        
        const response = await getAi().models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: practiceProblemSchema,
            },
        });

        const data = JSON.parse(response.text.trim());
        return data as PracticeProblemData;

    } catch (error) {
        console.error("Failed to generate practice problem:", error);
        return null;
    }
};

export const generateFlashcards = async (topic: string, count: string = '10'): Promise<Flashcard[] | null> => {
    try {
        const systemInstruction = "You are an AI assistant that generates flashcards for studying high school chemistry, specifically stoichiometry.";
        const prompt = `Generate a JSON object containing ${count} flashcards about "${topic}". Each card should have a "term" and a "definition". The JSON object must match this schema: ${JSON.stringify(flashcardSchema)}`;

        const response = await getAi().models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: flashcardSchema,
            },
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);

        if (data && data.flashcards) {
            return data.flashcards;
        }
        return null;

    } catch (error) {
        console.error("Failed to generate flashcards:", error);
        return null;
    }
};