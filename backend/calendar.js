import dotenv from "dotenv"
dotenv.config()

import { google } from "googleapis"

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
	process.env

// Create OAuth2 client
export const oAuth2Client = new google.auth.OAuth2(
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_REDIRECT_URI
)

// Store token after user authorizes
let TOKEN = null

export function setOAuthToken(token) {
	TOKEN = token
	oAuth2Client.setCredentials(TOKEN)
}

// Create a Google Calendar event with Meet link
export async function createMeeting(patientEmail, startDateTime, endDateTime) {
	if (!TOKEN) throw new Error("OAuth token not set. Authorize first.")

	const calendar = google.calendar({ version: "v3", auth: oAuth2Client })

	const event = {
		summary: "Patient Consultation",
		description: "Private consultation",
		start: { dateTime: startDateTime, timeZone: "Asia/Kolkata" },
		end: { dateTime: endDateTime, timeZone: "Asia/Kolkata" },
		attendees: [{ email: patientEmail }],
		conferenceData: {
			createRequest: {
				requestId: `create-meeting-${Date.now()}`,
				conferenceSolutionKey: { type: "hangoutsMeet" },
			},
		},
	}

	try {
		const response = await calendar.events.insert({
			calendarId: "primary", // Use personal Gmail calendar
			resource: event,
			conferenceDataVersion: 1,
		})

		return response.data.hangoutLink
	} catch (error) {
		console.error("Error creating calendar event:", error)
		throw new Error("Failed to create calendar event.")
	}
}
