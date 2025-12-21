import dotenv from "dotenv"
dotenv.config()

import { google } from "googleapis"

import fs from "fs-extra"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TOKEN_PATH = path.join(__dirname, "tokens.json")

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
	process.env

// Create OAuth2 client
export const oAuth2Client = new google.auth.OAuth2(
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_REDIRECT_URI
)

// Load token from file at startup
let TOKEN = null
try {
	if (fs.existsSync(TOKEN_PATH)) {
		const savedToken = fs.readJsonSync(TOKEN_PATH)
		if (savedToken) {
			TOKEN = savedToken
			oAuth2Client.setCredentials(TOKEN)
			console.log("✅ OAuth token loaded from disk")
		}
	}
} catch (err) {
	console.error("Error loading token from disk:", err)
}

// Listen for token updates (refreshes) and save them
oAuth2Client.on("tokens", (tokens) => {
	console.log("♻️  OAuth tokens refreshed/updated")
	const updatedToken = { ...TOKEN, ...tokens }
	setOAuthToken(updatedToken)
})

export function setOAuthToken(token) {
	TOKEN = token
	oAuth2Client.setCredentials(TOKEN)
	// Persist to disk
	try {
		fs.writeJsonSync(TOKEN_PATH, TOKEN)
		console.log("💾 OAuth token saved to disk")
	} catch (err) {
		console.error("Error saving token to disk:", err)
	}
}

// Create a Google Calendar event with optional Meet link
export async function createMeeting(patientEmail, startDateTime, endDateTime, consultationMethod = 'online', appointmentType = 'Consultation') {
	if (!TOKEN) throw new Error("OAuth token not set. Authorize first.")

	const calendar = google.calendar({ version: "v3", auth: oAuth2Client })

	const isOnline = consultationMethod === 'online'
	const event = {
		summary: `${appointmentType} (${isOnline ? 'Online' : 'In-Person'})`,
		description: `Consultation with Dr. Fatima Kasamnath. Method: ${isOnline ? 'Google Meet' : 'In-Person at Clinic'}.`,
		start: { dateTime: startDateTime, timeZone: "Asia/Kolkata" },
		end: { dateTime: endDateTime, timeZone: "Asia/Kolkata" },
		// Removed attendees to prevent exposing Dr. Fatima's email in calendar invites
	}

	if (isOnline) {
		event.conferenceData = {
			createRequest: {
				requestId: `create-meeting-${Date.now()}`,
				conferenceSolutionKey: { type: "hangoutsMeet" },
			},
		}
	}

	try {
		const response = await calendar.events.insert({
			calendarId: "primary", // Use personal Gmail calendar
			resource: event,
			conferenceDataVersion: isOnline ? 1 : 0,
			sendUpdates: 'all', // This ensures email invitations are sent
		})

		return {
			meetLink: response.data.hangoutLink || null,
			eventId: response.data.id
		}
	} catch (error) {
		console.error("Error creating calendar event:", error)
		throw new Error("Failed to create calendar event.")
	}
}
