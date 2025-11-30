import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Mic, Volume2, StopCircle, Square, X, Globe } from 'lucide-react';
import { API_URL } from '../config';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    hasAudio?: boolean;
    language?: string;
}

const LANGUAGES = [
    { code: 'Auto', name: 'Auto Detect', label: 'Auto' },
    { code: 'en-IN', name: 'English (India)', label: 'English' },
    { code: 'hi-IN', name: 'Hindi', label: 'हिंदी' },
    { code: 'te-IN', name: 'Telugu', label: 'తెలుగు' },
    { code: 'ta-IN', name: 'Tamil', label: 'தமிழ்' },
    { code: 'mr-IN', name: 'Marathi', label: 'मराठी' },
    { code: 'bn-IN', name: 'Bengali', label: 'বাংলা' },
    { code: 'gu-IN', name: 'Gujarati', label: 'ગુજરાતી' },
    { code: 'kn-IN', name: 'Kannada', label: 'ಕನ್ನಡ' },
    { code: 'ml-IN', name: 'Malayalam', label: 'മലയാളം' },
];

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Namaste! I'm Viraj, your health assistant. I can speak many languages. Press the mic to talk to me.",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState('Auto');
    const [showLangMenu, setShowLangMenu] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setAvailableVoices(voices);
                console.log("Loaded Voices:", voices.map(v => `${v.name} (${v.lang})`));
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                await sendAudioMessage(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks to release mic
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = null; // Prevent sending
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setInput('');
        }
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setPlayingMessageId(null);
    };

    const playAudio = (text: string, langCode?: string, messageId?: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setPlayingMessageId(null);

            const utterance = new SpeechSynthesisUtterance(text);

            // Priority: 
            // 1. Backend detected language (langCode)
            // 2. User selected language (selectedLanguage)
            // 3. Fallback to English if Auto
            const targetLang = langCode || (selectedLanguage === 'Auto' ? 'en-IN' : selectedLanguage);

            let voices = availableVoices;
            if (voices.length === 0) {
                voices = window.speechSynthesis.getVoices();
            }

            let selectedVoice = null;

            // Strategy 1: Exact Match with "Google" (High Quality)
            selectedVoice = voices.find(v => v.lang === targetLang && v.name.includes('Google'));

            // Strategy 2: Exact Match (Any Vendor)
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.lang === targetLang);
            }

            // Strategy 3: Prefix Match (e.g., 'te' for 'te-IN')
            if (!selectedVoice) {
                const shortLang = targetLang.split('-')[0];
                selectedVoice = voices.find(v => v.lang.startsWith(shortLang));
            }

            // Strategy 4: Name Match (e.g., "Telugu")
            if (!selectedVoice) {
                const langNameMap: { [key: string]: string } = {
                    'hi': 'Hindi', 'te': 'Telugu', 'ta': 'Tamil', 'mr': 'Marathi',
                    'bn': 'Bengali', 'gu': 'Gujarati', 'kn': 'Kannada', 'ml': 'Malayalam'
                };
                const shortLang = targetLang.split('-')[0];
                const langName = langNameMap[shortLang];
                if (langName) {
                    selectedVoice = voices.find(v => v.name.toLowerCase().includes(langName.toLowerCase()));
                }
            }

            // Fallback: English
            if (!selectedVoice && (!targetLang || targetLang.startsWith('en'))) {
                selectedVoice = voices.find(v => v.lang === 'en-US');
            }

            if (selectedVoice) {
                utterance.voice = selectedVoice;
                console.log(`Using Voice: ${selectedVoice.name} for ${targetLang}`);
            } else {
                console.warn(`No voice found for ${targetLang}.`);
            }

            utterance.lang = targetLang;
            utterance.rate = 0.9;

            utterance.onend = () => setPlayingMessageId(null);
            utterance.onerror = () => setPlayingMessageId(null);

            window.speechSynthesis.speak(utterance);
            if (messageId) setPlayingMessageId(messageId);
        }
    };

    const sendAudioMessage = async (audioBlob: Blob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('preferred_language', selectedLanguage);

        const tempId = Date.now().toString();
        setMessages(prev => [...prev, {
            id: tempId,
            text: "🎤 Audio sent...",
            sender: 'user',
            timestamp: new Date()
        }]);
        setIsTyping(true);

        try {
            const response = await fetch(`${API_URL}/api/chat-audio`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || "I couldn't hear that clearly.",
                sender: 'ai',
                timestamp: new Date(),
                hasAudio: true,
                language: data.language_code
            };
            setMessages(prev => [...prev, aiResponse]);

            // Auto-play TTS
            playAudio(aiResponse.text, data.language_code, aiResponse.id);

        } catch (error) {
            console.error("Audio Chat Failed", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I couldn't process your audio.",
                sender: 'ai',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        scrollToBottom();

        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    history: messages,
                    preferred_language: selectedLanguage
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.details || "Failed to get response from AI");
            }

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || "I'm sorry, I couldn't process that.",
                sender: 'ai',
                timestamp: new Date(),
                hasAudio: true,
                language: data.language_code
            };
            setMessages(prev => [...prev, aiResponse]);

            // Auto-read if user wants? For now, let's just let them click to play for text.
            // playAudio(aiResponse.text, data.language_code, aiResponse.id);

        } catch (error: any) {
            console.error("Chat Failed", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: error.message || "Sorry, I'm having trouble connecting to the server.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-full mx-auto relative overflow-hidden perspective-1000">
            {/* Background is now handled globally by Background3D, but we keep a local gradient for depth */}
            <div className="hero-gradient absolute inset-0 -z-10 opacity-30 pointer-events-none"></div>

            {/* Language Selector Header */}
            <div className="absolute top-2 right-4 z-20">
                <div className="relative">
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className="flex items-center gap-2 bg-surface-highlight/40 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-full text-sm text-slate-300 hover:text-primary-300 transition-all hover:scale-105 shadow-lg"
                    >
                        <Globe className="w-4 h-4" />
                        {LANGUAGES.find(l => l.code === selectedLanguage)?.label || 'Language'}
                    </button>

                    <AnimatePresence>
                        {showLangMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-surface/90 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-30"
                            >
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setSelectedLanguage(lang.code);
                                            setShowLangMenu(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-surface-highlight transition-colors border-b border-white/5 last:border-0 ${selectedLanguage === lang.code ? 'text-primary-400 bg-primary-500/10' : 'text-slate-300'
                                            }`}
                                    >
                                        {lang.label} <span className="text-xs text-slate-500 ml-1">({lang.name})</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 p-4 pb-40 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pt-16">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20, rotateX: -10 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        className={`flex items-end gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`
              w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg
              ${msg.sender === 'ai' ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white' : 'bg-gradient-to-br from-slate-600 to-slate-800 text-slate-300'}
            `}>
                            {msg.sender === 'ai' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                        </div>

                        <div className={`
              max-w-[80%] p-5 rounded-2xl text-sm leading-relaxed relative group transition-all duration-300 hover:scale-[1.01]
              ${msg.sender === 'ai'
                                ? 'glass-card text-slate-200 rounded-tl-none border-l-4 border-l-primary-500'
                                : 'bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-tr-none shadow-xl shadow-primary-900/20'}
            `}>
                            {msg.text}

                            {/* Audio Controls for AI messages */}
                            {msg.sender === 'ai' && (
                                <button
                                    onClick={() => {
                                        if (playingMessageId === msg.id) {
                                            stopSpeaking();
                                        } else {
                                            playAudio(msg.text, msg.language, msg.id);
                                        }
                                    }}
                                    className={`absolute -right-10 top-2 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 ${playingMessageId === msg.id ? 'text-primary-400 bg-primary-500/10 animate-pulse' : 'text-slate-500 hover:text-primary-300 hover:bg-surface-highlight'
                                        }`}
                                    title={playingMessageId === msg.id ? "Stop Speaking" : "Read Aloud"}
                                >
                                    {playingMessageId === msg.id ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                            )}

                            <div className={`text-[10px] mt-2 opacity-50 font-medium ${msg.sender === 'ai' ? 'text-slate-400' : 'text-primary-100'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 text-slate-500 text-xs ml-14"
                    >
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-primary-500/70 font-medium">Viraj is thinking...</span>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent z-10">
                {/* Voice Visualizer Overlay */}
                <AnimatePresence>
                    {isRecording && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="absolute bottom-28 left-1/2 -translate-x-1/2 glass-panel px-8 py-4 rounded-full flex items-center gap-6 border-primary-500/30 shadow-[0_0_30px_-5px_rgba(163,230,53,0.3)]"
                        >
                            <div className="flex items-center gap-1.5 h-6">
                                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [4, 24, 4] }}
                                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                        className="w-1.5 bg-gradient-to-t from-primary-500 to-primary-300 rounded-full"
                                    />
                                ))}
                            </div>
                            <span className="text-primary-300 text-sm font-bold uppercase tracking-widest animate-pulse">Listening...</span>

                            {/* Cancel Recording Button */}
                            <button
                                onClick={cancelRecording}
                                className="ml-2 p-2 bg-red-500/10 hover:bg-red-500/20 rounded-full text-red-400 hover:text-red-300 transition-colors border border-red-500/20"
                                title="Cancel Recording"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mic FAB */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-10">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isRecording
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-primary-500 hover:bg-primary-400 hover:scale-110'
                            }`}
                    >
                        {isRecording ? <StopCircle className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-slate-900" />}
                    </button>
                </div>

                <form onSubmit={handleSend} className="relative flex items-center gap-2 glass-panel p-1.5 rounded-full shadow-2xl border-slate-800">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 min-w-0 bg-transparent border-none py-3 pl-6 text-slate-200 placeholder:text-slate-500 focus:outline-none text-base"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="p-3 aspect-square flex items-center justify-center bg-slate-800 hover:bg-primary-500 text-slate-400 hover:text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
