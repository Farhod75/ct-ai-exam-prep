export const CT_AI_CHAPTER_NAMES: Record<number, string> = {
  1: 'Introduction to AI',
  2: 'AI Specific Aspects of Testing',
  3: 'Machine Learning Overview',
  4: 'ML - Data',
  5: 'ML Functional Performance Metrics',
  6: 'ML Neural Networks & Testing',
  7: 'Testing AI-Based Systems Overview',
  8: 'Testing AI-Specific Quality Characteristics',
  9: 'Methods for Testing AI-Based Systems',
  10: 'Test Environments for AI-Based Systems',
  11: 'Using AI for Testing',
};

export const CT_GENAI_CHAPTER_NAMES: Record<number, string> = {
  1: 'Introduction to Generative AI for Software Testing',
  2: 'Prompt Engineering for Effective Software Testing',
  3: 'Managing Risks of Generative AI in Software Testing',
  4: 'LLM-Powered Test Infrastructure for Software Testing',
  5: 'Deploying and Integrating Generative AI in Test Organizations',
};

export function getChapterNames(certification: string): Record<number, string> {
  return certification === 'CT-GenAI' ? CT_GENAI_CHAPTER_NAMES : CT_AI_CHAPTER_NAMES;
}

export function getChapterList(certification: string) {
  const names = getChapterNames(certification);
  return Object.entries(names).map(([num, name]) => ({
    number: parseInt(num),
    name,
  }));
}

// Backward compat
export const CHAPTER_NAMES = CT_AI_CHAPTER_NAMES;
export const CHAPTER_LIST = Object.entries(CT_AI_CHAPTER_NAMES).map(([num, name]) => ({
  number: parseInt(num),
  name,
}));
