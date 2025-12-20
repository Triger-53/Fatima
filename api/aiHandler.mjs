import dotenv from "dotenv"
dotenv.config()
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@supabase/supabase-js"

// Lazy initialization to ensure env vars are loaded
let genAIInstance = null;
let supabaseInstance = null;

const getGenAI = () => {
    if (genAIInstance) return genAIInstance;
    if (process.env.GEMINI_API_KEY) {
        genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        return genAIInstance;
    }
    return null;
};

const getSupabase = () => {
    if (supabaseInstance) return supabaseInstance;
    const { REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY } = process.env;
    if (REACT_APP_SUPABASE_URL && REACT_APP_SUPABASE_ANON_KEY) {
        supabaseInstance = createClient(REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY);
        return supabaseInstance;
    }
    return null;
};

const getModel = () => {
    const ai = getGenAI();
    if (!ai) return null;
    return ai.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 500,
        }
    });
};

// Base system prompt (lightweight)
const BASE_PROMPT = `You are Dr. Fatima Kasamnath's AI assistant, a Speech-Language Pathologist. Be warm, concise, and professional. Use emojis (🩺📅📍). Never diagnose. Direct users to "Book Appointment" button.`;

// Detect user intent (RAG)
const detectIntent = (message) => {
    const msg = message.toLowerCase();
    return {
        needsServices: msg.includes('service') || msg.includes('therapy') || msg.includes('treatment'),
        needsLocations: msg.includes('location') || msg.includes('address') || msg.includes('where'),
        needsReviews: msg.includes('review') || msg.includes('feedback') || msg.includes('rating'),
        needsBooking: msg.includes('book') || msg.includes('appointment') || msg.includes('schedule'),
        needsDashboard: msg.includes('dashboard') || msg.includes('account') || msg.includes('profile'),
        needsHours: msg.includes('hour') || msg.includes('open') || msg.includes('time'),
        needsAppointments: msg.includes('my appointment') || msg.includes('do i have') || msg.includes('my schedule'),
    };
};

// Build context (RAG)
const buildContext = async (intent, userEmail = null) => {
    const supabase = getSupabase();
    if (!supabase) return 'Service information is currently being updated.';

    let contextParts = [];
    try {
        // Personal appointments check
        if (intent.needsAppointments && userEmail) {
            const { data } = await supabase
                .from('Appointment')
                .select('preferredDate,preferredTime,appointmentType')
                .eq('email', userEmail)
                .gte('preferredDate', new Date().toISOString().split('T')[0])
                .order('preferredDate', { ascending: true })
                .limit(3);

            if (data?.length) {
                contextParts.push(`USER APPOINTMENTS: You have appointments on ${data.map(a => `${a.preferredDate} at ${a.preferredTime} (${a.appointmentType})`).join(', ')}.`);
            } else {
                contextParts.push(`USER APPOINTMENTS: No upcoming appointments found for ${userEmail}.`);
            }
        }

        if (intent.needsServices) {
            const { data } = await supabase.from('services').select('title,description').limit(5);
            if (data?.length) contextParts.push(`SERVICES: ${data.map(s => s.title).join(', ')}`);
        }
        if (intent.needsLocations) {
            const { data } = await supabase.from('hospitals').select('name,address').limit(5);
            if (data?.length) contextParts.push(`LOCATIONS: ${data.map(h => `${h.name} at ${h.address}`).join('; ')}`);
        }
        if (intent.needsHours || contextParts.length === 0) {
            contextParts.push(`HOURS: Mon-Fri 8am-8pm, Sat 9am-2pm.`);
        }
    } catch (err) {
        console.error("RAG Error:", err);
    }
    return contextParts.join('\n');
};

export const handleChat = async (req, res) => {
    const model = getModel();
    if (!model) {
        console.error("❌ Gemini API Key missing or invalid");
        return res.status(500).json({ response: "I'm sorry, my AI brain is currently offline. Please contact us directly at info@fatimakasamnath.com." });
    }

    try {
        const { message, history, userEmail } = req.body;
        if (!message) return res.status(400).json({ error: "Message required" });

        const intent = detectIntent(message);
        const relevantContext = await buildContext(intent, userEmail);

        // Filter history to ensure it's valid for Gemini (must alternate user/model)
        const chatHistory = (history || []).filter(h => h.role === 'user' || h.role === 'model');

        // Start chat
        const chat = model.startChat({ history: chatHistory });

        // Build the prompt with instructions
        const finalPrompt = chatHistory.length === 0
            ? `${BASE_PROMPT}\n\nCONTEXT:\n${relevantContext}\n\nUSER: ${message}`
            : `(Update Context: ${relevantContext})\nUSER: ${message}`;

        const result = await chat.sendMessage(finalPrompt);
        const response = await result.response;
        const text = response.text();

        return res.json({ response: text });
    } catch (error) {
        console.error("❌ AI Chat Error Details:", error);

        // Final fallback to keep the UI from breaking
        return res.json({
            response: "I'm experiencing a small technical glitch, but I'd love to help! You can book an appointment using the button above, or see our hours: Mon-Fri 8am-8pm. What else can I tell you about Dr. Fatima's practice?"
        });
    }
}
