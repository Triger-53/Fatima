import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"

// 🔍 ULTRA DEBUG: Safe imports with error handling
let oAuth2Client, setOAuthToken, createMeeting;
let calendarAvailable = false;

try {
	const calendarModule = await import("./calendar.mjs");
	oAuth2Client = calendarModule.oAuth2Client;
	setOAuthToken = calendarModule.setOAuthToken;
	createMeeting = calendarModule.createMeeting;
	calendarAvailable = true;
	console.log("✅ Calendar module loaded successfully");
} catch (err) {
	console.error("⚠️ Calendar module failed to load:", err.message);
	console.error("   This is okay - calendar features will be unavailable");
	// Create stub functions
	createMeeting = async () => { throw new Error("Calendar features unavailable"); };
}

let handleChat;
try {
	const chatModule = await import("./aiHandler.mjs");
	handleChat = chatModule.handleChat;
	console.log("✅ AI Handler loaded successfully");
} catch (err) {
	console.error("❌ CRITICAL: AI Handler failed to load:", err);
	console.error("   Stack:", err.stack);
	// Create emergency fallback
	handleChat = async (req, res) => {
		console.error("🚨 EMERGENCY FALLBACK: AI Handler not loaded");
		res.status(500).json({
			response: "I'm sorry, the AI service is currently unavailable. Please try again later or contact support.",
			error: "AI_HANDLER_NOT_LOADED",
			details: err.message
		});
	};
}

// 🔍 ULTRA DEBUG: Vercel API Entry Point
console.log("\n" + "=".repeat(80));
console.log("🚀 VERCEL API HANDLER INITIALIZED");
console.log("=".repeat(80));
console.log("📋 Environment Check:");
console.log("   NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("   VERCEL:", process.env.VERCEL ? "✅ Running on Vercel" : "❌ Not on Vercel");
console.log("   PORT:", process.env.PORT || "3001 (default)");
console.log("=".repeat(80) + "\n");

const app = express()
const port = process.env.PORT || 3001

// Request logging middleware (must be AFTER json parsing)
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
	console.log(`\n📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
	const bodyStr = req.body ? JSON.stringify(req.body, null, 2) : "(no body)";
	console.log("   Body preview:", bodyStr.substring(0, 200));
	next();
});

// Step 1: Redirect user to Google consent screen
app.get("/auth", async (req, res) => {
	try {
		const host = req.get('host');
		const { getAuthUrl } = await import('./calendar.mjs');
		const url = getAuthUrl(host);
		res.redirect(url);
	} catch (error) {
		console.error("Auth error:", error);
		res.status(500).json({ error: error.message, stack: error.stack });
	}
})

// Step 2: OAuth callback
app.get("/oauth2callback", async (req, res) => {
	try {
		const code = req.query.code;
		const host = req.get('host');
		// Vercel usually provides x-forwarded-proto, let's use a safer approach for protocol
		const protocol = host.includes('localhost') ? 'http' : 'https';

		// Use a temporary client with the correct redirect URI for this host
		const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

		if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
			throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET on server");
		}

		const { google } = await import('googleapis');
		const tempClient = new google.auth.OAuth2(
			GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET,
			`${protocol}://${host}/oauth2callback`
		);

		const { tokens } = await tempClient.getToken(code);
		const { setOAuthToken } = await import('./calendar.mjs');
		await setOAuthToken(tokens);

		res.send("Authorization successful! You can now create meetings. Your token has been saved to Supabase (if configured) and localized storage.");
	} catch (error) {
		console.error("Callback error:", error);
		res.status(500).json({ error: error.message, stack: error.stack });
	}
})

// Step 3: Create a meeting
app.post("/create-meeting", async (req, res) => {
	const { patientEmail, startDateTime, endDateTime } = req.body

	if (!patientEmail || !startDateTime || !endDateTime) {
		return res.status(400).json({ error: "Missing required fields" })
	}

	try {
		const meetLink = await createMeeting(
			patientEmail,
			startDateTime,
			endDateTime
		)
		res.status(200).json({ meetLink })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

// Safe Razorpay imports
let createOrder, verifyPayment;
try {
	const razorpayModule = await import("./razorpayHandler.mjs");
	createOrder = razorpayModule.createOrder;
	verifyPayment = razorpayModule.verifyPayment;
	console.log("✅ Razorpay module loaded successfully");
} catch (err) {
	console.error("⚠️ Razorpay module failed to load:", err.message);
	createOrder = async (req, res) => res.status(500).json({ error: "Payment features unavailable" });
	verifyPayment = async (req, res) => res.status(500).json({ error: "Payment features unavailable" });
}

// Step 4: AI Chat Endpoint with comprehensive error handling
app.post("/api/chat", async (req, res) => {
	console.log("💬 [VERCEL] Chat endpoint hit");
	try {
		await handleChat(req, res);
		console.log("✅ [VERCEL] Chat handler completed");
	} catch (error) {
		console.error("\n" + "🔥".repeat(40));
		console.error("❌ [VERCEL] CHAT ENDPOINT ERROR");
		console.error("🔥".repeat(40));
		console.error("Error name:", error.name);
		console.error("Error message:", error.message);
		console.error("Error stack:", error.stack);
		console.error("Request path:", req.path);
		console.error("Request method:", req.method);
		console.error("Request body:", JSON.stringify(req.body, null, 2));
		console.error("🔥".repeat(40) + "\n");

		// Only send response if not already sent
		if (!res.headersSent) {
			res.status(500).json({
				error: "Internal Server Error",
				message: error.message,
				stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
			});
		}
	}
})

// Step 5: Razorpay Endpoints
app.post("/api/payment/create-order", createOrder)
app.post("/api/payment/verify", verifyPayment)

// Global error handler to catch EVERYTHING and prevent HTML responses
app.use((err, req, res, next) => {
	console.error("\n" + "🚨".repeat(40));
	console.error("🚨 GLOBAL ERROR HANDLER CAUGHT UNHANDLED ERROR");
	console.error("🚨".repeat(40));
	console.error("Error:", err);
	console.error("Stack:", err.stack);
	console.error("Path:", req.path);
	console.error("Method:", req.method);
	console.error("🚨".repeat(40) + "\n");

	if (!res.headersSent) {
		res.status(500).json({
			error: "Internal Server Error",
			message: err.message || "An unexpected error occurred",
			path: req.path,
			timestamp: new Date().toISOString()
		});
	}
});

// Catch-all for 404s
app.use((req, res) => {
	console.log("❓ 404 Not Found:", req.method, req.path);
	res.status(404).json({
		error: "Not Found",
		path: req.path,
		message: "The requested endpoint does not exist"
	});
});

// Process-level error handlers
process.on('unhandledRejection', (reason, promise) => {
	console.error('🚨 Unhandled Rejection:', reason);
	console.error('   Promise:', promise);
});

process.on('uncaughtException', (error) => {
	console.error('🚨 Uncaught Exception:', error);
	console.error('   Stack:', error.stack);
});

// Export the app for Vercel
export default app;
