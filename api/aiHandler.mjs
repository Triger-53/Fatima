import dotenv from "dotenv"
dotenv.config()
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@supabase/supabase-js"

// 🔍 ULTRA DEBUG: Environment Variables Check
console.log("\n" + "=".repeat(80));
console.log("🔍 ULTRA DEBUG MODE ACTIVATED - AI HANDLER");
console.log("=".repeat(80));
console.log("📋 Environment Variables Status:");
console.log("   GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? `✅ SET (${process.env.GEMINI_API_KEY.substring(0, 10)}...)` : "❌ MISSING");
console.log("   SUPABASE_URL:", process.env.REACT_APP_SUPABASE_URL ? `✅ SET (${process.env.REACT_APP_SUPABASE_URL})` : "❌ MISSING");
console.log("   SUPABASE_KEY:", process.env.REACT_APP_SUPABASE_ANON_KEY ? `✅ SET (${process.env.REACT_APP_SUPABASE_ANON_KEY.substring(0, 15)}...)` : "❌ MISSING");
console.log("=".repeat(80) + "\n");

// Lazy initialization to ensure env vars are loaded
let genAIInstance = null;
let supabaseInstance = null;

const getGenAI = () => {
    console.log("🤖 [getGenAI] Called");
    if (genAIInstance) {
        console.log("   ✅ Returning cached GenAI instance");
        return genAIInstance;
    }
    if (process.env.GEMINI_API_KEY) {
        console.log("   🔧 Creating new GoogleGenerativeAI instance");
        genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log("   ✅ GenAI instance created successfully");
        return genAIInstance;
    }
    console.error("   ❌ GEMINI_API_KEY not found!");
    return null;
};

const getSupabase = () => {
    console.log("🗄️  [getSupabase] Called");
    if (supabaseInstance) {
        console.log("   ✅ Returning cached Supabase instance");
        return supabaseInstance;
    }
    const { REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY } = process.env;
    if (REACT_APP_SUPABASE_URL && REACT_APP_SUPABASE_ANON_KEY) {
        console.log("   🔧 Creating new Supabase client");
        console.log("   📍 URL:", REACT_APP_SUPABASE_URL);
        supabaseInstance = createClient(REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY);
        console.log("   ✅ Supabase client created successfully");
        return supabaseInstance;
    }
    console.error("   ❌ Supabase credentials missing!");
    return null;
};

const getModel = () => {
    console.log("🧠 [getModel] Called");
    const ai = getGenAI();
    if (!ai) {
        console.error("   ❌ GenAI instance is null, cannot create model");
        return null;
    }
    console.log("   🔧 Creating Generative Model: gemini-2.5-flash");
    console.log("   ⚙️  Config: temp=0.7, topP=0.8, topK=40, maxTokens=500");
    const model = ai.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 500,
        }
    });
    console.log("   ✅ Model created successfully");
    return model;
};

// Base system prompt (lightweight)
const BASE_PROMPT = `You are Dr. Fatima Kasamnath's AI assistant, a Speech-Language Pathologist. Be warm, concise, and professional. Use emojis (🩺📅📍). Never diagnose. Direct users to "Book Appointment" button.`;

const ADMIN_PROMPT = `You are Dr. Fatima Kasamnath's Admin AI Assistant. You have access to the dashboard data. help the admin manage appointments, services, hospitals, and sessions. Be professional, data-driven, and proactive. You can answer questions about schedules, patient details, and clinic operations using the provided context.`;

// Detect user intent (RAG)
const detectIntent = (message, isAdmin = false) => {
    console.log("🎯 [detectIntent] Analyzing message:");
    console.log("   📝 Message:", message.substring(0, 100));
    console.log("   👤 Is Admin:", isAdmin);
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
    console.log("   🎯 Intent detected:", JSON.stringify(intent, null, 2));
    return intent;
};

// Build context (RAG)
const buildContext = async (intent, userEmail = null, isAdmin = false) => {
    console.log("📚 [buildContext] Building context...");
    console.log("   👤 User Email:", userEmail || "(none)");
    console.log("   🔑 Is Admin:", isAdmin);
    const supabase = getSupabase();
    if (!supabase) {
        console.error("   ❌ Supabase client unavailable, returning fallback message");
        return 'Service information is currently being updated.';
    }

    let contextParts = [];
    try {
        if (isAdmin) {
            console.log("   🔐 Building ADMIN context");
            // Admin context: Broader access
            if (intent.needsAppointments || intent.needsAllAppointments) {
                console.log("   📅 Fetching appointments...");
                const { data, error } = await supabase
                    .from('Appointment')
                    .select('firstName,lastName,preferredDate,preferredTime,appointmentType,status')
                    .order('preferredDate', { ascending: true })
                    .limit(10);
                if (error) console.error("     ❌ Appointment fetch error:", error);
                if (data?.length) {
                    console.log(`     ✅ Found ${data.length} appointments`);
                    contextParts.push(`UPCOMING APPOINTMENTS: ${data.map(a => `${a.firstName} ${a.lastName} on ${a.preferredDate} at ${a.preferredTime} (${a.appointmentType}) - Status: ${a.status || 'pending'}`).join('\n')}`);
                } else {
                    console.log("     ℹ️  No appointments found");
                }
            }

            if (intent.needsServices) {
                console.log("   🏥 Fetching services...");
                const { data, error } = await supabase.from('services').select('title,price,duration').limit(10);
                if (error) console.error("     ❌ Services fetch error:", error);
                if (data?.length) {
                    console.log(`     ✅ Found ${data.length} services`);
                    contextParts.push(`SERVICES: ${data.map(s => `${s.title} (₹${s.price}, ${s.duration})`).join(', ')}`);
                }
            }

            if (intent.needsLocations) {
                console.log("   🏨 Fetching hospitals/locations...");
                const { data, error } = await supabase.from('hospitals').select('name,address').limit(10);
                if (error) console.error("     ❌ Hospitals fetch error:", error);
                if (data?.length) {
                    console.log(`     ✅ Found ${data.length} hospitals`);
                    contextParts.push(`HOSPITALS/LOCATIONS: ${data.map(h => `${h.name} at ${h.address}`).join('; ')}`);
                }
            }

            if (intent.needsSessions) {
                console.log("   💬 Fetching sessions...");
                const { data, error } = await supabase.from('sessions').select('user_id,date,time').order('date', { ascending: false }).limit(5);
                if (error) console.error("     ❌ Sessions fetch error:", error);
                if (data?.length) {
                    console.log(`     ✅ Found ${data.length} sessions`);
                    contextParts.push(`RECENT SESSIONS: ${data.map(s => `User ID: ${s.user_id} on ${s.date} at ${s.time}`).join('\n')}`);
                }
            }

            if (intent.needsAnalytics) {
                console.log("   📊 Fetching analytics...");
                const { count: apptCount, error: e1 } = await supabase.from('Appointment').select('*', { count: 'exact', head: true });
                const { count: userCount, error: e2 } = await supabase.from('user_dashboard').select('*', { count: 'exact', head: true });
                if (e1) console.error("     ❌ Appointment count error:", e1);
                if (e2) console.error("     ❌ User count error:", e2);
                console.log(`     ✅ Appointments: ${apptCount}, Users: ${userCount}`);
                contextParts.push(`QUICK STATS: Total Appointments: ${apptCount || 0}, Total Registered Users: ${userCount || 0}.`);
            }
        } else {
            console.log("   👥 Building PATIENT context");
            // Patient context: Limited access
            if (intent.needsAppointments && userEmail) {
                console.log("   📅 Fetching user appointments for:", userEmail);
                const { data, error } = await supabase
                    .from('Appointment')
                    .select('preferredDate,preferredTime,appointmentType')
                    .eq('email', userEmail)
                    .gte('preferredDate', new Date().toISOString().split('T')[0])
                    .order('preferredDate', { ascending: true })
                    .limit(3);

                if (error) console.error("     ❌ User appointments fetch error:", error);
                if (data?.length) {
                    console.log(`     ✅ Found ${data.length} user appointments`);
                    contextParts.push(`USER APPOINTMENTS: You have appointments on ${data.map(a => `${a.preferredDate} at ${a.preferredTime} (${a.appointmentType})`).join(', ')}.`);
                } else {
                    console.log("     ℹ️  No upcoming user appointments");
                    contextParts.push(`USER APPOINTMENTS: No upcoming appointments found for ${userEmail}.`);
                }
            }

            if (intent.needsServices) {
                console.log("   🏥 Fetching services (patient view)...");
                const { data, error } = await supabase.from('services').select('title,description').limit(5);
                if (error) console.error("     ❌ Services fetch error:", error);
                if (data?.length) {
                    console.log(`     ✅ Found ${data.length} services`);
                    contextParts.push(`SERVICES: ${data.map(s => s.title).join(', ')}`);
                }
            }
            if (intent.needsLocations) {
                console.log("   🏨 Fetching locations (patient view)...");
                const { data, error } = await supabase.from('hospitals').select('name,address').limit(5);
                if (error) console.error("     ❌ Locations fetch error:", error);
                if (data?.length) {
                    console.log(`     ✅ Found ${data.length} locations`);
                    contextParts.push(`LOCATIONS: ${data.map(h => `${h.name} at ${h.address}`).join('; ')}`);
                }
            }
        }

        if (intent.needsHours || contextParts.length === 0) {
            console.log("   🕐 Adding hours info");
            contextParts.push(`HOURS: Mon-Fri 8am-8pm, Sat 9am-2pm.`);
        }
    } catch (err) {
        console.error("   ❌ RAG Error:", err);
        console.error("   📚 Stack trace:", err.stack);
    }
    const finalContext = contextParts.join('\n');
    console.log("   ✅ Final context (" + finalContext.length + " chars):");
    console.log("   " + finalContext.substring(0, 200) + "...");
    return finalContext;
};

export const handleChat = async (req, res) => {
    console.log("\n" + "=".repeat(80));
    console.log("💬 [handleChat] NEW REQUEST");
    console.log("=".repeat(80));
    console.log("📥 Request body keys:", Object.keys(req.body));

    const model = getModel();
    if (!model) {
        console.error("❌ [handleChat] Model initialization failed - API Key missing or invalid");
        return res.status(500).json({ response: "I'm sorry, my AI brain is currently offline. Please contact us directly at info@fatimakasamnath.com." });
    }

    const { isAdmin } = req.body;
    console.log("🔑 Is Admin Request:", isAdmin);

    try {
        const { message, history, userEmail } = req.body;
        console.log("📝 Message:", message?.substring(0, 100));
        console.log("📜 History length:", history?.length || 0);
        console.log("👤 User email:", userEmail || "(none)");

        if (!message) {
            console.error("❌ No message in request");
            return res.status(400).json({ error: "Message required" });
        }

        const intent = detectIntent(message, isAdmin);
        const relevantContext = await buildContext(intent, userEmail, isAdmin);

        const activePrompt = isAdmin ? ADMIN_PROMPT : BASE_PROMPT;
        console.log("🎭 Active prompt type:", isAdmin ? "ADMIN" : "BASE");

        // Filter history to ensure it's valid for Gemini (must alternate user/model)
        const chatHistory = (history || []).filter(h => h.role === 'user' || h.role === 'model');
        console.log("📜 Filtered history length:", chatHistory.length);

        // Start chat
        console.log("🚀 Starting chat session...");
        const chat = model.startChat({ history: chatHistory });
        console.log("✅ Chat session started");

        // Build the prompt with instructions
        const finalPrompt = chatHistory.length === 0
            ? `${activePrompt}\n\nCONTEXT:\n${relevantContext}\n\nUSER: ${message}`
            : `(Update Context: ${relevantContext})\nUSER: ${message}`;
        console.log("📨 Final prompt length:", finalPrompt.length, "chars");
        console.log("📨 Is first message:", chatHistory.length === 0);
        console.log("📨 Prompt preview:", finalPrompt.substring(0, 150) + "...");

        console.log("🔄 Sending message to Gemini...");
        const result = await chat.sendMessage(finalPrompt);
        console.log("✅ Received response from Gemini");
        const response = await result.response;
        const text = response.text();
        console.log("📤 Response text length:", text.length, "chars");
        console.log("📤 Response preview:", text.substring(0, 100) + "...");

        console.log("✅ [handleChat] Request completed successfully");
        console.log("=".repeat(80) + "\n");
        return res.json({ response: text });
    } catch (error) {
        console.error("\n" + "🔥".repeat(40));
        console.error("❌ AI CHAT ERROR CAUGHT");
        console.error("🔥".repeat(40));
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        console.error("Stack trace:", error.stack);
        console.error("🔥".repeat(40) + "\n");

        // Final fallback to keep the UI from breaking
        const fallbackMessage = isAdmin
            ? "I encountered an error accessing the dashboard data. Please try again or check the database directly."
            : "I'm experiencing a small technical glitch, but I'd love to help! You can book an appointment using the button above, or see our hours: Mon-Fri 8am-8pm. What else can I tell you about Dr. Fatima's practice?";

        console.log("📤 Sending fallback response:", fallbackMessage);
        console.log("=".repeat(80) + "\n");
        return res.json({ response: fallbackMessage });
    }
}
