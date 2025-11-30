import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configure Multer for file uploads (memory storage for serverless compatibility)
const upload = multer({ storage: multer.memoryStorage() });

// Configure Multer for audio uploads (memory storage for direct API sending)
const audioUpload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini Lazily
const getGenAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("CRITICAL ERROR: GEMINI_API_KEY is missing in environment variables.");
        throw new Error("GEMINI_API_KEY is missing. Please check your .env file.");
    }
    return new GoogleGenerativeAI(key);
};

// --- Helper: File to GenerativePart (Buffer version) ---
function fileToGenerativePart(buffer: Buffer, mimeType: string) {
    return {
        inlineData: {
            data: buffer.toString("base64"),
            mimeType
        },
    };
}

// --- Aura Persona Definition ---
const AURA_SYSTEM_INSTRUCTION = `
Role: You are 'Aura', an empathetic and calm AI health assistant designed for rural families.
Tone: Warm, respectful, slow-paced, and caring. Speak like a knowledgeable elder sister or a kind doctor.

Language Protocol (STRICT):
1. **DETECT INPUT LANGUAGE**: Always identify the language the user is currently speaking.
2. **ADAPTABILITY**: 
   - IF the user speaks in a specific language (e.g., Telugu, Hindi, English), **YOU MUST REPLY IN THAT SAME LANGUAGE**.
   - This overrides any "preferred_language" setting if the user explicitly switches languages in the conversation.
3. **PREFERRED LANGUAGE HINT**: If the user's input is ambiguous or short, use the "preferred_language" (if provided) as a default.
   - If preferred is 'te-IN' and input is ambiguous, use Telugu.
   - If preferred is 'en-IN' and input is ambiguous, use English.
4. **FALLBACK**: If no preference and unable to detect, default to English (or Hindi if the context suggests rural India).

Specific Rules:
- If user speaks Hindi -> Reply in Hindi (Devanagari).
- If user speaks Telugu -> Reply in Telugu (Telugu script).
- If user speaks English -> Reply in English.
- If user speaks Hinglish -> Reply in Hinglish.

Emergency Protocol: If the user mentions symptoms like 'chest pain', 'unconscious', 'bleeding', 'difficulty breathing', or 'severe trauma', immediately stop the diagnosis and instruct them to go to a hospital.

IMPORTANT: You must ALWAYS return your response as a JSON object with the following structure:
{
  "response": "Your response text in the target language script...",
  "language_code": "BCP-47 language code (e.g., 'hi-IN', 'te-IN', 'ta-IN', 'en-IN', 'mr-IN', 'bn-IN', 'kn-IN', 'ml-IN')"
}
`;

// --- Route: Analyze Symptoms ---
router.post('/analyze-symptoms', async (req, res) => {
    try {
        const { symptoms, vitals, userProfile } = req.body;


        const model = getGenAI().getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
      Act as an expert medical AI. Analyze the following patient data:
      Profile: ${JSON.stringify(userProfile)}
      Symptoms: ${symptoms}
      Vitals: ${JSON.stringify(vitals)}

      STRICT RULES FOR OUTPUT:
      1. **Risk Level**: Assign 'High' or 'Critical' ONLY if there are severe symptoms (e.g., chest pain, difficulty breathing, severe bleeding, high fever > 103F, very low/high BP). Otherwise, use 'Low' or 'Moderate'.
      2. **Warning Signs**: 
         - **IF Risk is 'Low' or 'Moderate'**: Return an EMPTY array [] for "warning_signs". Do NOT show warning signs for normal/mild problems.
         - **IF Risk is 'High' or 'Critical'**: List specific warning signs that triggered this risk.

      Return a JSON object ONLY with this structure:
      {
        "risk_level": "Low" | "Moderate" | "High" | "Critical",
        "risk_score": number (1-10),
        "possible_conditions": [{ "name": string, "probability": number }],
        "recommendation": string,
        "warning_signs": string[]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const parsedData = JSON.parse(text);
            res.json(parsedData);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            throw new Error("Failed to parse AI response");
        }

    } catch (error: any) {
        console.error('AI Error:', error.message);
        res.status(500).json({ error: `Failed to analyze symptoms: ${error.message}` });
    }
});

// --- Route: Analyze Report (OCR + Analysis) ---
router.post('/analyze-report', upload.single('report'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });


        const model = getGenAI().getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const imagePart = fileToGenerativePart(req.file.buffer, req.file.mimetype);

        const prompt = `
      You are DocMate AI, a highly advanced critical care specialist and triage engine. Your goal is to analyze medical text/OCR data from the provided image and generate a structured risk assessment.
      
      CRITICAL INSTRUCTION: You must detect ANY abnormality "at any cost". Do not be conservative. If a value is even slightly outside the normal range, flag it.
      
      1. **Data Extraction**:
         - Extract ALL vital signs and patient details visible in the report.
         - If the image is blurry, infer from context but prioritize safety (assume worse case if ambiguous).
         - Pay close attention to units (e.g., mg/dL vs mmol/L).
      
      2. **Triage Logic (STRICT & AGGRESSIVE)**:
         - **EMERGENCY (Red)**:
           - Systolic BP: < 90 or > 180
           - Diastolic BP: < 60 or > 110
           - Heart Rate: < 50 or > 110
           - Temperature: > 39.5°C (103°F) or < 35°C (95°F)
           - SpO2: < 94%
           - Keywords: "Chest pain", "Unconscious", "Severe breathing difficulty", "Massive bleeding", "Critical", "Emergency".
         - **DOCTOR VISIT (Orange)**:
           - Temperature: 38°C - 39.5°C
           - Pain Score: 4-7
           - Abnormal Lab Values (e.g., High Glucose, Low Hemoglobin).
           - Keywords: "Abdominal pain", "Persistent fever", "Infection".
         - **LOW RISK (Green)**:
           - ONLY if ALL vitals are strictly within standard normal ranges.
      
      3. **Output Format (JSON)**:
      Return a JSON object exactly matching this structure:
      {
        "patient_info": {
          "name": "String (or 'Unknown')",
          "age": "Number (or 0)",
          "gender": "String (or 'Unknown')",
          "blood_type": "String (or 'Unknown')"
        },
        "triage_status": {
          "level": "Emergency" | "Doctor Visit" | "Low Risk",
          "severity_score": "Number (1-10)",
          "color_code": "Red" | "Orange" | "Green",
          "alert_message": "String (e.g., 'IMMEDIATE ACTION REQUIRED: Call 911')"
        },
        "vital_signs": [
          {
            "label": "String (e.g. 'Heart Rate')",
            "value": "String (e.g. '120 bpm')",
            "status": "Critical" | "Warning" | "Normal"
          }
        ],
        "ai_analysis": {
          "warning_signs": ["List of specific abnormalities found"],
          "possible_conditions": [
            {
              "condition": "String",
              "probability": "High" | "Medium" | "Low",
              "description": "Short explanation."
            }
          ],
          "recommendations": "String (Clear, actionable advice)"
        }
      }
    `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        console.log("Raw AI Response:", text); // Debugging

        let parsed: any;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            console.error('AI JSON parse error:', text);
            return res.status(500).json({ error: "Failed to parse AI response", details: text });
        }

        return res.json(parsed);

    } catch (error: any) {
        console.error('Report Analysis Error:', error);
        return res.status(500).json({ error: `Failed to analyze report: ${error.message}` });
    }
});

// --- Route: Suggest Remedies ---
router.post('/suggest-remedies', async (req, res) => {
    try {
        const { diagnosis, risk_level, vital_signs } = req.body;

        const model = getGenAI().getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        Act as an expert naturopath and holistic health specialist.
        Patient Condition: ${diagnosis}
        Risk Level: ${risk_level}
        Vital Signs: ${JSON.stringify(vital_signs)}

        Generate a structured response for natural remedies.
        
        STRICT RULES:
        1. **Disclaimer**: Always include a disclaimer that these are supportive measures and not a substitute for professional medical advice.
        2. **Vital Specific Advice**: 
           - IF Temperature is > 38°C (100.4°F), provide specific "Temperature" advice (e.g., cool compresses, hydration).
           - IF Blood Pressure is abnormal (Systolic > 140 or < 90), provide specific "Blood Pressure" advice.
           - If vitals are normal, you can omit these specific sections or provide general wellness advice.
        3. **Remedies**: Provide 3 distinct categories:
           - "Home Remedies": Simple things to do at home.
           - "Ayurvedic Remedies": Traditional Indian remedies (Tulsi, Ginger, Ashwagandha, etc.).
           - "Natural Remedies": General naturopathic suggestions.

        Return a JSON object with this EXACT structure:
        {
          "disclaimer": "String (The disclaimer text)",
          "vital_advice": {
            "temperature": "String (Optional, advice if temp is high)",
            "blood_pressure": "String (Optional, advice if BP is abnormal)"
          },
          "remedies": {
            "home": ["List 3-5 home remedies with brief details"],
            "ayurvedic": ["List 3-5 Ayurvedic remedies with brief details"],
            "natural": ["List 3-5 natural/naturopathic remedies with brief details"]
          }
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            res.json(JSON.parse(text));
        } catch (e) {
            console.error("Failed to parse remedies JSON", text);
            res.status(500).json({ error: "Failed to generate remedies" });
        }
    } catch (error) {
        console.error("Remedies Error:", error);
        res.status(500).json({ error: 'Failed to fetch remedies' });
    }
});

// --- Route: Text Chat (Aura) ---
router.post('/chat', async (req, res) => {
    try {
        const { message, history, preferred_language } = req.body;
        const genAI = getGenAI();

        // Append language preference to system instruction dynamically
        const langInstruction = (preferred_language && preferred_language !== 'Auto')
            ? `\n\nUSER PREFERRED LANGUAGE SETTING: ${preferred_language}. Try to use this, but if the user writes in a different language, ADAPT to their language.`
            : "\n\nUSER LANGUAGE SETTING: Auto-Detect. Respond in the same language as the user's input.";

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: AURA_SYSTEM_INSTRUCTION + langInstruction,
        });

        // Sanitize history
        const sanitizedHistory = history.map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        if (sanitizedHistory.length > 0 && sanitizedHistory[0].role === 'model') {
            sanitizedHistory.shift();
        }

        // Optimize history: Keep only last 10 messages
        const recentHistory = sanitizedHistory.slice(-10);

        const chat = model.startChat({
            history: recentHistory,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
                responseMimeType: "application/json"
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        try {
            const jsonResponse = JSON.parse(text);
            res.json(jsonResponse);
        } catch (e) {
            // Fallback if model fails to return JSON
            res.json({ response: text, language_code: 'en-IN' });
        }

    } catch (error: any) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to process chat message', details: error.message });
    }
});

// --- Route: Audio Chat (Aura) ---
router.post('/chat-audio', audioUpload.single('audio'), async (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: AURA_SYSTEM_INSTRUCTION,
        });

        const audioBase64 = req.file.buffer.toString('base64');

        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: req.file.mimetype || 'audio/wav',
                                data: audioBase64
                            }
                        },
                        { text: "Listen to this audio. Identify the language. Respond to the user's query in the **EXACT SAME Language and Script** as Aura. If the user speaks Hindi, reply in Hindi (Devanagari). If Telugu, reply in Telugu. Return JSON with 'response' and 'language_code'." }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const response = await result.response;
        const text = response.text();

        try {
            const jsonResponse = JSON.parse(text);
            res.json(jsonResponse);
        } catch (e) {
            res.json({ response: text, language_code: 'en-IN' });
        }

    } catch (error: any) {
        console.error('AI Audio Chat Error:', error);
        res.status(500).json({ error: 'Failed to process audio message', details: error.message });
    }
});

export default router;
