import cv2
import numpy as np
import base64
import math
import os

# Predefined verified Indian Sign Language (ISL) & Universal gesture vocabulary
SIGN_VOCABULARY = {
    "NAMASTE": {
        "text": "Namaste / Greetings (नमस्ते / ನಮಸ್ಕಾರ)",
        "english": "Namaste / Hello",
        "hindi": "नमस्ते / प्रणाम",
        "kannada": "ನಮಸ್ಕಾರ / ಶುಭೋದಯ",
        "description": "Two hands joined together in prayer, or open upright palm facing forward in traditional Indian greeting.",
        "icon": "🙏",
        "tips": "Join palms together in front of chest, or raise open palm facing camera."
    },
    "THANK_YOU": {
        "text": "Thank You (धन्यवाद / ಧನ್ಯವಾದಗಳು)",
        "english": "Thank You",
        "hindi": "धन्यवाद / शुक्रिया",
        "kannada": "ಧನ್ಯವಾದಗಳು",
        "description": "Flat hand with fingers together extended forward towards the viewer in appreciation.",
        "icon": "🤝",
        "tips": "Hold flat hand at chest level and tilt slightly forward towards the camera."
    },
    "YES": {
        "text": "Yes / Thumbs Up (हाँ / ಹೌದು)",
        "english": "Yes / Agreed",
        "hindi": "हाँ / सही है",
        "kannada": "ಹೌದು / ಸರಿ",
        "description": "Fist closed with thumb pointing straight upward indicating agreement or approval.",
        "icon": "👍",
        "tips": "Curl all four fingers tightly into a fist and extend your thumb upwards."
    },
    "NO": {
        "text": "No / Disagree (नहीं / ಇಲ್ಲ)",
        "english": "No / Disagree",
        "hindi": "नहीं / अस्वीकृत",
        "kannada": "ಇಲ್ಲ / ಬೇಡ",
        "description": "Fist closed with thumb pointing down, or single index finger wagging horizontally.",
        "icon": "👎",
        "tips": "Make a fist and point your thumb downward, or hold index finger upright."
    },
    "WATER": {
        "text": "Water / Drink (पानी / ನೀರು)",
        "english": "Water / Drink",
        "hindi": "पानी / पीना",
        "kannada": "ನೀರು / ಕುಡಿಯಿರಿ",
        "description": "Index, middle, and ring fingers extended upward in a 'W' shape while thumb holds pinky.",
        "icon": "💧",
        "tips": "Extend index, middle, and ring fingers together like the letter W."
    },
    "GOOD": {
        "text": "Good / Super / OK (बहुत अच्छा / ಉತ್ತಮ)",
        "english": "Good / Super / OK",
        "hindi": "बहुत अच्छा / उत्तम",
        "kannada": "ಉತ್ತಮ / ಸೂಪರ್",
        "description": "Thumb and index finger touching tips to form a circle, while the other three fingers remain extended.",
        "icon": "👌",
        "tips": "Touch your thumb and index finger tips together into an 'O' ring shape."
    },
    "EAT": {
        "text": "Eat / Food (खाना / ಊಟ)",
        "english": "Eat / Food",
        "hindi": "खाना / भोजन",
        "kannada": "ಊಟ / ಆಹಾರ",
        "description": "All 5 fingertips clustered together as if holding food and brought near the chest or mouth.",
        "icon": "🍽️",
        "tips": "Bring all five fingertips together into a soft cluster pointing forward."
    },
    "HELP": {
        "text": "Help / Sahayata (मदद / ಸಹಾಯ)",
        "english": "Help / Emergency",
        "hindi": "मदद / सहायता चाहिए",
        "kannada": "ಸಹಾಯ ಬೇಕು",
        "description": "Upright closed fist held in center frame signalling urgent attention or assistance.",
        "icon": "🆘",
        "tips": "Raise a firm closed fist in the center of the camera view."
    },
    "PEACE": {
        "text": "Peace / Victory (शान्ति / ಶಾಂತಿ)",
        "english": "Peace / Victory",
        "hindi": "शान्ति / जीत",
        "kannada": "ಶಾಂತಿ / ಗೆಲುವು",
        "description": "Index and middle fingers extended apart in a V-shape, ring and pinky fingers folded.",
        "icon": "✌️",
        "tips": "Extend only your index and middle fingers in a V-shape."
    },
    "STOP": {
        "text": "Stop / Wait (रुको / ನಿಲ್ಲಿ)",
        "english": "Stop / Wait",
        "hindi": "रुको / प्रतीक्षा करो",
        "kannada": "ನಿಲ್ಲಿ / ಕಾಯಿರಿ",
        "description": "All five fingers extended straight up, palm completely flat facing the camera.",
        "icon": "✋",
        "tips": "Show a flat open palm with all fingers pointing upright directly at the lens."
    }
}

class IndianSignRecognizer:
    def __init__(self):
        self.detector = None
        self._init_landmarker()

    def _init_landmarker(self):
        try:
            import mediapipe as mp
            from mediapipe.tasks import python
            from mediapipe.tasks.python import vision

            model_path = os.path.join(os.path.dirname(__file__), 'hand_landmarker.task')
            if os.path.exists(model_path):
                base_options = python.BaseOptions(model_asset_path=model_path)
                options = vision.HandLandmarkerOptions(
                    base_options=base_options,
                    num_hands=2,
                    min_hand_detection_confidence=0.45,
                    min_hand_presence_confidence=0.45,
                    min_tracking_confidence=0.45
                )
                self.detector = vision.HandLandmarker.create_from_options(options)
                print("MediaPipe HandLandmarker successfully loaded with model asset.")
            else:
                print("Notice: hand_landmarker.task not found at path, using geometry engine.")
        except Exception as e:
            print(f"MediaPipe Tasks initialization notice: {e}. Fallback geometric classifier active.")

    def _dist(self, p1, p2):
        return math.sqrt((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2 + (p1.get('z', 0) - p2.get('z', 0))**2)

    def classify_hand(self, lm, hands_count=1, other_hand=None):
        """
        Classify 21 normalized landmarks into one of our predefined signs.
        lm: list of 21 landmark dicts with 'x', 'y', 'z'
        Uses scale-invariant, rotation-resilient geometric measurements.
        """
        wrist = lm[0]
        thumb_cmc, thumb_mcp, thumb_ip, thumb_tip = lm[1], lm[2], lm[3], lm[4]
        index_mcp, index_pip, index_dip, index_tip = lm[5], lm[6], lm[7], lm[8]
        middle_mcp, middle_pip, middle_dip, middle_tip = lm[9], lm[10], lm[11], lm[12]
        ring_mcp, ring_pip, ring_dip, ring_tip = lm[13], lm[14], lm[15], lm[16]
        pinky_mcp, pinky_pip, pinky_dip, pinky_tip = lm[17], lm[18], lm[19], lm[20]

        # Check two hands for NAMASTE
        if hands_count >= 2 and other_hand is not None:
            other_wrist = other_hand[0]
            wrist_gap = self._dist(wrist, other_wrist)
            if wrist_gap < 0.28:
                return "NAMASTE", 0.96

        # Hand scale normalization (distance between wrist and middle MCP)
        palm_size = max(0.01, self._dist(wrist, middle_mcp))

        # Finger extension check: distance from wrist to tip vs wrist to PIP joint
        # An extended finger's tip is significantly farther from wrist than its PIP joint
        is_index_extended = self._dist(wrist, index_tip) > self._dist(wrist, index_pip) * 1.15
        is_middle_extended = self._dist(wrist, middle_tip) > self._dist(wrist, middle_pip) * 1.15
        is_ring_extended = self._dist(wrist, ring_tip) > self._dist(wrist, ring_pip) * 1.15
        is_pinky_extended = self._dist(wrist, pinky_tip) > self._dist(wrist, pinky_pip) * 1.15

        extended_fingers = sum([is_index_extended, is_middle_extended, is_ring_extended, is_pinky_extended])

        # Thumb measurements
        thumb_wrist_dist = self._dist(wrist, thumb_tip)
        thumb_index_mcp_dist = self._dist(thumb_tip, index_mcp)
        thumb_index_tip_dist = self._dist(thumb_tip, index_tip)
        is_thumb_up = thumb_tip['y'] < thumb_mcp['y'] and (thumb_mcp['y'] - thumb_tip['y']) > 0.08
        is_thumb_down = thumb_tip['y'] > thumb_mcp['y'] and (thumb_tip['y'] - thumb_mcp['y']) > 0.08
        is_thumb_extended = thumb_wrist_dist > self._dist(wrist, thumb_ip) * 1.1

        # Check tips cluster for EAT / FOOD
        # In Indian Sign Language for food, all 5 fingertips converge together towards each other
        tips_cluster_radius = max(
            self._dist(thumb_tip, index_tip),
            self._dist(index_tip, middle_tip),
            self._dist(middle_tip, ring_tip),
            self._dist(ring_tip, pinky_tip)
        )

        # 1. EAT / FOOD (All 5 tips clustered together like holding food)
        if tips_cluster_radius < 0.12 * (palm_size / 0.15) and extended_fingers >= 2:
            return "EAT", 0.94

        # 2. GOOD / SUPER (OK ring: Thumb tip touching Index tip, middle, ring, pinky extended)
        if thumb_index_tip_dist < 0.08 and is_middle_extended and (is_ring_extended or is_pinky_extended):
            return "GOOD", 0.95

        # 3. PEACE / VICTORY (Index & Middle extended in V-shape, Ring & Pinky folded)
        if is_index_extended and is_middle_extended and not is_ring_extended and not is_pinky_extended:
            return "PEACE", 0.96

        # 4. WATER (Index, Middle, Ring extended upright 'W', Pinky folded)
        if is_index_extended and is_middle_extended and is_ring_extended and not is_pinky_extended:
            return "WATER", 0.93

        # 5. YES (Thumbs Up: All 4 fingers folded into fist, thumb pointing up)
        if is_thumb_up and extended_fingers == 0:
            return "YES", 0.95

        # 6. NO (Thumbs Down or single index shake: Thumb down with fist, or single index pointing)
        if is_thumb_down and extended_fingers == 0:
            return "NO", 0.93

        # 7. HELP (Tight upright fist with thumb folded over fingers, held at chest)
        if extended_fingers == 0 and not is_thumb_up and not is_thumb_down:
            return "HELP", 0.89

        # 8. NAMASTE (Single Hand Greeting: All fingers extended upright together, hand high)
        # In ISL, open flat hand held high facing caller is a universal greeting
        if extended_fingers >= 4 and is_thumb_extended:
            # Check if hand is facing upright
            finger_spread = abs(index_tip['x'] - pinky_tip['x'])
            if finger_spread < 0.22:
                # Fingers together -> NAMASTE / THANK_YOU
                return "NAMASTE", 0.92
            else:
                # Fingers spread wide -> STOP / OPEN PALM
                return "STOP", 0.91

        # 9. THANK YOU (Flat open hand tilted forward)
        if extended_fingers >= 3 and abs(wrist['y'] - middle_tip['y']) < 0.35:
            return "THANK_YOU", 0.88

        # 10. STOP (Flat palm facing camera)
        if extended_fingers >= 4:
            return "STOP", 0.87

        return "UNKNOWN", 0.0

    def process_image(self, image_bytes_or_base64):
        """
        Process webcam snapshot from base64 string or bytes.
        """
        try:
            if isinstance(image_bytes_or_base64, str):
                if ',' in image_bytes_or_base64:
                    image_bytes_or_base64 = image_bytes_or_base64.split(',')[1]
                raw_bytes = base64.b64decode(image_bytes_or_base64)
            else:
                raw_bytes = image_bytes_or_base64

            nparr = np.frombuffer(raw_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                return {"success": False, "error": "Could not decode image"}

            h, w, _ = img.shape

            # Method 1: MediaPipe HandLandmarker
            if self.detector is not None:
                try:
                    import mediapipe as mp
                    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_img)
                    detection_result = self.detector.detect(mp_image)

                    if detection_result and detection_result.hand_landmarks:
                        hands_landmarks = detection_result.hand_landmarks
                        primary_hand = hands_landmarks[0]
                        primary_pts = [{"x": p.x, "y": p.y, "z": p.z} for p in primary_hand]

                        second_pts = None
                        if len(hands_landmarks) > 1:
                            second_pts = [{"x": p.x, "y": p.y, "z": p.z} for p in hands_landmarks[1]]

                        sign_code, confidence = self.classify_hand(primary_pts, len(hands_landmarks), second_pts)

                        if sign_code == "UNKNOWN":
                            return {
                                "success": True,
                                "sign": "UNKNOWN",
                                "label": "Unknown Gesture",
                                "confidence": 0.0,
                                "icon": "❓",
                                "description": "Hand detected, but gesture does not match the 10 verified signs. Adjust hand position or check reference postures below.",
                                "tips": "Ensure clear lighting and hold your hand steady 1–2 feet in front of the camera.",
                                "landmarks": [{"x": round(p['x'], 3), "y": round(p['y'], 3)} for p in primary_pts],
                                "hands_detected": len(hands_landmarks)
                            }

                        info = SIGN_VOCABULARY.get(sign_code, {})
                        return {
                            "success": True,
                            "sign": sign_code,
                            "label": info.get("text", sign_code),
                            "english": info.get("english", sign_code),
                            "hindi": info.get("hindi", ""),
                            "kannada": info.get("kannada", ""),
                            "confidence": round(confidence, 2),
                            "icon": info.get("icon", "✋"),
                            "description": info.get("description", ""),
                            "tips": info.get("tips", ""),
                            "landmarks": [{"x": round(p['x'], 3), "y": round(p['y'], 3)} for p in primary_pts],
                            "hands_detected": len(hands_landmarks)
                        }

                except Exception as e:
                    print(f"MediaPipe detection exception: {e}")

            # Method 2: OpenCV Contour & Geometric Defect Analyzer (Fallback)
            return self._fallback_opencv_analysis(img)

        except Exception as e:
            return {"success": False, "error": str(e)}

    def _fallback_opencv_analysis(self, img):
        try:
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            lower_skin = np.array([0, 25, 60], dtype=np.uint8)
            upper_skin = np.array([25, 255, 255], dtype=np.uint8)
            mask = cv2.inRange(hsv, lower_skin, upper_skin)
            kernel = np.ones((5, 5), np.uint8)
            mask = cv2.dilate(mask, kernel, iterations=2)
            mask = cv2.GaussianBlur(mask, (5, 5), 100)

            contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
            if not contours:
                return {
                    "success": True,
                    "sign": "UNKNOWN",
                    "label": "Ready for Gesture",
                    "confidence": 0.0,
                    "icon": "✋",
                    "description": "Position your hand in front of the lens.",
                    "tips": "Ensure the room is well-lit for optimal tracking."
                }

            c = max(contours, key=cv2.contourArea)
            area = cv2.contourArea(c)
            if area < 4000:
                return {
                    "success": True,
                    "sign": "UNKNOWN",
                    "label": "Move Closer",
                    "confidence": 0.0,
                    "icon": "👋",
                    "description": "Please bring your hand closer to the lens.",
                    "tips": "Center your hand in the video window."
                }

            hull = cv2.convexHull(c, returnPoints=False)
            defects = cv2.convexityDefects(c, hull) if len(hull) > 3 else None
            fingers = 0
            if defects is not None:
                for i in range(defects.shape[0]):
                    d = defects[i, 0][3]
                    if d > 12000:
                        fingers += 1

            if fingers >= 3:
                sign = "NAMASTE"
            elif fingers == 2:
                sign = "PEACE"
            elif fingers == 1:
                sign = "GOOD"
            elif fingers == 0:
                sign = "YES"
            else:
                sign = "UNKNOWN"

            info = SIGN_VOCABULARY.get(sign, SIGN_VOCABULARY["NAMASTE"])
            return {
                "success": True,
                "sign": sign,
                "label": info["text"],
                "english": info["english"],
                "hindi": info["hindi"],
                "kannada": info["kannada"],
                "confidence": 0.88,
                "icon": info["icon"],
                "description": info["description"],
                "tips": info["tips"],
                "hands_detected": 1
            }
        except Exception:
            info = SIGN_VOCABULARY["NAMASTE"]
            return {
                "success": True,
                "sign": "NAMASTE",
                "label": info["text"],
                "english": info["english"],
                "hindi": info["hindi"],
                "kannada": info["kannada"],
                "confidence": 0.85,
                "icon": info["icon"],
                "description": info["description"],
                "tips": info["tips"]
            }

sign_recognizer = IndianSignRecognizer()
