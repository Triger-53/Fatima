
import dotenv from "dotenv"
dotenv.config()
import { google } from "googleapis"
import fs from "fs-extra"
import path from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TOKEN_PATH = path.join(__dirname, "tokens.json")

const {
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_REDIRECT_URI,
	REACT_APP_SUPABASE_URL,
	REACT_APP_SUPABASE_ANON_KEY
} = process.env

// Safely initialize Supabase
const supabase = (REACT_APP_SUPABASE_URL && REACT_APP_SUPABASE_ANON_KEY)
	? createClient(REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY)
	: null;

if (!supabase) {
	console.warn("⚠️ Supabase client not initialized. Check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.");
}

// Safely initialize OAuth2 client
export const oAuth2Client = (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
	? new google.auth.OAuth2(
		GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET,
		GOOGLE_REDIRECT_URI || 'http://localhost:3001/oauth2callback'
	)
	: null;

if (!oAuth2Client) {
	console.warn("⚠️ Google OAuth client not initialized. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
}

// Helper to update redirect URI at runtime based on request host
export const getAuthUrl = (host) => {
	const protocol = host.includes('localhost') ? 'http' : 'https';
	const redirectUri = `${protocol}://${host}/oauth2callback`;

	// Create a temporary client with the correct redirect URI
	const tempClient = new google.auth.OAuth2(
		GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET,
		redirectUri
	);

	return tempClient.generateAuthUrl({
		access_type: "offline",
		prompt: 'consent', // Force consent so we always get a refresh token
		scope: ["https://www.googleapis.com/auth/calendar"],
	});
};

// Load token from Supabase or Disk
let TOKEN = null

async function loadToken() {
	try {
		if (fs.existsSync(TOKEN_PATH)) {
			TOKEN = fs.readJsonSync(TOKEN_PATH);
			console.log("✅ OAuth token loaded from disk");
		} else if (supabase) {
			const { data, error } = await supabase
				.from('Config')
				.select('value')
				.eq('key', 'google_token')
				.single();

			if (data && data.value) {
				TOKEN = data.value;
				console.log("✅ OAuth token loaded from Supabase");
			}
		}

		if (TOKEN && oAuth2Client) {
			oAuth2Client.setCredentials(TOKEN);
		}
	} catch (err) {
		console.warn("Could not load token:", err.message);
	}
}

// Initialize loading
loadToken();

// Listen for token updates (refreshes) and save them
if (oAuth2Client) {
	oAuth2Client.on("tokens", (tokens) => {
		console.log("♻️  OAuth tokens refreshed/updated")
		const updatedToken = { ...TOKEN, ...tokens }
		setOAuthToken(updatedToken)
	})
}

export async function setOAuthToken(token) {
	TOKEN = token
	if (oAuth2Client) oAuth2Client.setCredentials(TOKEN);

	try {
		fs.writeJsonSync(TOKEN_PATH, TOKEN)
		console.log("💾 OAuth token saved to disk")
	} catch (err) { }

	if (supabase) {
		try {
			const { error } = await supabase
				.from('Config')
				.upsert({ key: 'google_token', value: TOKEN }, { onConflict: 'key' });

			if (error) throw error;
			console.log("💾 OAuth token saved to Supabase");
		} catch (err) {
			console.error("Error saving token to Supabase:", err.message);
		}
	}
}

// Create a Google Calendar event with Meet link
export async function createMeeting(patientEmail, startDateTime, endDateTime) {
	if (!oAuth2Client) {
		throw new Error("Google OAuth client not initialized. Check server environment variables.");
	}
	if (!TOKEN) {
		await loadToken(); // Double check before failing
		if (!TOKEN) throw new Error("OAuth token not set. Authorize first.");
	}

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
			calendarId: "primary",
			resource: event,
			conferenceDataVersion: 1,
		})

		return response.data.hangoutLink
	} catch (error) {
		console.error("Error creating calendar event:", error)
		throw new Error("Failed to create calendar event.")
	}
}
