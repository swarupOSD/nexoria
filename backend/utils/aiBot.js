import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/User.js';

let genAI = null;

// Initialize if key is available
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export const getBotUser = async () => {
  let botUser = await User.findOne({ email: 'bot@nexoria.com' });
  if (!botUser) {
    botUser = await User.create({
      name: 'Nexoria Bot',
      username: 'nexoriabot',
      email: 'bot@nexoria.com',
      password: 'StrongBotPassword123!',
      role: 'superadmin',
      profileImage: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png', // Robot icon
      bio: 'I am the official Nexoria AI Assistant.',
      chatNameColor: '#00f2fe',
      profileBorder: 'neon',
      auraRank: 'Legend',
      isVerified: true,
      badges: ['aura_legend']
    });
  }
  return botUser;
};

export const generateBotResponse = async (prompt) => {
  if (!genAI) {
    return "I am currently running in offline mode. Please ask the Creator to add a Gemini API Key to wake up my AI brain!";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const promptText = `You are Nexoria Bot, the official AI assistant for Nexoria. Your tone should be a perfect blend of Gen Z energy (using modern slang naturally) and high-level professionalism (respectful, extremely helpful, and clear). Be concise. Don't use markdown formatting, just plain text with emojis. User says: ${prompt}`;
    const result = await model.generateContent(promptText);
    const response = await result.response;
    return response.text().trim() || "Hmm, I don't know what to say to that.";
  } catch (error) {
    console.error('AI Error:', error);
    return "Oops, my circuits got fried while thinking. Try again later!";
  }
};
