const API_BASE = 'http://localhost:5000/api';

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // User Profile & Preferences
  getPreferences: async () => {
    const res = await fetch(`${API_BASE}/preferences`);
    return res.json();
  },
  savePreferences: async (prefs) => {
    const res = await fetch(`${API_BASE}/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs)
    });
    return res.json();
  },

  // Multilingual AAC
  getAACData: async (lang = 'en') => {
    const res = await fetch(`${API_BASE}/aac/data?lang=${lang}`);
    return res.json();
  },

  // Blind Accessibility (OCR & Vision AI)
  extractOCR: async (base64Image) => {
    const res = await fetch(`${API_BASE}/ocr/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });
    return res.json();
  },
  describeScene: async (base64Image) => {
    const res = await fetch(`${API_BASE}/vision/describe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });
    return res.json();
  },

  // Deaf Accessibility & Sign Language
  getSignVocabulary: async () => {
    const res = await fetch(`${API_BASE}/sign/vocabulary`);
    return res.json();
  },
  recognizeSign: async (base64Frame) => {
    const res = await fetch(`${API_BASE}/sign/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Frame })
    });
    return res.json();
  },
  saveSign: async (signData) => {
    const res = await fetch(`${API_BASE}/signs/saved`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signData)
    });
    return res.json();
  },
  getSavedSigns: async () => {
    const res = await fetch(`${API_BASE}/signs/saved`);
    return res.json();
  },

  // Adaptive Learning & Redesigned Quiz Generator
  getLearningMaterials: async () => {
    const res = await fetch(`${API_BASE}/learning/materials`);
    return res.json();
  },
  uploadLearningMaterial: async (material) => {
    const res = await fetch(`${API_BASE}/learning/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(material)
    });
    return res.json();
  },
  simplifyContent: async (text, ageGroup = 'college', language = 'en') => {
    const res = await fetch(`${API_BASE}/learning/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, age_group: ageGroup, language })
    });
    return res.json();
  },
  generateQuiz: async (topic, difficulty = 'Medium', numQuestions = 5, ageGroup = 'college') => {
    const res = await fetch(`${API_BASE}/learning/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        difficulty,
        num_questions: numQuestions,
        age_group: ageGroup
      })
    });
    return res.json();
  },
  submitQuiz: async (payload) => {
    const res = await fetch(`${API_BASE}/learning/submit-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Academic Performance & Analytics
  getAcademicAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/academic`);
    return res.json();
  },

  // AI Assistant Tutor
  chatAssistant: async (message, context) => {
    const res = await fetch(`${API_BASE}/learning/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });
    return res.json();
  },

  // Help & Feedback
  submitFeedback: async (feedbackData) => {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });
    return res.json();
  },
  getFeedbacks: async () => {
    const res = await fetch(`${API_BASE}/feedback`);
    return res.json();
  }
};
