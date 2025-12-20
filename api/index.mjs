import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import { oAuth2Client, setOAuthToken, createMeeting } from "./calendar.mjs"
import { handleChat } from "./aiHandler.mjs"

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

// Request logging middleware
app.use((req, res, next) => {
	console.log(`\n📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
	console.log("   Headers:", JSON.stringify(req.headers, null, 2));
	console.log("   Query:", JSON.stringify(req.query));
	console.log("   Body preview:", JSON.stringify(req.body, null, 2).substring(0, 200));
	next();
});

app.use(cors())
app.use(express.json())

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

import { createOrder, verifyPayment } from "./razorpayHandler.mjs"

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

// Export the app for Vercel
export default app;
