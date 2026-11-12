import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'uniaccess.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # User accessibility profile & preferences
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE DEFAULT 'default_user',
        primary_mode TEXT DEFAULT 'general',
        age_group TEXT DEFAULT 'college',
        preferred_language TEXT DEFAULT 'en',
        high_contrast INTEGER DEFAULT 0,
        large_font INTEGER DEFAULT 0,
        font_style TEXT DEFAULT 'inter',
        speech_rate REAL DEFAULT 1.0,
        speech_pitch REAL DEFAULT 1.0,
        auto_read_aloud INTEGER DEFAULT 0,
        screen_reader_friendly INTEGER DEFAULT 1,
        captions_enabled INTEGER DEFAULT 1,
        keyboard_shortcuts_enabled INTEGER DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Migration check for existing databases
    cursor.execute("PRAGMA table_info(user_preferences)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'age_group' not in columns:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN age_group TEXT DEFAULT 'college'")
    if 'preferred_language' not in columns:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN preferred_language TEXT DEFAULT 'en'")

    # Educational lessons & materials
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS learning_materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT DEFAULT 'Medium',
        original_text TEXT NOT NULL,
        simplified_text TEXT,
        key_takeaways TEXT,
        audio_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Quizzes table with subject and difficulty
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        material_id INTEGER,
        subject TEXT NOT NULL DEFAULT 'General',
        difficulty TEXT NOT NULL DEFAULT 'Medium',
        title TEXT NOT NULL,
        questions_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Migration for quizzes table if subject or difficulty missing
    cursor.execute("PRAGMA table_info(quizzes)")
    quiz_cols = [col[1] for col in cursor.fetchall()]
    if 'subject' not in quiz_cols:
        cursor.execute("ALTER TABLE quizzes ADD COLUMN subject TEXT DEFAULT 'General'")
    if 'difficulty' not in quiz_cols:
        cursor.execute("ALTER TABLE quizzes ADD COLUMN difficulty TEXT DEFAULT 'Medium'")

    # Student quiz attempts & progress tracking
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER,
        user_id TEXT DEFAULT 'default_user',
        subject TEXT NOT NULL DEFAULT 'General',
        difficulty TEXT NOT NULL DEFAULT 'Medium',
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        percentage REAL NOT NULL,
        user_answers_json TEXT,
        recommendations TEXT,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    cursor.execute("PRAGMA table_info(quiz_attempts)")
    attempt_cols = [col[1] for col in cursor.fetchall()]
    if 'subject' not in attempt_cols:
        cursor.execute("ALTER TABLE quiz_attempts ADD COLUMN subject TEXT DEFAULT 'General'")
    if 'difficulty' not in attempt_cols:
        cursor.execute("ALTER TABLE quiz_attempts ADD COLUMN difficulty TEXT DEFAULT 'Medium'")
    if 'user_answers_json' not in attempt_cols:
        cursor.execute("ALTER TABLE quiz_attempts ADD COLUMN user_answers_json TEXT")

    # Feedback and Support logs
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT DEFAULT 'default_user',
        name TEXT,
        category TEXT NOT NULL,
        rating INTEGER NOT NULL DEFAULT 5,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'SUBMITTED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Saved Signs & Custom Phrases
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS saved_signs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT DEFAULT 'default_user',
        sign_code TEXT NOT NULL,
        sign_label TEXT NOT NULL,
        icon TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS custom_phrases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT DEFAULT 'default_user',
        text TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Document Scans metadata
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS document_scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT DEFAULT 'default_user',
        title TEXT NOT NULL,
        extracted_text TEXT NOT NULL,
        summary TEXT,
        word_count INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Seed default user preferences
    cursor.execute('''
    INSERT OR IGNORE INTO user_preferences (user_id, primary_mode, age_group, preferred_language, high_contrast, large_font, font_style, speech_rate)
    VALUES ('default_user', 'general', 'college', 'en', 0, 0, 'inter', 1.0)
    ''')

    # Seed initial subject quizzes and attempts if empty for rich initial analytics
    cursor.execute("SELECT COUNT(*) FROM quiz_attempts")
    attempt_count = cursor.fetchone()[0]
    if attempt_count == 0:
        initial_records = [
            ("Science", "Medium", 4, 5, 80.0, "Great understanding of scientific principles."),
            ("Mathematics", "Hard", 3, 5, 60.0, "Focus on algebraic formula practice."),
            ("Computer Science", "Easy", 5, 5, 100.0, "Outstanding programming fundamentals!"),
            ("History", "Medium", 3, 4, 75.0, "Review key chronological events."),
            ("English Literature", "Easy", 4, 5, 80.0, "Good comprehension of prose."),
            ("Mathematics", "Medium", 4, 5, 80.0, "Improvement noticed in problem solving!")
        ]
        for subj, diff, sc, tot, pct, rec in initial_records:
            cursor.execute('''
            INSERT INTO quiz_attempts (quiz_id, user_id, subject, difficulty, score, total, percentage, recommendations)
            VALUES (1, 'default_user', ?, ?, ?, ?, ?, ?)
            ''', (subj, diff, sc, tot, pct, json.dumps({"encouragement": rec})))

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database schema successfully upgraded and verified.")
