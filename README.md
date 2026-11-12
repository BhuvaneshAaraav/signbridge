# UNIACCESS AI
> **Tagline:** *One Platform. Every Ability. Equal Opportunity.*

UNIACCESS AI is an all-in-one AI-powered accessibility and adaptive learning platform designed to empower individuals with diverse physical, sensory, and cognitive abilities across all age groups:
- 👁️ **Blind and low-vision individuals** (OCR document reading, AI scene descriptions, voice guidance)
- 🧏 **Deaf and hard-of-hearing individuals** (Multilingual speech captions, MediaPipe Indian Sign Language tracking, verified sign library)
- 🗣️ **Non-speaking individuals** (Multilingual AAC picture board, sentence strip builder, voice synthesizer in English, Hindi, and Kannada)
- ♿ **Individuals with motor disabilities** (High-contrast focus rings, large accessible targets, keyboard navigation)
- 📖 **Individuals with dyslexia & neurodivergence** (OpenDyslexic typography, AI concept simplification, analogies)
- 🎓 **Learners across all age groups** (Children, Teenagers, College Students, Adults, and Seniors)

---

## 🚀 Key Modules & Demonstrations

### 1. Indian Sign Language (ISL) & Universal Gesture Recognition
- **MediaPipe HandLandmarker Integration:** Powered by Google's `hand_landmarker.task` LiteRT model extracting 21 normalized 3D keypoints per hand.
- **10 Predefined Verified Gestures Supported:**
  1. 🙏 `NAMASTE` — Traditional Indian greeting / Hello (two hands together or upright flat palm)
  2. 🤝 `THANK_YOU` — Flat hand at chest tilted forward in appreciation
  3. 👍 `YES` — Closed fist with thumb pointing upright
  4. 👎 `NO` — Closed fist with thumb pointing down or index finger shake
  5. 💧 `WATER` — Three fingers extended in 'W' shape
  6. 👌 `GOOD` — Super / OK ring (thumb and index touching into a circle)
  7. 🍽️ `EAT` — Food / Dining (fingertips clustered together towards mouth)
  8. 🆘 `HELP` — Raised closed fist signalling urgent attention
  9. ✌️ `PEACE` — Victory V-sign (index and middle fingers extended)
  10. ✋ `STOP` — Flat palm facing camera directly
- **Features:** Clear / Reset button, real-time sign-to-text transcript stream, unknown gesture guidance, 1-click test cards for every gesture, and permanent SQLite sign history.
- *Scientific Scope:* Specifically recognizes the 10 verified gestures; does not claim full continuous ISL grammar translation.

### 2. Multilingual Audio Support (English • हिन्दी • ಕನ್ನಡ)
- **Language Selection:** Switch between English, Hindi, and Kannada on the fly without restarting.
- **Speech-to-Text (STT):** Live captions transcribe speech in `en-IN`, `hi-IN`, or `kn-IN`.
- **Text-to-Speech (TTS):** Synthesizes natural speech using matched regional voices (`hi-IN`, `kn-IN`, `en-IN`) with adjustable speech rate (`0.5x` to `2.0x`).
- **Multilingual AAC Communication Board:** Picture cards and everyday phrases translated into English, Hindi, and Kannada with native voice playback.

### 3. Redesigned Adaptive Quiz Engine
- **Any Subject or Topic:** Enter any subject (e.g. *Physics*, *Indian History*, *Python*, *Machine Learning*).
- **Difficulty Selection:** Choose between `Easy`, `Medium`, and `Hard`.
- **Question Count:** Select `3`, `5`, `8`, or `10` questions.
- **Gemini AI + Fallback Generator:** Generates 4-option multiple-choice questions with answer keys and in-depth explanations.
- **Instant Scoring & Review:** Evaluates answers automatically, highlights correct and incorrect options, and saves attempts permanently in SQLite.
- **Retry Feature:** One-click retry to retake the quiz or generate new questions.

### 4. Age-Group Adapted Learning
- **5 Age Profiles:**
  - 🧒 *Children (5–12):* Playful analogies, joyful tone, visual flashcards.
  - 🧑 *Teenagers (13–17):* Relatable examples, dynamic interactive challenges.
  - 🎓 *College Students (18–25):* Intellectual depth, academic rigor.
  - 💼 *Adults (26–64):* Applied concepts, flexible study pacing.
  - 👵 *Seniors (65+):* High legibility, calm pacing, step-by-step clarity.

### 5. Permanent SQLite Data Storage
- **Database:** SQLite (`backend/uniaccess.db`)
- **Tables:**
  - `user_preferences`: Profile mode, age group, language, contrast, font size.
  - `quizzes`: Subject, difficulty, questions JSON, created timestamp.
  - `quiz_attempts`: Subject, difficulty, score, total, percentage, user answers, AI recommendations.
  - `saved_signs`: Captured gestures and timestamps.
  - `feedback`: User feedback, categories, 1–5 star ratings, bug reports.
  - `document_scans`: Scanned OCR document text and summaries.
- Data persists across browser refreshes, server restarts, and machine reboots.

### 6. Academic Performance & Analytics
- **Subject-Wise Marks Comparison:** Interactive Chart.js comparative bar chart showing average marks per subject.
- **Progress Over Time:** Chart.js trend line curve tracking comprehension milestones.
- **Metrics:** Highest and lowest scoring disciplines, overall average score, total attempts.
- **Trend Indicators:** Shows improvement (`+X%`) or decline (`-X%`) compared with previous attempts.
- **Weak Topics & Revision Roadmaps:** Highlights subjects scoring below target proficiency and provides targeted revision actions.

### 7. Help & Feedback (Replaced Emergency Section)
- **Step-by-Step How-To Guides:** Walkthroughs for Blind OCR, Deaf Captions & ISL, AAC Board, and Analytics.
- **Frequently Asked Questions (FAQ):** Accordion explaining all capabilities and settings.
- **Feedback & Bug Submission:** Interactive 5-star rating, category selection (Bug Report, Feature Suggestion, Accessibility Request), message submission.
- **Permanent SQLite Storage:** All feedback is logged in SQLite and displayed in the community feedback log.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Chart.js, `react-chartjs-2` |
| **Backend** | Python 3.13, Flask, Flask-CORS, SQLite3 |
| **AI / LLM** | Google Gemini 2.5 Flash (`google-genai` official SDK) |
| **Computer Vision** | MediaPipe Tasks (`HandLandmarker`), OpenCV (`opencv-python`) |
| **Speech APIs** | Multilingual Web Speech API (Synthesis & Recognition: `en-IN`, `hi-IN`, `kn-IN`) |

---

## ⚡ Quick Start Guide

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python database.py
python app.py
```
*The backend server runs at `http://localhost:5000`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --host
```
*The frontend runs at `http://localhost:5173`.*

---

## 🔑 Environment Variables
Configure in `backend/.env`:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=5000
FLASK_ENV=development
```
*Note: If no API key is specified, the platform runs with its built-in offline adaptive engine.*
