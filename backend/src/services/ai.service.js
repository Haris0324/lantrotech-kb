const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_for_init');

const verifyAnswerWithAI = async (questionContent, answerContent) => {
  if (!process.env.GEMINI_API_KEY) {
    return { status: 'pending', suggestion: 'Gemini API Key not configured' };
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an AI assistant for a corporate knowledge base.
Question: "${questionContent}"
Answer provided: "${answerContent}"

Please evaluate this answer.
If the answer is fully correct and comprehensive, reply with: VERIFIED
If the answer is incorrect or misleading, reply with: FLAGGED - [Explanation]
If the answer is correct but incomplete, reply with: CORRECTED - [Suggested improvement]

Respond strictly in the above format.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    if (responseText.startsWith('VERIFIED')) {
      return { status: 'verified', suggestion: '' };
    } else if (responseText.startsWith('FLAGGED')) {
      return { status: 'flagged', suggestion: responseText.replace('FLAGGED - ', '') };
    } else if (responseText.startsWith('CORRECTED')) {
      return { status: 'corrected', suggestion: responseText.replace('CORRECTED - ', '') };
    } else {
      return { status: 'pending', suggestion: 'AI could not definitively verify.' };
    }
  } catch (error) {
    console.error('AI Verification Error:', error);
    return { status: 'pending', suggestion: 'AI verification failed' };
  }
};

const generateInsights = async (questions) => {
  if (!process.env.GEMINI_API_KEY) return "AI insights unavailable.";
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const questionText = questions.map(q => q.title).join('\n');
    const prompt = `Analyze these recent employee questions to identify knowledge gaps. Provide a short summary of trending topics and areas where training might be needed.\n\nQuestions:\n${questionText}`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('AI Insights Error:', error);
    return "Failed to generate insights.";
  }
};

module.exports = { verifyAnswerWithAI, generateInsights };
