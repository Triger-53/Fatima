import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@supabase/supabase-js"

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

const {
    REACT_APP_SUPABASE_URL,
    REACT_APP_SUPABASE_ANON_KEY
} = process.env

const supabase = (REACT_APP_SUPABASE_URL && REACT_APP_SUPABASE_ANON_KEY)
    ? createClient(REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY)
    : null;

if (!genAI) {
    console.warn("⚠️ Gemini AI client not initialized. Missing GEMINI_API_KEY.");
}

const getModel = () => {
    if (!genAI) return null;
    return genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 500, // Limit response length for efficiency
        }
    });
};

const model = getModel();

// Base system prompt (lightweight)
const BASE_PROMPT = `You are Dr. Fatima Kasamnath's AI assistant, a Speech-Language Pathologist. Be warm, concise, and professional. Use emojis (🩺📅📍), markdown formatting, and GitHub alerts. Never diagnose. Direct users to "Book Appointment" button for bookings.`;

// Detect user intent to fetch only relevant data
const detectIntent = (message) => {
    const msg = message.toLowerCase();
    return {
        needsServices: msg.includes('service') || msg.includes('therapy') || msg.includes('treatment') || msg.includes('help with'),
        needsLocations: msg.includes('location') || msg.includes('address') || msg.includes('where') || msg.includes('center') || msg.includes('hospital'),
        needsReviews: msg.includes('review') || msg.includes('testimonial') || msg.includes('feedback') || msg.includes('rating') || msg.includes('experience'),
        needsBooking: msg.includes('book') || msg.includes('appointment') || msg.includes('schedule') || msg.includes('how to'),
        needsDashboard: msg.includes('dashboard') || msg.includes('account') || msg.includes('profile') || msg.includes('my appointment'),
        needsHours: msg.includes('hour') || msg.includes('open') || msg.includes('time') || msg.includes('available'),
    };
};

// Build context dynamically based on intent (RAG approach)
const buildContext = async (intent) => {
    if (!supabase) return '';

    let contextParts = [];

    try {
        // Fetch Services
        if (intent.needsServices) {
            const { data, error } = await supabase.from('services').select('title,description,duration').limit(5);
            if (!error && data?.length) {
                contextParts.push(`### 🩺 Services\n${data.map(s => `* **${s.title}**: ${s.description.substring(0, 100)}... (${s.duration})`).join('\n')}`);
            }
        }

        // Fetch Locations
        if (intent.needsLocations) {
            const { data, error } = await supabase.from('hospitals').select('name,address');
            if (!error && data?.length) {
                contextParts.push(`### 📍 Locations\n${data.map(h => `* **${h.name}**: ${h.address}`).join('\n')}`);
            }
        }

        // Fetch Reviews
        if (intent.needsReviews) {
            const { data, error } = await supabase.from('review').select('name,review').limit(3);
            if (!error && data?.length) {
                contextParts.push(`### ⭐ Patient Reviews\n${data.map(r => `* "${r.review.substring(0, 80)}..." - ${r.name}`).join('\n')}`);
            }
        }

        // Static context for processes
        if (intent.needsBooking) {
            contextParts.push(`### 📅 How to Book\n1. Sign In/Sign Up\n2. Enter Personal Details\n3. Choose Service & Slot (Date/Time)\n4. Add Medical Info\n5. Pay via Razorpay`);
        }

        if (intent.needsDashboard) {
            contextParts.push(`### 🖥️ Dashboard Features\nView prescriptions, doctor notes, medical history, manage appointments, and update your profile.`);
        }

        // General info fallback
        if (intent.needsHours || contextParts.length === 0) {
            const { data } = await supabase.from('settings').select('booking_range').limit(1);
            const range = data?.[0]?.booking_range || 30;
            contextParts.push(`### ⚙️ Practice Info\n* **Hours**: Mon-Fri 8am-8pm, Sat 9am-2pm\n* **Booking**: Up to ${range} days in advance\n* **Contact**: info@fatimakasamnath.com`);
        }

    } catch (err) {
        console.error("Context build error:", err);
    }

    return contextParts.join('\n\n');
};

export const handleChat = async (req, res) => {
    if (!model) {
        return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    try {
        const { message, history } = req.body

        if (!message) {
            return res.status(400).json({ error: "Message is required" })
        }

        const chatHistory = history || [];
        const intent = detectIntent(message);
        const relevantContext = await buildContext(intent);

        // Prepare the chat session
        const chat = model.startChat({
            history: chatHistory.length === 0 ? [] : chatHistory,
        });

        let finalMessage = message;

        // If it's a new chat, inject base prompt and context
        if (chatHistory.length === 0) {
            finalMessage = `SYSTEM INSTRUCTION:\n${BASE_PROMPT}\n\nINITIAL CONTEXT:\n${relevantContext}\n\nUSER MESSAGE:\n${message}`;
        } else if (relevantContext) {
            // Provide refreshed context for existing chat
            finalMessage = `RELEVANT CONTEXT:\n${relevantContext}\n\nUSER MESSAGE:\n${message}`;
        }

        const result = await chat.sendMessage(finalMessage);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error("AI Chat Error Details:", error);
        res.status(500).json({ error: "I'm having trouble processing that right now. Please try again." });
    }
}
