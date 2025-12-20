import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import { oAuth2Client, setOAuthToken, createMeeting } from "./calendar.mjs"
import { handleChat } from "./aiHandler.mjs"

const app = express()
const port = process.env.PORT || 3001

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

// Step 4: AI Chat Endpoint
app.post("/api/chat", handleChat)

// Step 5: Razorpay Endpoints
app.post("/api/payment/create-order", createOrder)
app.post("/api/payment/verify", verifyPayment)

// Export the app for Vercel
export default app;
