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
        model: "gemini-2.5-flash", // Using a verified model name
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

const ADMIN_PROMPT = `You are Dr. Fatima Kasamnath's Admin AI Assistant. You have access to the dashboard data. help the admin manage appointments, services, hospitals, and sessions. Be professional, data-driven, and proactive. You can answer questions about schedules, patient details, and clinic operations using the provided context.`;

// Detect user intent (RAG)
const detectIntent = (message, isAdmin = false) => {
    const msg = message.toLowerCase();
    const intent = {
        needsServices: msg.includes('service') || msg.includes('therapy') || msg.includes('treatment'),
        needsLocations: msg.includes('location') || msg.includes('address') || msg.includes('where') || msg.includes('hospital'),
        needsReviews: msg.includes('review') || msg.includes('feedback') || msg.includes('rating'),
        needsBooking: msg.includes('book') || msg.includes('appointment') || msg.includes('schedule'),
        needsDashboard: msg.includes('dashboard') || msg.includes('account') || msg.includes('profile'),
        needsHours: msg.includes('hour') || msg.includes('open') || msg.includes('time'),
        needsAppointments: msg.includes('appointment') || msg.includes('schedule') || msg.includes('booking'),
    };

    if (isAdmin) {
        intent.needsAllAppointments = msg.includes('all') || msg.includes('every') || msg.includes('list') || msg.includes('upcoming');
        intent.needsAnalytics = msg.includes('how many') || msg.includes('count') || msg.includes('total') || msg.includes('analytic') || msg.includes('diagnostic');
        intent.needsSessions = msg.includes('session') || msg.includes('meeting') || msg.includes('zoom') || msg.includes('meet');
    }

    return intent;
};

// Build context (RAG)
const buildContext = async (intent, userEmail = null, isAdmin = false) => {
    const supabase = getSupabase();
    if (!supabase) return 'Service information is currently being updated.';

    let contextParts = [];
    try {
        if (isAdmin) {
            // Admin context: Broader access
            if (intent.needsAppointments || intent.needsAllAppointments) {
                const { data } = await supabase
                    .from('Appointment')
                    .select('firstName,lastName,preferredDate,preferredTime,appointmentType,status')
                    .order('preferredDate', { ascending: true })
                    .limit(10);
                if (data?.length) {
                    contextParts.push(`UPCOMING APPOINTMENTS: ${data.map(a => `${a.firstName} ${a.lastName} on ${a.preferredDate} at ${a.preferredTime} (${a.appointmentType}) - Status: ${a.status || 'pending'}`).join('\n')}`);
                }
            }

            if (intent.needsServices) {
                const { data } = await supabase.from('services').select('title,price,duration').limit(10);
                if (data?.length) {
                    contextParts.push(`SERVICES: ${data.map(s => `${s.title} (₹${s.price}, ${s.duration})`).join(', ')}`);
                }
            }

            if (intent.needsLocations) {
                const { data } = await supabase.from('hospitals').select('name,address').limit(10);
                if (data?.length) {
                    contextParts.push(`HOSPITALS/LOCATIONS: ${data.map(h => `${h.name} at ${h.address}`).join('; ')}`);
                }
            }

            if (intent.needsSessions) {
                const { data } = await supabase.from('sessions').select('user_id,date,time').order('date', { ascending: false }).limit(5);
                if (data?.length) {
                    contextParts.push(`RECENT SESSIONS: ${data.map(s => `User ID: ${s.user_id} on ${s.date} at ${s.time}`).join('\n')}`);
                }
            }

            if (intent.needsAnalytics) {
                const { count: apptCount } = await supabase.from('Appointment').select('*', { count: 'exact', head: true });
                const { count: userCount } = await supabase.from('user_dashboard').select('*', { count: 'exact', head: true });
                contextParts.push(`QUICK STATS: Total Appointments: ${apptCount || 0}, Total Registered Users: ${userCount || 0}.`);
            }
        } else {
            // Patient context: Limited access
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
        const { message, history, userEmail, isAdmin } = req.body;
        if (!message) return res.status(400).json({ error: "Message required" });

        const intent = detectIntent(message, isAdmin);
        const relevantContext = await buildContext(intent, userEmail, isAdmin);

        const activePrompt = isAdmin ? ADMIN_PROMPT : BASE_PROMPT;

        // Filter history to ensure it's valid for Gemini (must alternate user/model)
        const chatHistory = (history || []).filter(h => h.role === 'user' || h.role === 'model');

        // Start chat
        const chat = model.startChat({ history: chatHistory });

        // Build the prompt with instructions
        const finalPrompt = chatHistory.length === 0
            ? `${activePrompt}\n\nCONTEXT:\n${relevantContext}\n\nUSER: ${message}`
            : `(Update Context: ${relevantContext})\nUSER: ${message}`;

        const result = await chat.sendMessage(finalPrompt);
        const response = await result.response;
        const text = response.text();

        return res.json({ response: text });
    } catch (error) {
        console.error("❌ AI Chat Error Details:", error);

        // Final fallback to keep the UI from breaking
        return res.json({
            response: isAdmin
                ? "I encountered an error accessing the dashboard data. Please try again or check the database directly."
                : "I'm experiencing a small technical glitch, but I'd love to help! You can book an appointment using the button above, or see our hours: Mon-Fri 8am-8pm. What else can I tell you about Dr. Fatima's practice?"
        });
    }
}
