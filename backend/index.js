import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import { oAuth2Client, setOAuthToken, createMeeting } from "./calendar.js"
import { handleChat } from "./aiHandler.js"

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Step 1: Redirect user to Google consent screen
app.get("/auth", (req, res) => {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: "offline",
		scope: ["https://www.googleapis.com/auth/calendar"],
	})
	res.redirect(authUrl)
})

// Step 2: OAuth callback
app.get("/oauth2callback", async (req, res) => {
	const code = req.query.code
	const { tokens } = await oAuth2Client.getToken(code)
	setOAuthToken(tokens)
	res.send("Authorization successful! You can now create meetings.")
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

import { createOrder, verifyPayment } from "./razorpayHandler.js"

// Step 4: AI Chat Endpoint
app.post("/api/chat", handleChat)

// Step 5: Razorpay Endpoints
app.post("/api/payment/create-order", createOrder)
app.post("/api/payment/verify", verifyPayment)

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`)
	console.log(`Go to http://localhost:${port}/auth to authorize your Gmail`)
})
