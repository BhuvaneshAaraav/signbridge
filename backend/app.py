import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from database import init_db, get_db
from gemini_service import gemini_service
from cv_sign import sign_recognizer, SIGN_VOCABULARY
from ocr_service import ocr_service

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

init_db()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "app": "UNIACCESS AI",
        "tagline": "One Platform. Every Ability. Equal Opportunity.",
        "gemini_active": gemini_service.api_available,
        "mediapipe_active": sign_recognizer.detector is not None,
        "supported_languages": ["en", "hi", "kn"]
    })

# ==========================================
# 1. USER PROFILE & ACCESSIBILITY PREFERENCES
# ==========================================
@app.route('/api/preferences', methods=['GET', 'POST'])
def handle_preferences():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.json or {}
        primary_mode = data.get('primary_mode', 'general')
        age_group = data.get('age_group', 'college')
        preferred_language = data.get('preferred_language', 'en')
        high_contrast = 1 if data.get('high_contrast') else 0
        large_font = 1 if data.get('large_font') else 0
        font_style = data.get('font_style', 'inter')
        speech_rate = float(data.get('speech_rate', 1.0))
        speech_pitch = float(data.get('speech_pitch', 1.0))
        auto_read_aloud = 1 if data.get('auto_read_aloud') else 0
        screen_reader_friendly = 1 if data.get('screen_reader_friendly', True) else 0
        captions_enabled = 1 if data.get('captions_enabled', True) else 0
        keyboard_shortcuts = 1 if data.get('keyboard_shortcuts_enabled', True) else 0

        cursor.execute('''
        INSERT INTO user_preferences (
            user_id, primary_mode, age_group, preferred_language, high_contrast,
            large_font, font_style, speech_rate, speech_pitch, auto_read_aloud,
            screen_reader_friendly, captions_enabled, keyboard_shortcuts_enabled, updated_at
        ) VALUES ('default_user', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
            primary_mode=excluded.primary_mode,
            age_group=excluded.age_group,
            preferred_language=excluded.preferred_language,
            high_contrast=excluded.high_contrast,
            large_font=excluded.large_font,
            font_style=excluded.font_style,
            speech_rate=excluded.speech_rate,
            speech_pitch=excluded.speech_pitch,
            auto_read_aloud=excluded.auto_read_aloud,
            screen_reader_friendly=excluded.screen_reader_friendly,
            captions_enabled=excluded.captions_enabled,
            keyboard_shortcuts_enabled=excluded.keyboard_shortcuts_enabled,
            updated_at=CURRENT_TIMESTAMP
        ''', (primary_mode, age_group, preferred_language, high_contrast, large_font,
              font_style, speech_rate, speech_pitch, auto_read_aloud,
              screen_reader_friendly, captions_enabled, keyboard_shortcuts))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Preferences saved permanently to SQLite."})

    cursor.execute('SELECT * FROM user_preferences WHERE user_id = "default_user"')
    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify({
            "primary_mode": row["primary_mode"],
            "age_group": row["age_group"] or "college",
            "preferred_language": row["preferred_language"] or "en",
            "high_contrast": bool(row["high_contrast"]),
            "large_font": bool(row["large_font"]),
            "font_style": row["font_style"],
            "speech_rate": row["speech_rate"],
            "speech_pitch": row["speech_pitch"],
            "auto_read_aloud": bool(row["auto_read_aloud"]),
            "screen_reader_friendly": bool(row["screen_reader_friendly"]),
            "captions_enabled": bool(row["captions_enabled"]),
            "keyboard_shortcuts_enabled": bool(row["keyboard_shortcuts_enabled"])
        })

    return jsonify({
        "primary_mode": "general",
        "age_group": "college",
        "preferred_language": "en",
        "high_contrast": False,
        "large_font": False,
        "font_style": "inter",
        "speech_rate": 1.0,
        "speech_pitch": 1.0,
        "auto_read_aloud": False,
        "screen_reader_friendly": True,
        "captions_enabled": True,
        "keyboard_shortcuts_enabled": True
    })

# ==========================================
# 2. MULTILINGUAL AAC COMMUNICATION BOARD
# ==========================================
@app.route('/api/aac/data', methods=['GET'])
def get_aac_data():
    lang = request.args.get('lang', 'en')
    catalog = {
        "categories": [
            {
                "id": "essentials",
                "name": {"en": "Essentials & Needs", "hi": "आवश्यक जरूरतें", "kn": "ಅಗತ್ಯ ಅಗತ್ಯಗಳು"},
                "icon": "⚡",
                "items": [
                    {
                        "id": "e1",
                        "label": {"en": "Yes", "hi": "हाँ (Haan)", "kn": "ಹೌದು (Haudu)"},
                        "icon": "✅",
                        "speech": {"en": "Yes, I agree.", "hi": "हाँ, मैं सहमत हूँ।", "kn": "ಹೌದು, ನಾನು ಒಪ್ಪುತ್ತೇನೆ."}
                    },
                    {
                        "id": "e2",
                        "label": {"en": "No", "hi": "नहीं (Nahi)", "kn": "ಇಲ್ಲ (Illa)"},
                        "icon": "❌",
                        "speech": {"en": "No, thank you.", "hi": "नहीं, धन्यवाद।", "kn": "ಇಲ್ಲ, ಧನ್ಯವಾದಗಳು."}
                    },
                    {
                        "id": "e3",
                        "label": {"en": "Water", "hi": "पानी (Paani)", "kn": "ನೀರು (Neeru)"},
                        "icon": "💧",
                        "speech": {"en": "I need drinking water please.", "hi": "मुझे पीने का पानी चाहिए।", "kn": "ದಯವಿಟ್ಟು ನನಗೆ ಕುಡಿಯುವ ನೀರು ಬೇಕು."}
                    },
                    {
                        "id": "e4",
                        "label": {"en": "Food / Hungry", "hi": "खाना / भूख (Khaana)", "kn": "ಊಟ / ಹಸಿವು (Oota)"},
                        "icon": "🍎",
                        "speech": {"en": "I am hungry and need food.", "hi": "मुझे भूख लगी है और खाना चाहिए।", "kn": "ನನಗೆ ಹಸಿವಾಗಿದೆ, ಊಟ ಬೇಕು."}
                    },
                    {
                        "id": "e5",
                        "label": {"en": "Restroom", "hi": "शौचालय (Shauchalay)", "kn": "ಶೌಚಾಲಯ (Shouchalaya)"},
                        "icon": "🚻",
                        "speech": {"en": "I need to use the restroom.", "hi": "मुझे शौचालय जाना है।", "kn": "ನಾನು ಶೌಚಾಲಯಕ್ಕೆ ಹೋಗಬೇಕು."}
                    },
                    {
                        "id": "e6",
                        "label": {"en": "Help", "hi": "मदद (Madad)", "kn": "ಸಹಾಯ (Sahaaya)"},
                        "icon": "🆘",
                        "speech": {"en": "Please help me.", "hi": "कृपया मेरी मदद करें।", "kn": "ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ."}
                    }
                ]
            },
            {
                "id": "feelings",
                "name": {"en": "Emotions & Feelings", "hi": "भावनाएं और अहसास", "kn": "ಭಾವನೆಗಳು ಮತ್ತು ಅನುಭವ"},
                "icon": "😊",
                "items": [
                    {
                        "id": "f1",
                        "label": {"en": "Happy", "hi": "खुश (Khush)", "kn": "ಸಂತೋಷ (Santosha)"},
                        "icon": "😄",
                        "speech": {"en": "I feel happy and comfortable.", "hi": "मैं खुश और सहज महसूस कर रहा हूँ।", "kn": "ನಾನು ಸಂತೋಷವಾಗಿದ್ದೇನೆ."}
                    },
                    {
                        "id": "f2",
                        "label": {"en": "Tired", "hi": "थका हुआ (Thaka)", "kn": "ಆಯಾಸ (Aayasa)"},
                        "icon": "😴",
                        "speech": {"en": "I am feeling tired and need rest.", "hi": "मैं थका हुआ हूँ और मुझे आराम चाहिए।", "kn": "ನನಗೆ ಆಯಾಸವಾಗಿದೆ, ವಿಶ್ರಾಂತಿ ಬೇಕು."}
                    },
                    {
                        "id": "f3",
                        "label": {"en": "In Pain", "hi": "दर्द में (Dard)", "kn": "ನೋವು (Novu)"},
                        "icon": "🤕",
                        "speech": {"en": "I am experiencing pain.", "hi": "मुझे दर्द हो रहा है।", "kn": "ನನಗೆ ನೋವಾಗುತ್ತಿದೆ."}
                    },
                    {
                        "id": "f4",
                        "label": {"en": "Confused", "hi": "असमंजस (Confused)", "kn": "ಗೊಂದಲ (Gondala)"},
                        "icon": "🤔",
                        "speech": {"en": "I feel confused, could you explain?", "hi": "मुझे समझ नहीं आया, क्या आप समझा सकते हैं?", "kn": "ನನಗೆ ಗೊಂದಲವಾಗಿದೆ, ದಯವಿಟ್ಟು ವಿವರಿಸುವಿರಾ?"}
                    },
                    {
                        "id": "f5",
                        "label": {"en": "Excited", "hi": "उत्साहित (Utsaahit)", "kn": "ಉತ್ಸಾಹ (Utsaaha)"},
                        "icon": "🎉",
                        "speech": {"en": "I am very excited about this!", "hi": "मैं इसके लिए बहुत उत्साहित हूँ!", "kn": "ನನಗೆ ತುಂಬಾ ಉತ್ಸಾಹವಾಗಿದೆ!"}
                    },
                    {
                        "id": "f6",
                        "label": {"en": "Peaceful", "hi": "शांत (Shaant)", "kn": "ಶಾಂತ (Shaanta)"},
                        "icon": "🕊️",
                        "speech": {"en": "I feel calm and peaceful.", "hi": "मैं शांत महसूस कर रहा हूँ।", "kn": "ನಾನು ಶಾಂತವಾಗಿದ್ದೇನೆ."}
                    }
                ]
            },
            {
                "id": "school",
                "name": {"en": "Study & Classroom", "hi": "अध्ययन और कक्षा", "kn": "ಅಧ್ಯಯನ ಮತ್ತು ತರಗತಿ"},
                "icon": "📚",
                "items": [
                    {
                        "id": "s1",
                        "label": {"en": "Repeat", "hi": "दोहराएं (Repeat)", "kn": "ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ (Repeat)"},
                        "icon": "🔁",
                        "speech": {"en": "Please repeat that once more.", "hi": "कृपया एक बार फिर से दोहराएं।", "kn": "ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ."}
                    },
                    {
                        "id": "s2",
                        "label": {"en": "More Time", "hi": "थोड़ा समय (More Time)", "kn": "ಇನ್ನಷ್ಟು ಸಮಯ (More Time)"},
                        "icon": "⏳",
                        "speech": {"en": "I need a few more moments.", "hi": "मुझे थोड़ा और समय चाहिए।", "kn": "ನನಗೆ ಇನ್ನಷ್ಟು ಸಮಯ ಬೇಕು."}
                    },
                    {
                        "id": "s3",
                        "label": {"en": "Take Quiz", "hi": "प्रश्नोत्तरी दें (Quiz)", "kn": "ರಸಪ್ರಶ್ನೆ ತೆಗೆದುಕೊಳ್ಳಿ (Quiz)"},
                        "icon": "📝",
                        "speech": {"en": "I am ready to start the quiz.", "hi": "मैं प्रश्नोत्तरी शुरू करने के लिए तैयार हूँ।", "kn": "ನಾನು ರಸಪ್ರಶ್ನೆ ಪ್ರಾರಂಭಿಸಲು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ."}
                    },
                    {
                        "id": "s4",
                        "label": {"en": "Read Aloud", "hi": "बोलकर सुनाएं (Read Aloud)", "kn": "ಓದಿ ಹೇಳಿ (Read Aloud)"},
                        "icon": "🔊",
                        "speech": {"en": "Please read this lesson aloud.", "hi": "कृपया इस पाठ को बोलकर सुनाएं।", "kn": "ದಯವಿಟ್ಟು ಈ ಪಾಠವನ್ನು ಓದಿ ಹೇಳಿ."}
                    },
                    {
                        "id": "s5",
                        "label": {"en": "I Understand", "hi": "समझ गया (Understood)", "kn": "ಅರ್ಥವಾಯಿತು (Arthaayitu)"},
                        "icon": "💡",
                        "speech": {"en": "I understand this clearly.", "hi": "मैं इसे अच्छी तरह समझ गया हूँ।", "kn": "ನನಗೆ ಇದು ಸ್ಪಷ್ಟವಾಗಿ ಅರ್ಥವಾಯಿತು."}
                    },
                    {
                        "id": "s6",
                        "label": {"en": "Doubt / Question", "hi": "संदेह (Doubt)", "kn": "ಪ್ರಶ್ನೆ (Prashne)"},
                        "icon": "❓",
                        "speech": {"en": "I have a question about this.", "hi": "मेरा इस पर एक प्रश्न है।", "kn": "ನನಗೆ ಇದರ ಬಗ್ಗೆ ಒಂದು ಪ್ರಶ್ನೆಯಿದೆ."}
                    }
                ]
            },
            {
                "id": "social",
                "name": {"en": "Greetings & Respect", "hi": "अभिवादन और शिष्टाचार", "kn": "ಶುಭಾಶಯಗಳು ಮತ್ತು ವಂದನೆ"},
                "icon": "💬",
                "items": [
                    {
                        "id": "g1",
                        "label": {"en": "Namaste / Hello", "hi": "नमस्ते (Namaste)", "kn": "ನಮಸ್ಕಾರ (Namaskara)"},
                        "icon": "🙏",
                        "speech": {"en": "Namaste and warm greetings!", "hi": "नमस्ते! आपका दिन शुभ हो।", "kn": "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ದಿನ ಶುಭವಾಗಲಿ."}
                    },
                    {
                        "id": "g2",
                        "label": {"en": "Thank You", "hi": "धन्यवाद (Dhanyavaad)", "kn": "ಧನ್ಯವಾದಗಳು (Dhanyavaadagalu)"},
                        "icon": "🤝",
                        "speech": {"en": "Thank you very much for your support.", "hi": "आपकी सहायता के लिए बहुत-बहुत धन्यवाद।", "kn": "ನಿಮ್ಮ ಬೆಂಬಲಕ್ಕಾಗಿ ತುಂಬಾ ಧನ್ಯವಾದಗಳು."}
                    },
                    {
                        "id": "g3",
                        "label": {"en": "Good Morning", "hi": "शुभ प्रभात (Good Morning)", "kn": "ಶುಭೋದಯ (Shubhodaya)"},
                        "icon": "🌅",
                        "speech": {"en": "Good morning, wishing you a great day.", "hi": "शुभ प्रभात, आपका दिन मंगलमय हो।", "kn": "ಶುಭೋದಯ, ಶುಭ ದಿನವಾಗಲಿ."}
                    },
                    {
                        "id": "g4",
                        "label": {"en": "Good Job", "hi": "शाबाश (Shabaash)", "kn": "ಉತ್ತಮ ಕೆಲಸ (Uttama Kelasa)"},
                        "icon": "🌟",
                        "speech": {"en": "You did a wonderful job!", "hi": "आपने बहुत बढ़िया काम किया!", "kn": "ನೀವು ಅದ್ಭುತವಾಗಿ ಮಾಡಿದ್ದೀರಿ!"}
                    },
                    {
                        "id": "g5",
                        "label": {"en": "Excuse Me", "hi": "माफ़ कीजिये (Excuse Me)", "kn": "ಕ್ಷಮಿಸಿ (Kshamisi)"},
                        "icon": "🙋",
                        "speech": {"en": "Excuse me, may I say something?", "hi": "माफ़ कीजिये, क्या मैं कुछ कह सकता हूँ?", "kn": "ಕ್ಷಮಿಸಿ, ನಾನು ಏನಾದರೂ ಹೇಳಬಹುದೇ?"}
                    },
                    {
                        "id": "g6",
                        "label": {"en": "See You Later", "hi": "फिर मिलेंगे (See You)", "kn": "ಮತ್ತೆ ಸಿಗೋಣ (Matte Sigona)"},
                        "icon": "👋",
                        "speech": {"en": "See you later, take care!", "hi": "फिर मिलेंगे, अपना ध्यान रखिये!", "kn": "ಮತ್ತೆ ಸಿಗೋಣ, ಜೋಪಾನ!"}
                    }
                ]
            }
        ],
        "quick_phrases": {
            "en": [
                "Hello, I use UniAccess AI to communicate.",
                "Please give me a moment to compose my reply.",
                "Could you please speak a little slower?",
                "Everything is fine, thank you."
            ],
            "hi": [
                "नमस्ते, मैं संवाद करने के लिए UniAccess AI का उपयोग करता हूँ।",
                "कृपया मुझे अपना उत्तर लिखने के लिए थोड़ा समय दें।",
                "क्या आप थोड़ा धीरे बोल सकते हैं?",
                "सब कुछ ठीक है, धन्यवाद।"
            ],
            "kn": [
                "ನಮಸ್ಕಾರ, ಸಂವಹನಕ್ಕಾಗಿ ನಾನು UniAccess AI ಬಳಸುತ್ತೇನೆ.",
                "ನನ್ನ ಉತ್ತರವನ್ನು ಸಿದ್ಧಪಡಿಸಲು ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯ ನೀಡಿ.",
                "ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ನಿಧಾನವಾಗಿ ಮಾತನಾಡುವಿರಾ?",
                "ಎಲ್ಲವೂ ಚೆನ್ನಾಗಿದೆ, ಧನ್ಯವಾದಗಳು."
            ]
        }
    }
    return jsonify(catalog)

# ==========================================
# 3. BLIND ACCESSIBILITY (OCR & VISION)
# ==========================================
@app.route('/api/ocr/extract', methods=['POST'])
def extract_image_text():
    data = request.json or {}
    image_data = data.get('image')

    if not image_data and 'file' in request.files:
        file = request.files['file']
        image_data = file.read()

    if not image_data:
        return jsonify({"success": False, "error": "No image data provided"}), 400

    result = ocr_service.extract_text(image_data)

    # Store scan record permanently in SQLite
    if result.get("success") and result.get("text"):
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute('''
            INSERT INTO document_scans (user_id, title, extracted_text, summary, word_count)
            VALUES ('default_user', 'Scanned Document', ?, ?, ?)
            ''', (result["text"], result.get("method", "OCR"), result.get("word_count", len(result["text"].split()))))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error persisting scan: {e}")

    return jsonify(result)

@app.route('/api/vision/describe', methods=['POST'])
def describe_image_scene():
    data = request.json or {}
    image_data = data.get('image')

    if not image_data and 'file' in request.files:
        file = request.files['file']
        image_data = file.read()

    if not image_data:
        return jsonify({"success": False, "error": "No image data provided"}), 400

    result = gemini_service.describe_scene(image_data)
    return jsonify({"success": True, "description": result})

# ==========================================
# 4. DEAF ACCESSIBILITY & SIGN RECOGNITION
# ==========================================
@app.route('/api/sign/vocabulary', methods=['GET'])
def get_sign_vocabulary():
    return jsonify({
        "success": True,
        "vocabulary": SIGN_VOCABULARY,
        "count": len(SIGN_VOCABULARY)
    })

@app.route('/api/sign/recognize', methods=['POST'])
def recognize_sign():
    data = request.json or {}
    image_data = data.get('image')

    if not image_data:
        return jsonify({"success": False, "error": "No image frame provided"}), 400

    result = sign_recognizer.process_image(image_data)
    return jsonify(result)

@app.route('/api/signs/saved', methods=['GET', 'POST'])
def handle_saved_signs():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.json or {}
        sign_code = data.get('sign_code', 'UNKNOWN')
        sign_label = data.get('sign_label', '')
        icon = data.get('icon', '✋')

        cursor.execute('''
        INSERT INTO saved_signs (user_id, sign_code, sign_label, icon)
        VALUES ('default_user', ?, ?, ?)
        ''', (sign_code, sign_label, icon))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Sign gesture saved permanently."})

    cursor.execute('SELECT * FROM saved_signs ORDER BY id DESC LIMIT 20')
    rows = cursor.fetchall()
    conn.close()
    return jsonify([{
        "id": r["id"],
        "sign_code": r["sign_code"],
        "sign_label": r["sign_label"],
        "icon": r["icon"],
        "created_at": r["created_at"]
    } for r in rows])

# ==========================================
# 5. ADAPTIVE LEARNING & QUIZ GENERATION
# ==========================================
@app.route('/api/learning/materials', methods=['GET', 'POST'])
def handle_learning_materials():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.json or {}
        title = data.get('title', 'Study Notes')
        category = data.get('category', 'Custom')
        original_text = data.get('text', '')
        age_group = data.get('age_group', 'college')
        language = data.get('language', 'en')

        if not original_text:
            return jsonify({"success": False, "error": "Material text cannot be empty"}), 400

        simplified = gemini_service.simplify_text(original_text, age_group=age_group, language=language)
        simplified_text = simplified.get('overview', original_text)
        takeaways_json = json.dumps(simplified.get('takeaways', []))

        cursor.execute('''
        INSERT INTO learning_materials (title, category, difficulty, original_text, simplified_text, key_takeaways)
        VALUES (?, ?, 'Adaptive', ?, ?, ?)
        ''', (title, category, original_text, simplified_text, takeaways_json))
        material_id = cursor.lastrowid

        # Generate quiz questions
        quiz_questions = gemini_service.generate_quiz_for_topic(title, difficulty="Medium", num_questions=3, age_group=age_group)
        cursor.execute('''
        INSERT INTO quizzes (material_id, subject, difficulty, title, questions_json)
        VALUES (?, ?, 'Medium', ?, ?)
        ''', (material_id, category, f"Quiz: {title}", json.dumps(quiz_questions)))
        quiz_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "material_id": material_id,
            "quiz_id": quiz_id,
            "simplified": simplified,
            "quiz_questions": quiz_questions
        })

    cursor.execute('SELECT * FROM learning_materials ORDER BY id DESC')
    rows = cursor.fetchall()
    materials = []
    for r in rows:
        materials.append({
            "id": r["id"],
            "title": r["title"],
            "category": r["category"],
            "difficulty": r["difficulty"],
            "original_text": r["original_text"],
            "simplified_text": r["simplified_text"],
            "key_takeaways": json.loads(r["key_takeaways"]) if r["key_takeaways"] else []
        })
    conn.close()
    return jsonify(materials)

@app.route('/api/learning/simplify', methods=['POST'])
def simplify_content():
    data = request.json or {}
    text = data.get('text', '')
    age_group = data.get('age_group', 'college')
    language = data.get('language', 'en')

    if not text:
        return jsonify({"success": False, "error": "No text provided"}), 400

    result = gemini_service.simplify_text(text, age_group=age_group, language=language)
    return jsonify({"success": True, "simplified": result})

@app.route('/api/learning/generate-quiz', methods=['POST'])
def generate_quiz_endpoint():
    data = request.json or {}
    topic = data.get('topic') or data.get('subject') or data.get('text') or 'General Knowledge'
    difficulty = data.get('difficulty', 'Medium')
    num_questions = int(data.get('num_questions', 5))
    age_group = data.get('age_group', 'college')

    questions = gemini_service.generate_quiz_for_topic(
        topic=topic,
        difficulty=difficulty,
        num_questions=num_questions,
        age_group=age_group
    )

    # Persist the generated quiz permanently in SQLite
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO quizzes (subject, difficulty, title, questions_json)
    VALUES (?, ?, ?, ?)
    ''', (topic, difficulty, f"{topic} ({difficulty})", json.dumps(questions)))
    quiz_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "quiz_id": quiz_id,
        "subject": topic,
        "difficulty": difficulty,
        "questions": questions
    })

@app.route('/api/learning/submit-quiz', methods=['POST'])
def submit_quiz():
    data = request.json or {}
    quiz_id = data.get('quiz_id', 1)
    subject = data.get('subject', 'General')
    difficulty = data.get('difficulty', 'Medium')
    score = int(data.get('score', 0))
    total = int(data.get('total', 5))
    user_answers = data.get('user_answers', {})

    pct = round((score / total) * 100, 1) if total > 0 else 0.0
    recommendations = gemini_service.get_adaptive_recommendations(score, total, subject)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO quiz_attempts (quiz_id, user_id, subject, difficulty, score, total, percentage, user_answers_json, recommendations)
    VALUES (?, 'default_user', ?, ?, ?, ?, ?, ?, ?)
    ''', (quiz_id, subject, difficulty, score, total, pct, json.dumps(user_answers), json.dumps(recommendations)))
    attempt_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "attempt_id": attempt_id,
        "subject": subject,
        "difficulty": difficulty,
        "score": score,
        "total": total,
        "percentage": pct,
        "recommendations": recommendations
    })

# ==========================================
# 6. ACADEMIC PERFORMANCE & ANALYTICS
# ==========================================
@app.route('/api/analytics/academic', methods=['GET'])
def get_academic_analytics():
    conn = get_db()
    cursor = conn.cursor()

    # All attempts ordered by time
    cursor.execute('''
    SELECT id, quiz_id, subject, difficulty, score, total, percentage, recommendations, completed_at
    FROM quiz_attempts
    ORDER BY id ASC
    ''')
    rows = cursor.fetchall()

    attempts = []
    subject_scores = {}

    for r in rows:
        subj = r["subject"] or "General"
        pct = float(r["percentage"])
        attempts.append({
            "id": r["id"],
            "subject": subj,
            "difficulty": r["difficulty"],
            "score": r["score"],
            "total": r["total"],
            "percentage": pct,
            "completed_at": r["completed_at"]
        })

        if subj not in subject_scores:
            subject_scores[subj] = []
        subject_scores[subj].append(pct)

    conn.close()

    # Subject-wise statistics
    subject_stats = []
    for subj, scores in subject_scores.items():
        avg = round(sum(scores) / len(scores), 1)
        latest = scores[-1]
        previous = scores[-2] if len(scores) > 1 else latest
        trend = "improved" if latest > previous else ("declined" if latest < previous else "steady")

        subject_stats.append({
            "subject": subj,
            "attempts": len(scores),
            "average": avg,
            "latest": latest,
            "trend": trend,
            "change": round(latest - previous, 1)
        })

    # Sort subject_stats by average score
    subject_stats.sort(key=lambda x: x["average"], reverse=True)

    highest_subject = subject_stats[0]["subject"] if subject_stats else "N/A"
    highest_score = subject_stats[0]["average"] if subject_stats else 0
    lowest_subject = subject_stats[-1]["subject"] if subject_stats else "N/A"
    lowest_score = subject_stats[-1]["average"] if subject_stats else 0

    # Identify weak topics (subjects where average < 70%)
    weak_topics = [s["subject"] for s in subject_stats if s["average"] < 75]
    if not weak_topics and subject_stats:
        weak_topics = [subject_stats[-1]["subject"]]

    # Recommendations for revision
    revision_recommendations = []
    for wt in weak_topics:
        revision_recommendations.append({
            "subject": wt,
            "reason": f"Average score is currently below target proficiency.",
            "action": f"Review simplified takeaways and practice Easy-difficulty quizzes in {wt}."
        })

    overall_avg = round(sum([a["percentage"] for a in attempts]) / len(attempts), 1) if attempts else 0.0

    # Chart.js Bar Chart Data: Subject Comparison
    bar_chart_data = {
        "labels": [s["subject"] for s in subject_stats] if subject_stats else ["Science", "Math", "CS", "History"],
        "datasets": [
            {
                "label": "Average Score (%)",
                "data": [s["average"] for s in subject_stats] if subject_stats else [80, 70, 95, 75],
                "backgroundColor": [
                    "rgba(99, 102, 241, 0.8)",
                    "rgba(14, 165, 233, 0.8)",
                    "rgba(16, 185, 129, 0.8)",
                    "rgba(245, 158, 11, 0.8)",
                    "rgba(236, 72, 153, 0.8)",
                    "rgba(139, 92, 246, 0.8)"
                ],
                "borderRadius": 8
            }
        ]
    }

    # Chart.js Line Chart Data: Overall Progress Timeline
    timeline_chart_data = {
        "labels": [f"Quiz #{i+1} ({a['subject']})" for i, a in enumerate(attempts[-10:])] if attempts else ["Q1", "Q2", "Q3", "Q4"],
        "datasets": [
            {
                "label": "Mastery Percentage (%)",
                "data": [a["percentage"] for a in attempts[-10:]] if attempts else [60, 75, 80, 95],
                "borderColor": "#6366f1",
                "backgroundColor": "rgba(99, 102, 241, 0.15)",
                "tension": 0.35,
                "fill": True,
                "pointBackgroundColor": "#4f46e5",
                "pointRadius": 6
            }
        ]
    }

    return jsonify({
        "success": True,
        "total_attempts": len(attempts),
        "overall_average": overall_avg,
        "highest_subject": {"name": highest_subject, "score": highest_score},
        "lowest_subject": {"name": lowest_subject, "score": lowest_score},
        "subject_stats": subject_stats,
        "weak_topics": weak_topics,
        "revision_recommendations": revision_recommendations,
        "bar_chart_data": bar_chart_data,
        "timeline_chart_data": timeline_chart_data,
        "attempts_history": list(reversed(attempts))[:15]
    })

# ==========================================
# 7. HELP & FEEDBACK (REPLACED EMERGENCY)
# ==========================================
@app.route('/api/feedback', methods=['GET', 'POST'])
def handle_feedback():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.json or {}
        name = data.get('name', 'Anonymous User').strip() or 'Anonymous User'
        category = data.get('category', 'General Feedback')
        rating = int(data.get('rating', 5))
        message = data.get('message', '').strip()

        if not message:
            return jsonify({"success": False, "error": "Feedback message cannot be empty."}), 400

        cursor.execute('''
        INSERT INTO feedback (user_id, name, category, rating, message)
        VALUES ('default_user', ?, ?, ?, ?)
        ''', (name, category, rating, message))
        feedback_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "feedback_id": feedback_id,
            "message": "Thank you! Your feedback has been recorded permanently in our SQLite database."
        })

    cursor.execute('SELECT * FROM feedback ORDER BY id DESC LIMIT 20')
    rows = cursor.fetchall()
    conn.close()

    items = [{
        "id": r["id"],
        "name": r["name"],
        "category": r["category"],
        "rating": r["rating"],
        "message": r["message"],
        "created_at": r["created_at"]
    } for r in rows]

    return jsonify({"success": True, "feedbacks": items})

# ==========================================
# 8. AI LEARNING ASSISTANT (GEMINI TUTOR)
# ==========================================
@app.route('/api/learning/assistant', methods=['POST'])
def learning_assistant():
    data = request.json or {}
    message = data.get('message', '')
    context = data.get('context', 'Inclusive assistive classroom')

    if not message:
        return jsonify({"success": False, "error": "Message is required"}), 400

    reply = gemini_service.chat_assistant(message, context)
    return jsonify({
        "success": True,
        "reply": reply
    })

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    print(f"Starting UNIACCESS AI Backend on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
