import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configure Multer for file uploads (disk storage for reports)
const upload = multer({ dest: 'uploads/' });

// Configure Multer for audio uploads (memory storage for direct API sending)
const audioUpload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini Lazily
const getGenAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is missing");
    return new GoogleGenerativeAI(key);
};

// --- Helper: File to GenerativePart ---
function fileToGenerativePart(path: string, mimeType: string) {
    return {
        inlineData: {
            data: fs.readFileSync(path).toString("base64"),
            mimeType
        },
    };
}

// --- Viraj Persona Definition ---
const VIRAJ_SYSTEM_INSTRUCTION = `
Role: You are 'Viraj', an empathetic and calm AI health assistant designed for rural families.
Tone: Warm, respectful, slow-paced, and caring. Speak like a knowledgeable elder brother or a kind doctor.

Language Protocol (STRICT):
1. **CHECK "preferred_language"**: The user may explicitly specify a preferred language (e.g., 'te-IN' for Telugu, 'hi-IN' for Hindi).
   - IF a preferred language is provided, you MUST reply in that language, regardless of the input language.
   - Example: If preferred is 'te-IN' (Telugu) but user types in English, reply in Telugu.
2. **FALLBACK (Detection)**: If no preferred language is specified, DETECT the user's input language and dialect.
   - If user speaks Hindi -> Reply in Hindi (Devanagari).
   - If user speaks Telugu -> Reply in Telugu (Telugu script).
   - If user speaks Tamil -> Reply in Tamil (Tamil script).
   - If user speaks Hinglish -> Reply in Hinglish.
3. **ENGLISH**: Only reply in English if the preferred language is English OR the user speaks English and no preference is set.

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

        if (!process.env.GEMINI_API_KEY) {
            // Mock Response if no key
            return res.json({
                risk_level: "Moderate",
                risk_score: 5,
                possible_conditions: [
                    { name: "Viral Gastroenteritis", probability: 45 },
                    { name: "Food Poisoning", probability: 30 },
                    { name: "Gastritis", probability: 15 }
                ],
                recommendation: "Hydrate and rest. If symptoms persist for >24h, see a doctor.",
                warning_signs: ["Nausea", "Mild Dehydration"]
            });
        }

        const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
      Act as an expert medical AI. Analyze the following patient data:
      Profile: ${JSON.stringify(userProfile)}
      Symptoms: ${symptoms}
      Vitals: ${JSON.stringify(vitals)}

      Return a JSON object ONLY (no markdown) with this structure:
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

        // Robust JSON Extraction
        let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstOpen = jsonStr.indexOf('{');
        const lastClose = jsonStr.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1) {
            jsonStr = jsonStr.substring(firstOpen, lastClose + 1);
        }

        try {
            const parsedData = JSON.parse(jsonStr);
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

        if (!process.env.GEMINI_API_KEY) {
            // Mock Response
            return res.json({
                patient_details: { name: "John Doe", age: 45, gender: "Male" },
                vitals: { temp: "98.6°F", bp: "120/80", hr: "72 bpm", spo2: "98%" },
                anomalies: [],
                summary: "Routine checkup report. All parameters within normal limits.",
                is_critical: false
            });
        }

        const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
        const imagePart = fileToGenerativePart(req.file.path, req.file.mimetype);

        const prompt = `
      Analyze this medical report image. Extract and interpret the data.
      Return a JSON object ONLY (no markdown) with this structure:
      {
        "patient_details": { "name": string, "age": string, "gender": string },
        "vitals": { "temp": string, "bp": string, "hr": string, "spo2": string },
        "anomalies": string[],
        "summary": string,
        "is_critical": boolean
      }
      If a vital is missing, use "N/A".
      If "is_critical" is true, it means there are dangerous values requiring immediate attention.
    `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Cleanup uploaded file
        fs.unlinkSync(req.file.path);

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(jsonStr));

    } catch (error) {
        console.error('Report Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze report' });
    }
});

// --- Route: Suggest Remedies ---
router.post('/suggest-remedies', async (req, res) => {
    try {
        const { diagnosis } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.json({ remedies: ["Rest", "Hydration", "Healthy Diet"] });
        }

        const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Suggest 3-5 natural or home remedies for: ${diagnosis}. Return JSON: { "remedies": string[] }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(jsonStr));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch remedies' });
    }
});

// --- Route: Text Chat (Viraj) ---
router.post('/chat', async (req, res) => {
    try {
        const { message, history, preferred_language } = req.body;
        const genAI = getGenAI();

        // Append language preference to system instruction dynamically
        const langInstruction = preferred_language ? `\n\nUSER PREFERRED LANGUAGE: ${preferred_language}. YOU MUST REPLY IN THIS LANGUAGE.` : "";

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: VIRAJ_SYSTEM_INSTRUCTION + langInstruction,
        });

        // Sanitize history
        const sanitizedHistory = history.map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        if (sanitizedHistory.length > 0 && sanitizedHistory[0].role === 'model') {
            sanitizedHistory.shift();
        }

        const chat = model.startChat({
            history: sanitizedHistory,
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

// --- Route: Audio Chat (Viraj) ---
router.post('/chat-audio', audioUpload.single('audio'), async (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: VIRAJ_SYSTEM_INSTRUCTION,
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
                        { text: "Listen to this audio. Identify the language. Respond to the user's query in the **EXACT SAME Language and Script** as Viraj. If the user speaks Hindi, reply in Hindi (Devanagari). If Telugu, reply in Telugu. Return JSON with 'response' and 'language_code'." }
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
