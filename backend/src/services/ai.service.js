const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_for_init');

const verifyAnswerWithAI = async (questionContent, answerContent) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key_for_init') {
    return { status: 'flagged', suggestion: 'AI Service currently disabled (No API Key).' };
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
      return { status: 'flagged', suggestion: 'AI could not definitively verify.' };
    }
  } catch (error) {
    console.error('AI Verification Error:', error);
    return { status: 'flagged', suggestion: 'AI verification failed or unavailable' };
  }
};

const generateInsights = async (questions) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key_for_init') return "AI Service currently disabled (No API Key).";
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const questionText = questions.map(q => q.title).join('\n');
    const prompt = `Analyze these recent employee questions to identify knowledge gaps and trends. 
Please structure your response in Markdown with EXACTLY these three sections:

### 1. Knowledge Gap Analysis
Identify specific areas where employees are struggling repeatedly (e.g., repeated Docker-related queries indicating a need for training or documentation improvement).

### 2. Auto-FAQ Generator
Summarize the most important and frequently asked questions into a structured internal FAQ format (Question and short Answer summary).

### 3. Trending Topics Detection
Detect spikes in specific topics or issues to highlight emerging technical or operational concerns.

Questions Data:
${questionText}`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('AI Insights Error:', error);
    let availableModels = 'Could not fetch available models.';
    try {
      if (process.env.GEMINI_API_KEY) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        if (response.ok) {
          const data = await response.json();
          const names = data.models?.map(m => m.name.replace('models/', '')).join(', ');
          if (names) availableModels = names;
        }
      }
    } catch (e) {}
    
    return `Failed to generate insights. Error: ${error.message}. 
    
Available Models for your API Key: ${availableModels}

Please update the code in \`backend/src/services/ai.service.js\` to use one of these models.`;
  }
};

module.exports = { verifyAnswerWithAI, generateInsights };
