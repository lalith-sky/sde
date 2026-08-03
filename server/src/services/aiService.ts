import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import logger from '../utils/logger';

export interface AIAnalysisResult {
  pageTitle: string;
  url: string;
  summary: string;
  detectedTexts: string[];
  confidence: number;
}

// Convert local file to Generative AI Part
const fileToGenerativePart = (filePath: string, mimeType: string) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
      mimeType,
    },
  };
};

// Real Gemini Visual Analysis
const runGeminiAnalysis = async (
  filePath: string,
  mimeType: string,
  hintTitle: string,
  hintUrl: string,
  apiKey: string
): Promise<AIAnalysisResult> => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imagePart = fileToGenerativePart(filePath, mimeType);
    
    const prompt = `
      Analyze this screenshot from a user's browser.
      We know the tab title is: "${hintTitle}" and URL is: "${hintUrl}".
      
      Extract the following details and return them strictly in JSON format.
      Do not include any Markdown formatting, backticks (e.g. \`\`\`json), or preamble. Return ONLY raw JSON.

      Schema:
      {
        "pageTitle": "string (the actual visual header or page title)",
        "url": "string (the page URL - use "${hintUrl}" if not visible)",
        "summary": "string (a descriptive 1-2 sentence summary of what the user is doing on this page)",
        "detectedTexts": ["string (list of 5-15 main visible text elements, headings, buttons, or terms on the screen)"],
        "confidence": number (float between 0.0 and 1.0 based on how clear the text/UI is)
      }
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text().trim();

    // Clean up code blocks if the model wrapped the JSON
    if (text.startsWith('```')) {
      text = text.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }

    const json = JSON.parse(text);
    return {
      pageTitle: json.pageTitle || hintTitle || 'Unknown Page',
      url: json.url || hintUrl || '',
      summary: json.summary || `Viewing ${hintTitle || 'a web page'}.`,
      detectedTexts: Array.isArray(json.detectedTexts) ? json.detectedTexts : [],
      confidence: typeof json.confidence === 'number' ? json.confidence : 0.9,
    };
  } catch (error) {
    logger.error(`Error in Gemini AI analysis: ${(error as Error).message}`);
    throw error;
  }
};

// Context-aware Mock visual analyzer
const runMockAnalysis = async (
  hintTitle: string,
  hintUrl: string
): Promise<AIAnalysisResult> => {
  // Wait short time to simulate network lag
  await new Promise((resolve) => setTimeout(resolve, 500));

  const urlLower = (hintUrl || '').toLowerCase();
  
  if (urlLower.includes('github.com')) {
    return {
      pageTitle: hintTitle || 'GitHub - Repository Dashboard',
      url: hintUrl,
      summary: 'User is interacting with code repositories on GitHub, reviewing file changes or commits.',
      detectedTexts: [
        'Repositories',
        'Pull Requests',
        'Issues',
        'Marketplace',
        'Explore',
        'main branch',
        'commits',
        'README.md',
        'Clone or Download',
      ],
      confidence: 0.98,
    };
  }

  if (urlLower.includes('youtube.com')) {
    return {
      pageTitle: hintTitle || 'YouTube - Video Feed',
      url: hintUrl,
      summary: 'User is streaming a video or browsing recommendations on YouTube.',
      detectedTexts: [
        'Search',
        'Home',
        'Subscriptions',
        'History',
        'Your Videos',
        'Watch Later',
        'Like',
        'Share',
        'Subscribe',
      ],
      confidence: 0.95,
    };
  }

  if (urlLower.includes('stackoverflow.com')) {
    return {
      pageTitle: hintTitle || 'Stack Overflow - Developer Q&A',
      url: hintUrl,
      summary: 'User is researching programming solutions or reading software documentation.',
      detectedTexts: [
        'Stack Overflow',
        'Questions',
        'Tags',
        'Users',
        'Search',
        'Ask Question',
        'Accepted Answer',
        'votes',
      ],
      confidence: 0.97,
    };
  }

  if (urlLower.includes('google.com')) {
    return {
      pageTitle: hintTitle || 'Google Search',
      url: hintUrl,
      summary: 'User is running a search query on Google Search.',
      detectedTexts: [
        'Google',
        'Google Search',
        'I\'m Feeling Lucky',
        'Images',
        'Maps',
        'Sign In',
        'Settings',
      ],
      confidence: 0.99,
    };
  }

  // Generic Mock Fallback
  return {
    pageTitle: hintTitle || 'Active Web Page',
    url: hintUrl,
    summary: `User is active on '${hintTitle || 'a web page'}' browsing content.`,
    detectedTexts: [
      'Navigation Menu',
      'Dashboard',
      'Sign In',
      'Register',
      'Footer Links',
      'Primary Header',
      'Content Body',
    ],
    confidence: 0.85,
  };
};

export const analyzeScreen = async (
  filePath: string,
  mimeType: string,
  hintTitle: string,
  hintUrl: string,
  userGeminiKey?: string
): Promise<AIAnalysisResult> => {
  // Prioritize user-provided key, then environment key
  const apiKey = userGeminiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    logger.info('Performing real Gemini Multimodal analysis...');
    try {
      return await runGeminiAnalysis(filePath, mimeType, hintTitle, hintUrl, apiKey);
    } catch (err) {
      logger.warn(`Gemini analysis failed, falling back to Mock: ${(err as Error).message}`);
      return runMockAnalysis(hintTitle, hintUrl);
    }
  } else {
    logger.info('No Gemini API key detected. Running Mock visual analysis...');
    return runMockAnalysis(hintTitle, hintUrl);
  }
};
