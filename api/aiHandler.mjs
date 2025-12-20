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
        // Only fetch what's needed
        if (intent.needsServices) {
            const { data } = await supabase.from('services').select('title,description,duration').limit(10);
            if (data?.length) {
                contextParts.push(`### 🩺 Services\n${data.map(s => `**${s.title}**: ${s.description.substring(0, 80)}... (${s.duration}min)`).join('\n')}`);
            }
        }

        if (intent.needsLocations) {
            const { data } = await supabase.from('hospitals').select('name,address');
            if (data?.length) {
                contextParts.push(`### 📍 Locations\n${data.map(h => `**${h.name}**: ${h.address}`).join('\n')}`);
            }
        }

        if (intent.needsReviews) {
            const { data } = await supabase.from('review').select('comment,userName,rating').limit(3);
            if (data?.length) {
                contextParts.push(`### ⭐ Reviews\n${data.map(r => `"${r.comment.substring(0, 60)}..." - ${r.userName} (${r.rating}⭐)`).join('\n')}`);
            }
        }

        if (intent.needsBooking) {
            contextParts.push(`### 📅 Booking Steps\n1. Sign in/Create account\n2. Enter personal info\n3. Choose service, method (Online/Offline), date & time\n4. Add medical history\n5. Pay via Razorpay`);
        }

        if (intent.needsDashboard) {
            contextParts.push(`### 🖥️ Dashboard\nView health overview, upcoming/past appointments, sessions, update profile, or book new appointments.`);
        }

        if (intent.needsHours || contextParts.length === 0) {
            const { data } = await supabase.from('settings').select('booking_range').single();
            contextParts.push(`### ⚙️ Info\n**Hours**: Mon-Fri 8am-8pm, Sat 9am-2pm\n**Booking**: ${data?.booking_range || 30} days advance\n**Contact**: info@fatimakasamnath.com`);
        }

    } catch (err) {
        console.error("Error building context:", err);
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

        // Detect intent to fetch only relevant data (RAG approach)
        const intent = detectIntent(message);
        const relevantContext = await buildContext(intent);

        // Only inject full context on first message, otherwise use minimal prompts
        if (chatHistory.length === 0) {
            chatHistory.push({
                role: "user",
                parts: [{ text: `${BASE_PROMPT}\n\n${relevantContext}\n\nUser: Hello` }]
            })
            chatHistory.push({
                role: "model",
                parts: [{ text: "Hello! 👋 I'm Dr. Fatima Kasamnath's assistant. How can I help you today?" }]
            })
        } else if (relevantContext) {
            // Inject relevant context for this specific query
            chatHistory.push({
                role: "user",
                parts: [{ text: `[Context for this query]\n${relevantContext}\n\n[User Question]\n${message}` }]
            })

            const chat = model.startChat({ history: chatHistory.slice(0, -1) });
            const result = await chat.sendMessage(chatHistory[chatHistory.length - 1].parts[0].text);
            const response = await result.response;
            return res.json({ response: response.text() });
        }

        const chat = model.startChat({
            history: chatHistory,
        })

        const result = await chat.sendMessage(message)
        const response = await result.response
        const text = response.text()

        res.json({ response: text })
    } catch (error) {
        console.error("AI Chat Error:", error)
        res.status(500).json({ error: "Failed to generate response" })
    }
}
