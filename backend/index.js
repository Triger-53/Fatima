import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Import calendar functions with error handling
let oAuth2Client, setOAuthToken, createMeeting;
try {
	const calendarModule = await import("./calendar.js");
	oAuth2Client = calendarModule.oAuth2Client;
	setOAuthToken = calendarModule.setOAuthToken;
	createMeeting = calendarModule.createMeeting;
} catch (err) {
	console.error("⚠️  Calendar module failed to load:", err.message);
	// Create stub functions so the server can still run
	createMeeting = async () => { throw new Error("Calendar features unavailable"); };
}

// Import chat handler
const { handleChat } = await import("./aiHandler.js");

// Import payment handlers
const { createOrder, verifyPayment } = await import("./razorpayHandler.js");

// Step 1: Redirect user to Google consent screen
app.get("/auth", (req, res) => {
	if (!oAuth2Client) {
		return res.status(500).send("Calendar auth unavailable");
	}
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: "offline",
		scope: ["https://www.googleapis.com/auth/calendar"],
	})
	res.redirect(authUrl)
})

// Step 2: OAuth callback
app.get("/oauth2callback", async (req, res) => {
	if (!oAuth2Client || !setOAuthToken) {
		return res.status(500).send("Calendar auth unavailable");
	}
	const code = req.query.code
	const { tokens } = await oAuth2Client.getToken(code)
	setOAuthToken(tokens)
	res.send("Authorization successful! You can now create meetings.")
})

// Step 3: Create a meeting
app.post("/create-meeting", async (req, res) => {
	const { patientEmail, startDateTime, endDateTime, consultationMethod, appointmentType } = req.body

	if (!patientEmail || !startDateTime || !endDateTime) {
		return res.status(400).json({ error: "Missing required fields" })
	}

	try {
		const result = await createMeeting(
			patientEmail,
			startDateTime,
			endDateTime,
			consultationMethod,
			appointmentType
		)
		res.status(200).json(result)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

// Step 4: AI Chat Endpoint
app.post("/api/chat", async (req, res, next) => {
	console.log("📥 Received Chat Request:", JSON.stringify({
		message: req.body?.message?.substring(0, 50) + "...",
		isAdmin: req.body?.isAdmin,
		historyLength: req.body?.history?.length
	}));
	try {
		await handleChat(req, res);
	} catch (err) {
		next(err);
	}
})

// Step 5: Razorpay Endpoints
app.post("/api/payment/create-order", createOrder)
app.post("/api/payment/verify", verifyPayment)

// Global Error Handler
app.use((err, req, res, next) => {
	console.error("🔥 Global Error Caught:", err);
	res.status(500).json({
		error: "Internal Server Error",
		details: err.message,
		stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
	});
});

// Prevent process from crashing on unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
	console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
	console.error('🚨 Uncaught Exception:', error);
});

app.listen(port, () => {
	console.log(`✅ Server running at http://localhost:${port}`)
	console.log(`📍 Go to http://localhost:${port}/auth to authorize your Gmail`)
})
